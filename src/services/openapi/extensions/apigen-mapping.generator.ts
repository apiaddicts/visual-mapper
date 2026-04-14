/* eslint-disable no-param-reassign */
import { ControllerStoreObject } from '@/store/controllers/state';
import { EndpointStoreObject } from '@/store/endpoints/state';
import { EndpointAttributeStoreObject } from '@/store/endpoint-attributes/state';
import { EndpointParameterStoreObject } from '@/store/endpoint-parameters/state';
import {
  OpenAPIDocument,
  isReferenceObject,
  HTTP_METHODS,
} from '../models/openapi.types';

function getSchemaNameFromRef(ref: string): string | null {
  const match = ref.match(/^#\/components\/schemas\/(.+)$/);
  return match ? match[1] : null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function fkToRelationSchema(propName: string, schemas: Record<string, any>): string | null {
  if (!propName.endsWith('_id')) return null;
  const relationName = propName.replace(/_id$/, '');
  const schemaName = `${relationName.charAt(0).toUpperCase()}${relationName.slice(1)}`;
  if (schemas[`${schemaName}Simple`]) return `${schemaName}Simple`;
  if (schemas[schemaName]) return schemaName;
  return null;
}

function resolveFieldName(propName: string, entityMappingName: string | undefined, propValue: any): string {
  // $ref properties (relations): always use the OpenAPI property name directly
  if (propValue?.$ref) return propName;
  if (entityMappingName) {
    // FK column (ends in _id) mapped to a relation name → use relation.id
    if (propName.endsWith('_id') && !entityMappingName.includes('.') && !entityMappingName.endsWith('_id')) {
      return `${entityMappingName}.id`;
    }
    return snakeToCamel(entityMappingName);
  }
  // No entity mapping — infer from property name
  if (propName.endsWith('_id')) {
    const relationName = snakeToCamel(propName.replace(/_id$/, ''));
    return `${relationName}.id`;
  }
  return snakeToCamel(propName);
}

function toSimpleRef(ref: string, schemas: Record<string, any>): string {
  const schemaName = getSchemaNameFromRef(ref);
  if (!schemaName) return ref;
  const simpleName = `${schemaName}Simple`;
  return schemas[simpleName] ? `#/components/schemas/${simpleName}` : ref;
}

function createSimpleSchemas(openapi: OpenAPIDocument, modelNames: Set<string>): void {
  if (!openapi.components?.schemas) return;
  const { schemas } = openapi.components;

  modelNames.forEach((modelName) => {
    const schema = schemas[modelName];
    if (!schema || isReferenceObject(schema)) return;

    const simpleSchemaName = `${modelName}Simple`;
    if (schemas[simpleSchemaName]) return;

    const simpleSchema: any = {
      'x-apigen-mapping': { model: modelName },
      type: 'object',
      properties: {},
    };

    if ((schema as any).properties) {
      Object.entries((schema as any).properties).forEach(([propName, propValue]: [string, any]) => {
        if (!propValue || typeof propValue !== 'object') return;
        if (propValue.$ref) return;
        if (propValue.type === 'array' && propValue.items?.$ref) return;
        if (propName.endsWith('_id')) return;

        const newProp: any = {};
        Object.entries(propValue).forEach(([k, v]) => { newProp[k] = v; });
        newProp['x-apigen-mapping'] = { field: resolveFieldName(propName, undefined, propValue) };
        simpleSchema.properties[propName] = newProp;
      });
    }

    schemas[simpleSchemaName] = simpleSchema;
  });
}

function findEndpointKey(
  path: string,
  method: string,
  controllers: Record<string, ControllerStoreObject>,
  endpoints: Record<string, EndpointStoreObject>,
): string | undefined {
  let found: string | undefined;

  Object.values(controllers).some((controller) => {
    if (!controller.endpoints) return false;

    return controller.endpoints.some((epKey) => {
      const ep = endpoints[epKey];
      if (!ep) return false;

      const fullPath = controller.requestMapping + (ep.mapping || '');
      const isBasePath = ep.mapping === controller.requestMapping;
      const matchesPath = isBasePath
        ? controller.requestMapping === path
        : fullPath === path;
      if (matchesPath && ep.operation === method) {
        found = epKey;
        return true;
      }
      return false;
    });
  });

  return found;
}

function findAttributeByName(
  name: string,
  attributeKeys: string[],
  endpointAttributes: Record<string, EndpointAttributeStoreObject>,
): EndpointAttributeStoreObject | undefined {
  const key = attributeKeys.find((k) => {
    const attr = endpointAttributes[k];
    return attr && attr.name === name;
  });
  return key ? endpointAttributes[key] : undefined;
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

function hasAnyFieldMapping(
  attributeKeys: string[],
  endpointAttributes: Record<string, EndpointAttributeStoreObject>,
): boolean {
  return attributeKeys.some((attrKey) => {
    const attr = endpointAttributes[attrKey];
    return attr?.entity_mapping?.name;
  });
}

interface SchemaInfo {
  entityName: string;
  methods: Set<string>;
  attributeKeys: string[];
}

function collectSchemaMappings(
  openapi: OpenAPIDocument,
  controllers: Record<string, ControllerStoreObject>,
  endpoints: Record<string, EndpointStoreObject>,
  endpointAttributes: Record<string, EndpointAttributeStoreObject>,
): { baseMappings: Map<string, string>; schemaInfos: Map<string, SchemaInfo> } {
  const baseMappings = new Map<string, string>();
  const schemaInfos = new Map<string, SchemaInfo>();

  if (!openapi.paths) return { baseMappings, schemaInfos };

  Object.entries(openapi.paths).forEach(([path, pathItem]) => {
    if (!pathItem || isReferenceObject(pathItem)) return;

    HTTP_METHODS.forEach((method) => {
      const operation = (pathItem as any)[method];
      if (!operation) return;

      const endpointKey = findEndpointKey(path, method.toUpperCase(), controllers, endpoints);
      if (!endpointKey) return;

      const endpoint = endpoints[endpointKey];
      if (!endpoint?.entity) return;

      // Schema de la respuesta
      const successResp = operation.responses
        ? (operation.responses['200'] || operation.responses['201'] || operation.responses['202'])
        : null;
      const responseSchemaName = successResp ? getSchemaRefFromContent(successResp.content) : null;

      if (responseSchemaName) {
        let info = schemaInfos.get(responseSchemaName);
        if (!info) {
          info = { entityName: endpoint.entity, methods: new Set(), attributeKeys: [] };
          schemaInfos.set(responseSchemaName, info);
        }
        info.methods.add(method);

        if (!info.attributeKeys.length && endpoint.responseData?.attributes?.length) {
          if (hasAnyFieldMapping(endpoint.responseData.attributes, endpointAttributes)) {
            info.attributeKeys = endpoint.responseData.attributes;
            baseMappings.set(responseSchemaName, endpoint.entity);
          }
        }
      }

      // Schema del request body
      const requestSchemaName = operation.requestBody
        ? getSchemaRefFromContent(operation.requestBody.content)
        : null;

      if (requestSchemaName && endpoint.requestBody?.attributes?.length) {
        if (hasAnyFieldMapping(endpoint.requestBody.attributes, endpointAttributes)) {
          baseMappings.set(requestSchemaName, endpoint.entity);

          let info = schemaInfos.get(requestSchemaName);
          if (!info) {
            info = { entityName: endpoint.entity, methods: new Set(), attributeKeys: [] };
            schemaInfos.set(requestSchemaName, info);
          }
          // Registrar method también desde requestBody (ej: PUT /user/{username}
          // no tiene response 200, pero sí requestBody con User schema → genera UserPut)
          info.methods.add(method);
          if (!info.attributeKeys.length) {
            info.attributeKeys = endpoint.requestBody.attributes;
          }
        }
      }
    });
  });

  return { baseMappings, schemaInfos };
}

function findAnonymizationForProp(
  propName: string,
  schemaInfos: Map<string, SchemaInfo>,
  schemaName: string,
  endpointAttributes: Record<string, EndpointAttributeStoreObject>,
): string | undefined {
  const info = schemaInfos.get(schemaName);
  if (!info || !info.attributeKeys.length) return undefined;

  const attr = findAttributeByName(propName, info.attributeKeys, endpointAttributes);
  return attr?.anonymization || undefined;
}

function applyBaseMappings(
  openapi: OpenAPIDocument,
  baseMappings: Map<string, string>,
  entityToSchema: Map<string, string>,
  modelNames: Set<string>,
  schemaInfos: Map<string, SchemaInfo>,
  endpointAttributes: Record<string, EndpointAttributeStoreObject>,
): void {
  if (!openapi.components?.schemas) return;

  // Función auxiliar para reconstruir schema con x-apigen-mapping al inicio
  const rebuildSchemaWithMapping = (schemaName: string, mapping: any, injectAnonymization = false) => {
    const schema = openapi.components!.schemas![schemaName];
    if (!schema || isReferenceObject(schema)) return;
    if ((schema as any)['x-apigen-mapping']) return; // ya tiene mapping

    // Reconstruir el schema con x-apigen-mapping PRIMERO
    const newSchema: any = {
      'x-apigen-mapping': mapping,
    };
    Object.entries(schema as any).forEach(([key, value]) => {
      if (key !== 'x-apigen-mapping') {
        newSchema[key] = value;
      }
    });

    // Add field-level x-apigen-mapping to each property
    if (newSchema.properties) {
      const newProperties: any = {};
      Object.entries(newSchema.properties).forEach(([propName, propValue]) => {
        if (typeof propValue !== 'object' || propValue === null) {
          newProperties[propName] = propValue;
          return;
        }

        // FK column (owner_id) → replace with Simple $ref
        const relSchemaName = fkToRelationSchema(propName, openapi.components!.schemas!);
        if (relSchemaName) {
          const relationName = propName.replace(/_id$/, '');
          if (!newProperties[relationName]) {
            newProperties[relationName] = {
              $ref: `#/components/schemas/${relSchemaName}`,
              'x-apigen-mapping': { field: relationName },
            };
          }
          return;
        }

        // Explicit $ref property (pet: $ref Pet) → use Simple schema
        if ((propValue as any).$ref && !(propValue as any)['x-apigen-mapping']) {
          newProperties[propName] = {
            $ref: toSimpleRef((propValue as any).$ref, openapi.components!.schemas!),
            'x-apigen-mapping': { field: propName },
          };
          return;
        }

        if ((propValue as any)['x-apigen-mapping']) {
          newProperties[propName] = propValue;
          return;
        }
        const newProp: any = {};
        Object.entries(propValue as any).forEach(([k, v]) => {
          newProp[k] = v;
        });
        newProp['x-apigen-mapping'] = { field: resolveFieldName(propName, undefined, propValue) };
        newProperties[propName] = newProp;
      });
      // Inject x-anonymization into base schema properties
      if (injectAnonymization) {
        Object.entries(newProperties).forEach(([propName, propValue]) => {
          if (typeof propValue !== 'object' || propValue === null) return;
          const anonymization = findAnonymizationForProp(propName, schemaInfos, schemaName, endpointAttributes);
          if (anonymization) {
            (propValue as any)['x-anonymization'] = anonymization;
          }
        });
      }

      newSchema.properties = newProperties;
    }

    openapi.components!.schemas![schemaName] = newSchema;
  };

  // Aplicar mappings a schemas base — sin inyectar anonymization (va en los schemas de método)
  baseMappings.forEach((_entityName, schemaName) => {
    rebuildSchemaWithMapping(schemaName, { model: schemaName }, false);
  });

  modelNames.forEach((modelName) => {
    if (baseMappings.has(modelName)) return;
    rebuildSchemaWithMapping(modelName, { model: modelName }, false);
  });

  entityToSchema.forEach((schemaName) => {
    if (baseMappings.has(schemaName)) return;
    rebuildSchemaWithMapping(schemaName, { model: schemaName }, false);
  });
}

function createPerMethodSchemas(
  openapi: OpenAPIDocument,
  schemaInfos: Map<string, SchemaInfo>,
  endpointAttributes: Record<string, EndpointAttributeStoreObject>,
  entityToSchema: Map<string, string>,
): void {
  if (!openapi.components) {
    (openapi as any).components = {};
  }
  if (!openapi.components!.schemas) {
    openapi.components!.schemas = {};
  }

  schemaInfos.forEach((info, schemaName) => {
    if (!info.attributeKeys.length) return;

    const baseSchema = openapi.components!.schemas![schemaName];
    if (!baseSchema || isReferenceObject(baseSchema)) return;

    // Si el schema ya tiene x-apigen-mapping.method, ya es un per-method schema — no crear otro,
    // pero sí actualizar x-apigen-mapping.field y x-anonymization en sus propiedades existentes
    if ((baseSchema as any)['x-apigen-mapping']?.method) {
      if ((baseSchema as any).properties) {
        Object.entries((baseSchema as any).properties).forEach(([propName, propValue]: [string, any]) => {
          if (!propValue || typeof propValue !== 'object') return;
          const attr = findAttributeByName(propName, info.attributeKeys, endpointAttributes);
          // Actualizar x-apigen-mapping.field si el mapeo cambió
          const fieldName = resolveFieldName(propName, attr?.entity_mapping?.name, propValue);
          if (propValue['x-apigen-mapping']) {
            propValue['x-apigen-mapping'].field = fieldName;
          } else {
            propValue['x-apigen-mapping'] = { field: fieldName };
          }
          // Actualizar x-anonymization
          if (attr?.anonymization) {
            propValue['x-anonymization'] = attr.anonymization;
          } else {
            delete propValue['x-anonymization'];
          }
        });
      }
      return;
    }

    // Usar schema name (singular) como model name
    const modelName = entityToSchema.get(info.entityName) || schemaName;

    info.methods.forEach((method) => {
      const methodKey = capitalize(method);
      const newSchemaName = `${schemaName}${methodKey}`;

      // Clonar el schema base sin x-apigen-mapping ni x-anonymization
      const baseClone = JSON.parse(JSON.stringify(baseSchema));
      delete baseClone['x-apigen-mapping'];
      if (baseClone.properties) {
        Object.values(baseClone.properties).forEach((prop: any) => {
          if (prop && typeof prop === 'object') delete prop['x-anonymization'];
        });
      }

      // Reconstruir el schema con x-apigen-mapping PRIMERO
      const methodSchema: any = {
        'x-apigen-mapping': {
          model: modelName,
          method,
        },
      };

      // Copiar el resto de las propiedades del base
      Object.entries(baseClone).forEach(([key, value]) => {
        methodSchema[key] = value;
      });

      // Agregar field mappings a las properties (con x-apigen-mapping al inicio de cada property)
      if (methodSchema.properties) {
        const newProperties: any = {};
        Object.entries(methodSchema.properties).forEach(([propName, propValue]) => {
          if (typeof propValue !== 'object' || propValue === null) {
            newProperties[propName] = propValue;
            return;
          }

          // For post/put, exclude OneToMany/ManyToMany relations (arrays with $ref items)
          if (method === 'post' || method === 'put') {
            const pv = propValue as any;
            if (pv.type === 'array' && pv.items?.$ref) {
              return;
            }
          }

          // FK column (owner_id): POST/PUT → skip; GET → add Simple $ref
          const relSchemaName = fkToRelationSchema(propName, openapi.components!.schemas!);
          if (relSchemaName) {
            if (method === 'post' || method === 'put') return;
            const relationName = propName.replace(/_id$/, '');
            if (!newProperties[relationName]) {
              newProperties[relationName] = {
                $ref: `#/components/schemas/${relSchemaName}`,
                'x-apigen-mapping': { field: relationName },
              };
            }
            return;
          }

          // Explicit $ref property (pet: $ref Pet) → use Simple schema
          if ((propValue as any).$ref) {
            newProperties[propName] = {
              $ref: toSimpleRef((propValue as any).$ref, openapi.components!.schemas!),
              'x-apigen-mapping': { field: propName },
            };
            return;
          }

          const attr = findAttributeByName(propName, info.attributeKeys, endpointAttributes);
          const newProp: any = {};
          Object.entries(propValue as any).forEach(([k, v]) => { newProp[k] = v; });
          const fieldName = resolveFieldName(propName, attr?.entity_mapping?.name, propValue);
          newProp['x-apigen-mapping'] = { field: fieldName };
          if (attr?.anonymization) {
            newProp['x-anonymization'] = attr.anonymization;
          }
          newProperties[propName] = newProp;
        });
        methodSchema.properties = newProperties;
      }

      openapi.components!.schemas![newSchemaName] = methodSchema;
    });
  });
}

function updateContentRef(content: any, methodKey: string, schemas: any): void {
  const mediaType = content['application/json'] || Object.values(content)[0];
  if (!mediaType?.schema) return;

  if (mediaType.schema.$ref) {
    const schemaName = getSchemaNameFromRef(mediaType.schema.$ref);
    if (schemaName && schemas[`${schemaName}${methodKey}`]) {
      mediaType.schema.$ref = `#/components/schemas/${schemaName}${methodKey}`;
    }
  } else if (mediaType.schema.type === 'array' && mediaType.schema.items?.$ref) {
    const schemaName = getSchemaNameFromRef(mediaType.schema.items.$ref);
    if (schemaName && schemas[`${schemaName}${methodKey}`]) {
      mediaType.schema.items.$ref = `#/components/schemas/${schemaName}${methodKey}`;
    }
  }
}

function updatePathRefs(openapi: OpenAPIDocument): void {
  if (!openapi.paths || !openapi.components?.schemas) return;

  Object.values(openapi.paths).forEach((pathItem) => {
    if (!pathItem || isReferenceObject(pathItem)) return;

    HTTP_METHODS.forEach((method) => {
      const operation = (pathItem as any)[method];
      if (!operation) return;

      const methodKey = capitalize(method);

      if (operation.requestBody?.content) {
        updateContentRef(operation.requestBody.content, methodKey, openapi.components!.schemas!);
      }

      if (operation.responses) {
        Object.values(operation.responses).forEach((response: any) => {
          if (response?.content) {
            updateContentRef(response.content, methodKey, openapi.components!.schemas!);
          }
        });
      }
    });
  });
}

function createResponseWrappers(openapi: OpenAPIDocument, modelNames: Set<string>): void {
  if (!openapi.components?.schemas) return;
  const { schemas } = openapi.components;

  modelNames.forEach((modelName) => {
    const wrapperName = `${modelName}Response`;
    if (schemas[wrapperName]) return;

    schemas[wrapperName] = {
      type: 'object',
      properties: {
        result: { type: 'object' },
        data: { $ref: `#/components/schemas/${modelName}Get` },
      },
    };
  });
}

function updatePathResponses(openapi: OpenAPIDocument): void {
  if (!openapi.paths || !openapi.components?.schemas) return;
  const { schemas } = openapi.components;

  Object.values(openapi.paths).forEach((pathItem) => {
    if (!pathItem || isReferenceObject(pathItem)) return;

    const modelName = (pathItem as any)['x-apigen-binding']?.model;

    HTTP_METHODS.forEach((method) => {
      const operation = (pathItem as any)[method];
      if (!operation) return;

      if (method === 'delete') return;

      if (!modelName) return;
      const wrapperName = `${modelName}Response`;
      if (!schemas[wrapperName]) return;

      ['200', '201', '202'].forEach((code) => {
        const response = operation.responses?.[code];
        if (!response?.content) return;
        const mediaType = response.content['application/json'] || Object.values(response.content)[0];
        if (mediaType?.schema) {
          mediaType.schema = { $ref: `#/components/schemas/${wrapperName}` };
        }
      });
    });
  });
}

export default function generateApigenMappings(
  openapi: OpenAPIDocument,
  controllers: Record<string, ControllerStoreObject>,
  endpoints: Record<string, EndpointStoreObject>,
  endpointAttributes: Record<string, EndpointAttributeStoreObject>,
  _endpointParameters: Record<string, EndpointParameterStoreObject>,
  entityToSchema: Map<string, string>,
  modelNames: Set<string>,
): void {
  createSimpleSchemas(openapi, modelNames);

  const { baseMappings, schemaInfos } = collectSchemaMappings(
    openapi,
    controllers,
    endpoints,
    endpointAttributes,
  );

  applyBaseMappings(openapi, baseMappings, entityToSchema, modelNames, schemaInfos, endpointAttributes);
  createPerMethodSchemas(openapi, schemaInfos, endpointAttributes, entityToSchema);
  updatePathRefs(openapi);
  createResponseWrappers(openapi, modelNames);
  updatePathResponses(openapi);
}
