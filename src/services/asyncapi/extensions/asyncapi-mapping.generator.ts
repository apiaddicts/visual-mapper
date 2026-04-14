/* eslint-disable no-param-reassign */
import { ControllerStoreObject } from '@/store/controllers/state';
import { EndpointStoreObject } from '@/store/endpoints/state';
import { EndpointAttributeStoreObject } from '@/store/endpoint-attributes/state';
import { AsyncAPIDocument } from '../models/asyncapi.types';
import { isReferenceObject } from '../../openapi/models/openapi.types';

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

interface SchemaInfo {
  entityName: string;
  attributeKeys: string[];
}

/**
 * Recopila información sobre qué schemas están mapeados a qué entidades,
 * basándose en los endpoints del store.
 */
function collectSchemaMappings(
  controllers: Record<string, ControllerStoreObject>,
  endpoints: Record<string, EndpointStoreObject>,
  endpointAttributes: Record<string, EndpointAttributeStoreObject>,
): { baseMappings: Map<string, string>; schemaInfos: Map<string, SchemaInfo> } {
  const baseMappings = new Map<string, string>();
  const schemaInfos = new Map<string, SchemaInfo>();

  Object.values(controllers).forEach((controller) => {
    if (!controller.entity || !controller.endpoints) return;
    const entityName = controller.entity;

    controller.endpoints.forEach((epKey) => {
      const ep = endpoints[epKey];
      if (!ep) return;

      // Revisar request_body (payload del message)
      const section = ep.requestBody;
      if (section?.schemaRef && section.attributes?.length) {
        const hasMapping = section.attributes.some((attrKey) => {
          const attr = endpointAttributes[attrKey];
          return attr?.entity_mapping?.name;
        });

        if (hasMapping) {
          baseMappings.set(section.schemaRef, entityName);

          if (!schemaInfos.has(section.schemaRef)) {
            schemaInfos.set(section.schemaRef, {
              entityName,
              attributeKeys: section.attributes,
            });
          }
        }
      }

      // Revisar response_data
      const respSection = ep.responseData;
      if (respSection?.schemaRef && respSection.attributes?.length) {
        const hasMapping = respSection.attributes.some((attrKey) => {
          const attr = endpointAttributes[attrKey];
          return attr?.entity_mapping?.name;
        });

        if (hasMapping && !baseMappings.has(respSection.schemaRef)) {
          baseMappings.set(respSection.schemaRef, entityName);

          if (!schemaInfos.has(respSection.schemaRef)) {
            schemaInfos.set(respSection.schemaRef, {
              entityName,
              attributeKeys: respSection.attributes,
            });
          }
        }
      }
    });
  });

  return { baseMappings, schemaInfos };
}

/**
 * Aplica x-apigen-mapping a schemas base (sin per-method schemas).
 */
function applyBaseMappings(
  asyncapi: AsyncAPIDocument,
  baseMappings: Map<string, string>,
  entityToSchema: Map<string, string>,
  modelNames: Set<string>,
  schemaInfos: Map<string, SchemaInfo>,
  endpointAttributes: Record<string, EndpointAttributeStoreObject>,
): void {
  if (!asyncapi.components?.schemas) return;

  const rebuildSchemaWithMapping = (schemaName: string, mapping: any) => {
    const schema = asyncapi.components!.schemas![schemaName];
    if (!schema || isReferenceObject(schema)) return;
    if ((schema as any)['x-apigen-mapping']) return;

    const newSchema: any = { 'x-apigen-mapping': mapping };
    Object.entries(schema as any).forEach(([key, value]) => {
      if (key !== 'x-apigen-mapping') newSchema[key] = value;
    });

    // Inyectar x-anonymization en propiedades individuales (sin field-level x-apigen-mapping)
    const info = schemaInfos.get(schemaName);
    if (info && newSchema.properties) {
      const newProperties: any = {};
      Object.entries(newSchema.properties).forEach(([propName, propValue]) => {
        if (typeof propValue !== 'object' || propValue === null) {
          newProperties[propName] = propValue;
          return;
        }
        const attr = findAttributeByName(propName, info.attributeKeys, endpointAttributes);
        if (attr?.anonymization) {
          newProperties[propName] = { ...(propValue as any), 'x-anonymization': attr.anonymization };
        } else {
          newProperties[propName] = propValue;
        }
      });
      newSchema.properties = newProperties;
    }

    asyncapi.components!.schemas![schemaName] = newSchema;
  };

  // Solo procesar schemas cuya operación tiene entidad asignada
  baseMappings.forEach((entityName, schemaName) => {
    rebuildSchemaWithMapping(schemaName, { model: entityName });
  });
}

export default function generateAsyncMappings(
  asyncapi: AsyncAPIDocument,
  controllers: Record<string, ControllerStoreObject>,
  endpoints: Record<string, EndpointStoreObject>,
  endpointAttributes: Record<string, EndpointAttributeStoreObject>,
  entityToSchema: Map<string, string>,
  modelNames: Set<string>,
): void {
  const { baseMappings, schemaInfos } = collectSchemaMappings(
    controllers,
    endpoints,
    endpointAttributes,
  );

  applyBaseMappings(asyncapi, baseMappings, entityToSchema, modelNames, schemaInfos, endpointAttributes);
}
