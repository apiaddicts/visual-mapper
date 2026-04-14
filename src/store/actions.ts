import { ActionTree } from 'vuex';
import YAML from 'yaml';
import { openApiParserService, generateAllExtensions } from '@/services/openapi';
import { asyncApiParserService, generateAllAsyncExtensions } from '@/services/asyncapi';
import type { GenerationConfig } from '@/services/openapi';
import { RootState } from './state';
import ConfigGenerationFile from './config-generation-file';

function buildGenerationConfig(state: RootState): GenerationConfig {
  return {
    project: {
      name: state.applicationStore.name || '',
      version: state.applicationStore.version || '',
      description: state.applicationStore.description,
      partial: state.applicationStore.partial,
      dataDriver: state.connectionStore.type,
      targetFramework: state.applicationStore.targetFramework,
      groupId: state.applicationStore.groupId,
      artifactId: state.applicationStore.artifactId,
    },
    entities: state.entities._,
    entityAttributes: state.entityAttributes._,
    controllers: state.controllers._,
    endpoints: state.endpoints._,
    endpointAttributes: state.endpointAttributes._,
    endpointParameters: state.endpointParameters._,
    anonymizationConfig: state.applicationStore.anonymizationConfig,
  };
}

const actions: ActionTree<RootState, RootState> = {
  generateJSONConfig({ rootGetters }): ConfigGenerationFile {
    const configFile: ConfigGenerationFile = {
      ...rootGetters['applicationStore/exportData'],
      ...rootGetters['connectionStore/exportData'],
      ...rootGetters['entities/exportData'],
      ...rootGetters['controllers/exportData'],
      api_definition: rootGetters.apiDefinition,
      async_api_definition: rootGetters.asyncApiDefinition,
      async_api: rootGetters.asyncApi,
      async_api_extra_tables: rootGetters.asyncApiExtraTables,
      async_api_servers: rootGetters.asyncApiServers,
    };

    return configFile;
  },

  generateOpenApiWithExtensions({ state }): any {
    const rawDoc = openApiParserService.getRawDocument();
    if (!rawDoc) return null;

    const config = buildGenerationConfig(state);
    return generateAllExtensions(rawDoc, config);
  },

  getEnrichedOpenApiYaml({ state }): string | null {
    const rawDoc = openApiParserService.getRawDocument();
    if (!rawDoc) return null;

    const config = buildGenerationConfig(state);
    const enriched = generateAllExtensions(rawDoc, config);
    return YAML.stringify(enriched, {
      blockQuote: 'folded',
      lineWidth: 80,
    });
  },

  generateAsyncApiWithExtensions({ state }): any {
    const rawDoc = asyncApiParserService.getRawDocument();
    if (!rawDoc) return null;

    const config = buildGenerationConfig(state);
    return generateAllAsyncExtensions(rawDoc, config);
  },

  getEnrichedAsyncApiYaml({ state }): string | null {
    const rawDoc = asyncApiParserService.getRawDocument();
    if (!rawDoc) return null;

    const config = buildGenerationConfig(state);
    const enriched = generateAllAsyncExtensions(rawDoc, config);
    return YAML.stringify(enriched, {
      blockQuote: 'folded',
      lineWidth: 80,
    });
  },

  generateJSONPartialConfig({ rootGetters }, resourceName) {
    const controllers = { ...rootGetters['controllers/exportPartialData'](resourceName) };
    const entitiesName = [...new Set(
      controllers.controllers[0].endpoints
        .map((endpoint: any) => endpoint.response_data.attributes
          .map((attribute: any) =>
            // eslint-disable-next-line max-len,implicit-arrow-linebreak
            [(attribute.attributes) ? (attribute.attributes.map((nextAttribute: any) => ((nextAttribute.entity_mapping) ? nextAttribute.entity_mapping.type : null))) : null, (attribute.entity_mapping) ? attribute.entity_mapping.type : null])).flat(Infinity).filter((item: any) => item !== null)
        .map((item: any) => item.toLowerCase()),
    )];

    entitiesName.push(controllers.controllers[0].entity.toLowerCase());

    const configFile = {
      ...rootGetters['applicationStore/exportData'],
      ...rootGetters['connectionStore/exportData'],
      ...rootGetters['entities/exportPartialData'](entitiesName),
      ...rootGetters['controllers/exportPartialData'](resourceName),
    };

    return configFile;
  },
};

export default actions;
