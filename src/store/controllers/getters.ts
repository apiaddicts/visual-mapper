/* eslint-disable no-shadow */
import { GetterTree } from 'vuex';
import { RootState } from '@/store/state';
import { ControllerState } from './state';

const getters: GetterTree<ControllerState, RootState> = {
  existsController(state) {
    return (name: string): boolean => state.list.includes(name);
  },

  exportData(state, getters, rootState, rootGetters): any {
    return {
      controllers: state.list.map((k: string) => {
        const o = state._[k];
        // Se convierte de Set a Array la propiedad 'additional_entities' al exportar un archivo de configuración
        const additionalEntities : Array<string> = [];
        if (o.additionalEntities !== undefined) {
          // eslint-disable-next-line
          for (const additionalEntity of o.additionalEntities.values()) {
            additionalEntities.push(additionalEntity);
          }
        }
        return {
          name: o.name,
          request_mapping: o.requestMapping,
          entity: o.entity,
          services: o.services || [],
          common_parameters: o.commonParameters || [],
          source: o.source,
          additional_entities: additionalEntities,
          endpoints: o.endpoints
            ? o.endpoints.map((ke) => rootGetters['endpoints/exportData'](ke))
            : [],
        };
      }),
    };
  },
  exportPartialData: (state, getters, rootState, rootGetters): any => (resourceName: any) => {
    const o = state._[resourceName];
    return {
      controllers: [{
        name: o.name,
        request_mapping: o.requestMapping,
        entity: o.entity,
        services: o.services || [],
        common_parameters: o.commonParameters || [],
        endpoints: o.endpoints
          ? o.endpoints.map((ke) => rootGetters['endpoints/exportData'](ke))
          : [],
      }],
    };
  },
};
export default getters;
