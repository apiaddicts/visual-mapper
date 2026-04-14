/* eslint-disable no-param-reassign */
import { ControllerStoreObject } from '@/store/controllers/state';
import { EndpointStoreObject } from '@/store/endpoints/state';
import projectGenerator from '../../openapi/extensions/apigen-project.generator';
import modelsGenerator from '../../openapi/extensions/apigen-models.generator';
import type { GenerationConfig } from '../../openapi/extensions/apigen-extension-generator';
import { AsyncAPIDocument } from '../models/asyncapi.types';
import asyncBindingGenerator from './asyncapi-binding.generator';
import asyncMappingGenerator from './asyncapi-mapping.generator';

function getSchemaNameFromRef(ref: string): string | null {
  const match = ref.match(/^#\/components\/schemas\/(.+)$/);
  return match ? match[1] : null;
}

/**
 * Construye el mapa entity → schema para AsyncAPI.
 * Busca en los messages referenciados por los endpoints el payload $ref
 * para mapear entityName → schemaName.
 */
function buildAsyncEntityToSchemaMap(
  asyncapi: AsyncAPIDocument,
  controllers: Record<string, ControllerStoreObject>,
  endpoints: Record<string, EndpointStoreObject>,
): Map<string, string> {
  const entityToSchema = new Map<string, string>();

  Object.values(controllers).forEach((controller) => {
    if (!controller.entity || entityToSchema.has(controller.entity)) return;

    // Buscar en los endpoints del controller
    if (controller.endpoints) {
      controller.endpoints.some((epKey) => {
        const ep = endpoints[epKey];
        if (!ep) return false;

        // Verificar schemaRef en requestBody o responseData
        const schemaRef = ep.requestBody?.schemaRef || ep.responseData?.schemaRef;
        if (schemaRef) {
          entityToSchema.set(controller.entity!, schemaRef);
          return true;
        }
        return false;
      });
    }

    // Fallback: buscar en messages del asyncapi por channel address
    if (!entityToSchema.has(controller.entity) && asyncapi.components?.messages) {
      Object.values(asyncapi.components.messages).forEach((message: any) => {
        if (entityToSchema.has(controller.entity!)) return;
        if (message?.payload?.$ref) {
          const schemaName = getSchemaNameFromRef(message.payload.$ref);
          if (schemaName) {
            entityToSchema.set(controller.entity!, schemaName);
          }
        }
      });
    }
  });

  return entityToSchema;
}

export { GenerationConfig };

export default function generateAllAsyncExtensions(
  asyncapi: AsyncAPIDocument,
  config: GenerationConfig,
): AsyncAPIDocument {
  const source = JSON.parse(JSON.stringify(asyncapi)) as AsyncAPIDocument;

  // Construir mapa entity → schema
  const entityToSchema = buildAsyncEntityToSchemaMap(source, config.controllers, config.endpoints);

  // x-apigen-project (reutilizar existente)
  const project = projectGenerator(config.project);

  // x-apigen-models: mapa identidad para que la clave sea el nombre de entidad (no el schema)
  const entityIdentityMap = new Map<string, string>();
  entityToSchema.forEach((_, entityName) => entityIdentityMap.set(entityName, entityName));
  const models = modelsGenerator(config.entities, config.entityAttributes, entityIdentityMap, new Map());

  // x-apigen-binding en messages
  asyncBindingGenerator(source, config.controllers, config.endpoints, entityToSchema);

  // x-apigen-mapping en schemas (solo base, sin per-method)
  const modelNames = new Set(Object.keys(models));
  asyncMappingGenerator(
    source,
    config.controllers,
    config.endpoints,
    config.endpointAttributes,
    entityToSchema,
    modelNames,
  );

  // Reconstruir documento en orden correcto
  const result: any = {};
  result.asyncapi = source.asyncapi;
  result.info = source.info;
  result['x-apigen-project'] = project;

  // x-anonymization-config (solo swapLists, sin pseudonymizationKey)
  if (config.anonymizationConfig) {
    const anonConfig: any = {};
    if (config.anonymizationConfig.swapLists && Object.keys(config.anonymizationConfig.swapLists).length > 0) {
      anonConfig.swapLists = config.anonymizationConfig.swapLists;
    }
    if (Object.keys(anonConfig).length > 0) {
      result['x-anonymization-config'] = anonConfig;
    }
  }

  if (source.defaultContentType) result.defaultContentType = source.defaultContentType;
  if (source.servers) result.servers = source.servers;
  if (source.channels) result.channels = source.channels;
  if (source.operations) result.operations = source.operations;

  // Components con x-apigen-models primero
  if (!source.components) {
    (source as any).components = {};
  }

  const newComponents: any = {
    'x-apigen-models': models,
  };

  Object.entries(source.components as any).forEach(([key, value]) => {
    if (key !== 'x-apigen-models') {
      newComponents[key] = value;
    }
  });

  result.components = newComponents;

  return result as AsyncAPIDocument;
}
