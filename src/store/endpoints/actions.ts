import { ActionTree } from 'vuex';
import { nanoid } from 'nanoid';
import { RootState } from '@/store/state';
import { EndpointResponse, mapEndpointResponse } from '@/models/EndpointResponse';
import { KeyValue } from '@/models/KeyValue';
import { EndpointState, EndpointStoreObject } from './state';
import { EndpointParameterStoreObject } from '../endpoint-parameters/state';
import { EndpointAttributeStoreObject } from '../endpoint-attributes/state';

const ADD_ACTION = 'addEndpoint';
const IMPORT_ACTION = 'importEndpoint';

const actions: ActionTree<EndpointState, RootState> = {
  addEndpoint({ commit }, payload: EndpointStoreObject): any {
    const kve: KeyValue<EndpointStoreObject> = {
      key: nanoid(10),
      value: payload,
    };
    commit('ADD', kve);
    return kve;
  },

  importEndpoint({ dispatch }, payload: EndpointResponse): any {
    const eso: EndpointStoreObject = mapEndpointResponse(payload);
    return dispatch('endpointParameters/importEndpointParameters', payload.parameters, { root: true })
      .then((kvepsos: Array<KeyValue<EndpointParameterStoreObject>>) => {
        eso.parameters = kvepsos.map((x) => x.key);
        const requestBodyAttributes = payload.request_body
          ? payload.request_body.attributes
          : [];
        return dispatch('endpointAttributes/importEndpointAttributes', requestBodyAttributes, { root: true });
      })
      .then((kveasos: Array<KeyValue<EndpointAttributeStoreObject>>) => {
        if (eso.requestBody) eso.requestBody.attributes = kveasos.map((x) => x.key);
        const responseDataAttributes = payload.response_data
          ? payload.response_data.attributes
          : [];
        return dispatch('endpointAttributes/importEndpointAttributes', responseDataAttributes, { root: true });
      })
      .then((kveasos: Array<KeyValue<EndpointAttributeStoreObject>>) => {
        if (eso.responseData) eso.responseData.attributes = kveasos.map((x) => x.key);
        return dispatch(ADD_ACTION, eso);
      });
  },

  importEndpoints({ dispatch }, payload?: Array<EndpointResponse>): any {
    if (!payload) return [];
    return Promise.all(
      payload.map((er: EndpointResponse) => dispatch(IMPORT_ACTION, er)),
    );
  },
};
export default actions;
