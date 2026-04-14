import YAML from 'yaml';
import { ControllerResponse } from '@/models/ControllerResponse';
import {
  EndpointResponse,
  EndpointParameterResponse,
} from '@/models/EndpointResponse';
import {
  OpenAPIDocument,
  PathItemObject,
  OperationObject,
  HTTP_METHODS,
  HttpMethod,
  isReferenceObject,
} from '../models/openapi.types';
import { extractParameters } from './parameter-extractor';
import { extractRequestBodyAttributes, extractResponseAttributes } from './schema-extractor';

function resolveRef(root: any, ref: string): any {
  const path = ref.replace(/^#\//, '').split('/');
  let current = root;
  path.some((segment) => {
    current = current?.[segment];
    return current === undefined;
  });
  return current;
}

function dereferenceObject(
  root: any,
  obj: any,
  visited: Set<any> = new Set(),
  refStack: Set<string> = new Set(),
): any {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (visited.has(obj)) return obj;
  visited.add(obj);

  if (obj.$ref && typeof obj.$ref === 'string') {
    // Referencia circular detectada: no resolver, devolver como objeto con tipo referencia
    if (refStack.has(obj.$ref)) {
      const refName = obj.$ref.replace(/^#\/components\/schemas\//, '');
      return { type: 'object', title: refName, _circularRef: obj.$ref };
    }
    const resolved = resolveRef(root, obj.$ref);
    if (resolved) {
      refStack.add(obj.$ref);
      const result = dereferenceObject(root, JSON.parse(JSON.stringify(resolved)), new Set(), refStack);
      refStack.delete(obj.$ref);
      return result;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => dereferenceObject(root, item, visited, refStack));
  }

  const result: any = {};
  Object.keys(obj).forEach((key) => {
    result[key] = dereferenceObject(root, obj[key], visited, refStack);
  });
  return result;
}

function parseOpenApiContent(content: string): OpenAPIDocument {
  let parsed: any;
  const trimmed = content.trim();

  if (trimmed.startsWith('{')) {
    parsed = JSON.parse(trimmed);
  } else {
    parsed = YAML.parse(trimmed);
  }

  return dereferenceObject(parsed, parsed) as OpenAPIDocument;
}

function getOperationHttpVerb(method: HttpMethod): string {
  return method.toUpperCase();
}

function getControllerNameFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'default';
  return segments[0];
}

function getBasePath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  return `/${segments[0]}`;
}

function getRelativeMapping(fullPath: string, basePath: string): string {
  if (fullPath === basePath) return '';
  return fullPath.substring(basePath.length) || '';
}

interface ControllerGroup {
  name: string;
  basePath: string;
  operations: Array<{
    path: string;
    method: HttpMethod;
    operation: OperationObject;
    pathItem: PathItemObject;
  }>;
}

function groupPathsByController(openapi: OpenAPIDocument): ControllerGroup[] {
  const groups: Record<string, ControllerGroup> = {};

  if (!openapi.paths) return [];

  Object.entries(openapi.paths).forEach(([path, pathItem]) => {
    if (!pathItem || isReferenceObject(pathItem)) return;

    HTTP_METHODS.forEach((method) => {
      const operation = (pathItem as any)[method] as OperationObject | undefined;
      if (!operation) return;

      const tag = operation.tags && operation.tags.length > 0
        ? operation.tags[0]
        : getControllerNameFromPath(path);

      if (!groups[tag]) {
        groups[tag] = {
          name: tag,
          basePath: getBasePath(path),
          operations: [],
        };
      }

      groups[tag].operations.push({
        path,
        method,
        operation,
        pathItem: pathItem as PathItemObject,
      });
    });
  });

  return Object.values(groups);
}

function getSchemaNameFromRef(ref: string): string | null {
  const match = ref.match(/^#\/components\/schemas\/(.+)$/);
  return match ? match[1] : null;
}

function getSchemaRefFromContent(content: any): string | null {
  if (!content) return null;
  const mediaType = content['application/json'] || Object.values(content)[0];
  if (!mediaType?.schema) return null;

  if (mediaType.schema.$ref) {
    return getSchemaNameFromRef(mediaType.schema.$ref);
  }

  if (mediaType.schema.type === 'array' && mediaType.schema.items?.$ref) {
    return getSchemaNameFromRef(mediaType.schema.items.$ref);
  }

  return null;
}

function buildEndpointResponse(
  path: string,
  method: HttpMethod,
  operation: OperationObject,
  pathItem: PathItemObject,
  basePath: string,
  rawOperation?: any,
  rawPathItem?: any,
): EndpointResponse {
  let parameters: EndpointParameterResponse[] = [];

  const allParams = [
    ...(pathItem.parameters || []),
    ...(operation.parameters || []),
  ];

  if (allParams.length > 0) {
    // Extraer mappings de parámetros desde x-apigen-binding del path
    // Formato: { ownerId: "Owner.id", petId: "Pet.id", ... } (excluir "model")
    const binding = rawPathItem?.['x-apigen-binding'] || {};
    const bindingMappings: Record<string, string> = {};
    Object.entries(binding).forEach(([k, v]) => {
      if (k !== 'model' && typeof v === 'string') bindingMappings[k] = v as string;
    });
    parameters = extractParameters(allParams, Object.keys(bindingMappings).length > 0 ? bindingMappings : undefined);
  }

  let requestBody: EndpointResponse['request_body'];
  if (operation.requestBody) {
    const extracted = extractRequestBodyAttributes(operation.requestBody, rawOperation?.requestBody);
    if (extracted) {
      const requestSchemaRef = rawOperation?.requestBody
        ? getSchemaRefFromContent(rawOperation.requestBody.content)
        : null;
      requestBody = {
        entity: extracted.entity,
        attributes: extracted.attributes,
        schema_ref: requestSchemaRef || undefined,
      };
    }
  }

  let responseData: EndpointResponse['response_data'];
  if (operation.responses) {
    const extracted = extractResponseAttributes(operation.responses, rawOperation?.responses);
    if (extracted) {
      let responseSchemaRef: string | null = null;
      if (rawOperation?.responses) {
        const successResp = rawOperation.responses['200']
          || rawOperation.responses['201']
          || rawOperation.responses['202'];
        if (successResp) {
          responseSchemaRef = getSchemaRefFromContent(successResp.content);
        }
      }
      responseData = {
        attributes: extracted.attributes,
        response_schema: extracted.responseSchema,
        schema_ref: responseSchemaRef || undefined,
      };
    }
  }

  const mapping = getRelativeMapping(path, basePath);

  return {
    operation: getOperationHttpVerb(method),
    mapping,
    entity: '',
    summary: operation.summary || '',
    description: operation.description || '',
    source: 'swagger',
    parameters: parameters.length > 0 ? parameters : undefined,
    request_body: requestBody,
    response_data: responseData,
  };
}

function extractControllers(openapi: OpenAPIDocument, rawDocument?: any): ControllerResponse[] {
  const groups = groupPathsByController(openapi);

  return groups.map((group) => {
    const endpoints: EndpointResponse[] = group.operations.map((op) => {
      const rawPathItem = rawDocument?.paths?.[op.path];
      const rawOperation = rawPathItem?.[op.method];
      return buildEndpointResponse(
        op.path,
        op.method,
        op.operation,
        op.pathItem,
        group.basePath,
        rawOperation,
        rawPathItem,
      );
    });

    // Leer x-apigen-binding.model del primer path de este grupo en el raw document
    const firstRawPath = group.operations[0]
      ? rawDocument?.paths?.[group.operations[0].path]
      : undefined;
    const boundEntity: string | undefined = firstRawPath?.['x-apigen-binding']?.model || undefined;

    return {
      source: 'swagger',
      name: group.name,
      request_mapping: group.basePath,
      entity: boundEntity,
      endpoints,
    } as ControllerResponse;
  });
}

export class OpenApiParserService {
  private parsedDocument: OpenAPIDocument | null = null;

  private rawDocument: OpenAPIDocument | null = null;

  parseFile(fileContent: string): ControllerResponse[] {
    // Almacenar documento raw (con $ref preservados) para enrichment
    const trimmed = fileContent.trim();
    if (trimmed.startsWith('{')) {
      this.rawDocument = JSON.parse(trimmed) as OpenAPIDocument;
    } else {
      this.rawDocument = YAML.parse(trimmed) as OpenAPIDocument;
    }

    // Dereferenciar para extracción de controllers
    const parsed = parseOpenApiContent(fileContent);
    this.parsedDocument = parsed;
    return extractControllers(parsed, this.rawDocument);
  }

  getParsedDocument(): OpenAPIDocument | null {
    return this.parsedDocument;
  }

  getRawDocument(): OpenAPIDocument | null {
    return this.rawDocument;
  }
}

export default new OpenApiParserService();
