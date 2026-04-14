/* eslint-disable no-param-reassign */
import { EntityStoreObject } from '@/store/entities/state';
import { EntityAttributeStoreObject } from '@/store/entity-attributes/state';
import { ControllerStoreObject } from '@/store/controllers/state';
import { EndpointStoreObject } from '@/store/endpoints/state';
import { EndpointAttributeStoreObject } from '@/store/endpoint-attributes/state';
import { EndpointParameterStoreObject } from '@/store/endpoint-parameters/state';
import { OpenAPIDocument, HTTP_METHODS, isReferenceObject } from '../models/openapi.types';
import { ApigenProject } from '../models/apigen.types';
import projectGenerator, { ProjectConfig } from './apigen-project.generator';
import modelsGenerator from './apigen-models.generator';
import bindingGenerator from './apigen-binding.generator';
import mappingGenerator from './apigen-mapping.generator';

/**
 * Limpia el documento OpenAPI:
 * - Elimina propiedades x-swagger-* (artefactos de swagger-codegen)
 * Los parámetros (header, query, path) se conservan intactos.
 */
function cleanDocument(openapi: OpenAPIDocument): void {
  if (openapi.components?.schemas) {
    Object.values(openapi.components.schemas).forEach((schema) => {
      if (schema && typeof schema === 'object') {
        delete (schema as any)['x-swagger-router-model'];
      }
    });
  }

  if (!openapi.paths) return;

  Object.values(openapi.paths).forEach((pathItem) => {
    if (!pathItem || isReferenceObject(pathItem)) return;

    HTTP_METHODS.forEach((method) => {
      const operation = (pathItem as any)[method];
      if (!operation) return;
      delete operation['x-swagger-router-controller'];
    });
  });
}

/**
 * Construye un mapa de entityName (plural, DB) → schemaName (singular, OpenAPI).
 * Ej: "Pets" → "Pet", "Orders" → "Order", "Users" → "User"
 */
function buildEntityToSchemaMap(
  openapi: OpenAPIDocument,
  controllers: Record<string, ControllerStoreObject>,
): Map<string, string> {
  const entityToSchema = new Map<string, string>();

  if (!openapi.paths) return entityToSchema;

  Object.entries(openapi.paths).forEach(([path, pathItem]) => {
    if (!pathItem || isReferenceObject(pathItem)) return;

    let entity: string | undefined;
    Object.values(controllers).some((controller) => {
      if (
        controller.entity
        && controller.requestMapping
        && (path === controller.requestMapping
          || path.startsWith(`${controller.requestMapping}/`)
          || path.startsWith(`${controller.requestMapping}{`))
      ) {
        entity = controller.entity;
        return true;
      }
      return false;
    });

    if (!entity || entityToSchema.has(entity)) return;

    HTTP_METHODS.forEach((method) => {
      if (entityToSchema.has(entity!)) return;
      const operation = (pathItem as any)[method];
      if (!operation) return;

      // Buscar schema en response
      const successResp = operation.responses
        ? (operation.responses['200'] || operation.responses['201'])
        : null;
      if (successResp?.content) {
        const mt = successResp.content['application/json'] || Object.values(successResp.content)[0];
        if (mt?.schema) {
          if (mt.schema.$ref) {
            const match = mt.schema.$ref.match(/^#\/components\/schemas\/(.+)$/);
            if (match) {
              // Si el schema es per-método (tiene x-apigen-mapping.method), usar el modelo canónico
              const schemaName = match[1];
              const schemaObj = (openapi as any).components?.schemas?.[schemaName];
              const xMapping = schemaObj?.['x-apigen-mapping'];
              const canonicalName = (xMapping?.method && xMapping?.model) ? xMapping.model : schemaName;
              entityToSchema.set(entity!, canonicalName);
            }
          } else if (mt.schema.type === 'array' && mt.schema.items?.$ref) {
            const match = mt.schema.items.$ref.match(/^#\/components\/schemas\/(.+)$/);
            if (match) entityToSchema.set(entity!, match[1]);
          }
        }
      }

      // Buscar schema en requestBody
      if (!entityToSchema.has(entity!) && operation.requestBody?.content) {
        const mt = operation.requestBody.content['application/json']
          || Object.values(operation.requestBody.content)[0];
        if (mt?.schema?.$ref) {
          const match = mt.schema.$ref.match(/^#\/components\/schemas\/(.+)$/);
          if (match) {
            const schemaName = match[1];
            const schemaObj = (openapi as any).components?.schemas?.[schemaName];
            const xMapping = schemaObj?.['x-apigen-mapping'];
            const canonicalName = (xMapping?.method && xMapping?.model) ? xMapping.model : schemaName;
            entityToSchema.set(entity!, canonicalName);
          }
        }
      }
    });
  });

  return entityToSchema;
}

function getSchemaNameFromRef(ref: string): string | null {
  const match = ref.match(/^#\/components\/schemas\/(.+)$/);
  return match ? match[1] : null;
}

/**
 * Builds a map of relation name overrides: entityName → (dbAttrName → openapiPropName).
 * For relations where the DB attribute name differs from the OpenAPI property name
 * (e.g., DB "visit2" → OpenAPI "visit", DB "pets2" → OpenAPI "pet").
 */
function buildRelationNameOverrides(
  openapi: OpenAPIDocument,
  entities: Record<string, EntityStoreObject>,
  entityAttributes: Record<string, EntityAttributeStoreObject>,
  entityToSchema: Map<string, string>,
): Map<string, Map<string, string>> {
  const overrides = new Map<string, Map<string, string>>();

  if (!openapi.components?.schemas) return overrides;

  Object.values(entities).forEach((entity) => {
    if (!entity.name) return;
    const schemaName = entityToSchema.get(entity.name);
    if (!schemaName) return;

    const schema = openapi.components!.schemas![schemaName];
    if (!schema || isReferenceObject(schema) || !(schema as any).properties) return;

    const entityOverrides = new Map<string, string>();

    if (entity.attributes) {
      (entity.attributes as any[]).forEach((attrKey: any) => {
        const attr = typeof attrKey === 'string' ? entityAttributes[attrKey] : attrKey;
        if (!attr || !attr.name || !attr.relation) return;

        const foreignClass = attr.relation.foreign_class;
        const foreignSchema = entityToSchema.get(foreignClass) || foreignClass;

        // Find the OpenAPI property that references this foreign schema
        Object.entries((schema as any).properties).forEach(([propName, propValue]: [string, any]) => {
          if (!propValue) return;
          let targetSchema: string | null = null;

          if (propValue.$ref) {
            targetSchema = getSchemaNameFromRef(propValue.$ref);
          } else if (propValue.type === 'array' && propValue.items?.$ref) {
            targetSchema = getSchemaNameFromRef(propValue.items.$ref);
          }

          if (targetSchema === foreignSchema && attr.name !== propName) {
            entityOverrides.set(attr.name, propName);
          }
        });
      });
    }

    if (entityOverrides.size > 0) {
      overrides.set(entity.name, entityOverrides);
    }
  });

  return overrides;
}

export interface GenerationConfig {
  project: ProjectConfig;
  entities: Record<string, EntityStoreObject>;
  entityAttributes: Record<string, EntityAttributeStoreObject>;
  controllers: Record<string, ControllerStoreObject>;
  endpoints: Record<string, EndpointStoreObject>;
  endpointAttributes: Record<string, EndpointAttributeStoreObject>;
  endpointParameters: Record<string, EndpointParameterStoreObject>;
  anonymizationConfig?: any;
}

export default function generateAllExtensions(
  openapi: OpenAPIDocument,
  config: GenerationConfig,
): OpenAPIDocument {
  const source = JSON.parse(JSON.stringify(openapi)) as OpenAPIDocument;

  // Limpiar propiedades x-swagger-* y parámetros header del original
  cleanDocument(source);

  // Construir mapa entity → schema (Pets → Pet, Orders → Order, etc.)
  const entityToSchema = buildEntityToSchemaMap(source, config.controllers);

  // Enriquecer con nombres capitalizados de tabla (ej: "pets2" → "Pets2" → "Pet")
  // para cuando foreign_class en relaciones BD usa el nombre capitalizado de la tabla
  // en vez del nombre del modelo OpenAPI (Owner2 en vez de Owner, Pets2 en vez de Pet)
  Object.values(config.entities).forEach((entity) => {
    if (!entity.name || !entity.table) return;
    const schemaName = entityToSchema.get(entity.name);
    if (!schemaName) return;
    const tableCapitalized = entity.table.charAt(0).toUpperCase() + entity.table.slice(1);
    if (!entityToSchema.has(tableCapitalized)) {
      entityToSchema.set(tableCapitalized, schemaName);
    }
  });

  // Generar x-apigen-project
  const project: ApigenProject = projectGenerator(config.project);

  // Build relation name overrides (DB attr name → OpenAPI property name)
  const relationNameOverrides = buildRelationNameOverrides(source, config.entities, config.entityAttributes, entityToSchema);

  // Generar x-apigen-models
  const models = modelsGenerator(config.entities, config.entityAttributes, entityToSchema, relationNameOverrides);

  // Aplicar x-apigen-binding a paths
  bindingGenerator(source, config.controllers, entityToSchema);

  // Obtener los nombres de los models generados (para aplicar mapping a todos)
  const modelNames = new Set(Object.keys(models));

  // Aplicar x-apigen-mapping a schemas
  mappingGenerator(
    source,
    config.controllers,
    config.endpoints,
    config.endpointAttributes,
    config.endpointParameters,
    entityToSchema,
    modelNames,
  );

  // Construir el documento final en el ORDEN EXACTO del archivo válido:
  // openapi, info, x-apigen-project, externalDocs, servers, tags, paths, components
  const result: any = {};

  // 1. openapi version
  result.openapi = source.openapi;

  // 2. info
  result.info = source.info;

  // 3. x-apigen-project (justo después de info)
  result['x-apigen-project'] = project;

  // 3b. x-anonymization-config (solo swapLists, sin pseudonymizationKey)
  if (config.anonymizationConfig) {
    const anonConfig: any = {};
    if (config.anonymizationConfig.swapLists && Object.keys(config.anonymizationConfig.swapLists).length > 0) {
      anonConfig.swapLists = config.anonymizationConfig.swapLists;
    }
    if (Object.keys(anonConfig).length > 0) {
      result['x-anonymization-config'] = anonConfig;
    }
  }

  // 4. externalDocs (si existe)
  if ((source as any).externalDocs) {
    result.externalDocs = (source as any).externalDocs;
  }

  // 5. servers
  if (source.servers) {
    result.servers = source.servers;
  }

  // 6. tags
  if ((source as any).tags) {
    result.tags = (source as any).tags;
  }

  // 7. paths (ya tienen x-apigen-binding aplicado)
  if (source.paths) {
    result.paths = source.paths;
  }

  // 8. components (con x-apigen-models ANTES de schemas)
  if (!source.components) {
    (source as any).components = {};
  }

  // Reconstruir components con x-apigen-models primero
  const newComponents: any = {
    'x-apigen-models': models,
  };

  // Copiar schemas y otras propiedades de components
  Object.entries(source.components as any).forEach(([key, value]) => {
    if (key !== 'x-apigen-models') {
      newComponents[key] = value;
    }
  });

  result.components = newComponents;

  // 9. security (si existe)
  if ((source as any).security) {
    result.security = (source as any).security;
  }

  return result as OpenAPIDocument;
}
