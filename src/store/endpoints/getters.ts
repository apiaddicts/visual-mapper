/* eslint-disable */
import { GetterTree } from 'vuex';
import { RootState } from '@/store/state';
import { EndpointState, EndpointStoreObject } from './state';

const getters: GetterTree<EndpointState, RootState> = {
  exportData(state, getters, rootState, rootGetters): any {
    return ((key: string) => {
      const o = state._[key];
      const entity = () => {
        if (o.source !== undefined && o.source === 'swagger') {
          return o.entity;
        }
        else {
          return o.responseData ? o.responseData.entity : o.entity;
        }
      };
      
      return {
        operation: o.operation,
        mapping: o.mapping || '/',
        description: o.description,
        summary: o.summary,
        entity: entity(),
        parameters: o.parameters
          ? o.parameters.map(pk => rootGetters['endpointParameters/exportData'](pk))
          : [],
        request_body: o.requestBody
          ? {
            entity: o.requestBody.entity,
            attributes: o.requestBody.attributes
              ? o.requestBody.attributes.map(rbk => rootGetters['endpointAttributes/exportData'](rbk))
              : [],
            example: o.requestBody.example,
            examples: o.requestBody.examples,
          }
          : undefined,
        response_data: o.responseData
          ? {
            //entity: rootState.applicationStore.swagger ? o.entity : o.responseData.entity,
            entity: entity(),
            attributes: o.responseData.attributes
              ? o.responseData.attributes.map(rdk => rootGetters['endpointAttributes/exportData'](rdk))
              : [],
            response_schema: o.responseData.responseSchema,
            example: o.responseData.example,
            examples: o.responseData.examples,
          }
          : undefined,
      };
    });
  },
  getEndpointByKey(state, getters, rootState, rootGetters): any {
    return ((endpointKey: string): EndpointStoreObject => {
      return state._[endpointKey];
    });
  },
  getEndpointEntityByEndpointKey(state, getters, rootState, rootGetters): any {
    return ((endpointKey: string): string => {
      if (state._[endpointKey] != null && state._[endpointKey].entity != null) {
        return state._[endpointKey].entity;
      }
      
      if (state._[endpointKey] != null && 
          state._[endpointKey].requestBody != null && 
          state._[endpointKey].requestBody!.entity != null) 
      {
        return state._[endpointKey].requestBody!.entity!;
      }
      
      return '';
    });
  },
  getEndpointOperationByEndpointKey(state, getters, rootState, rootGetters): any {
    return ((endpointKey: string): string => {
      if (state._[endpointKey] != null && state._[endpointKey].operation != null) {
        return state._[endpointKey].operation;
      }
      
      return '';
    });
  },
  getEndpointResponseDataAttributesByEndpointKey(state, getters, rootState, rootGetters): any {
    return ((endpointKey: string): string[] => {
      if (state._[endpointKey] != null && 
          state._[endpointKey].responseData != null && 
          state._[endpointKey].responseData!.attributes != null) 
      {
        return state._[endpointKey].responseData!.attributes!;
      }
      
      return [];
    });
  },
};
export default getters;
