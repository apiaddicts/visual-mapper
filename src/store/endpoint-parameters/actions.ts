import { ActionTree } from 'vuex';
import { nanoid } from 'nanoid';
import { RootState } from '@/store/state';
import { EndpointParameterResponse, mapEndpointParameterResponse } from '@/models/EndpointResponse';
import { KeyValue } from '@/models/KeyValue';
import { EndpointParametersState, EndpointParameterStoreObject } from './state';

const ADD_ACTION = 'addEndpointParameter';
const IMPORT_ACTION = 'importEndpointParameter';

const actions: ActionTree<EndpointParametersState, RootState> = {
  addEndpointParameter({ commit }, payload: EndpointParameterStoreObject): any {
    const kvepso: KeyValue<EndpointParameterStoreObject> = {
      key: nanoid(10),
      value: payload,
    };
    commit('ADD', kvepso);
    return kvepso;
  },

  importEndpointParameter({ dispatch }, payload: EndpointParameterResponse): any {
    const epso: EndpointParameterStoreObject = mapEndpointParameterResponse(payload);
    return dispatch(ADD_ACTION, epso);
  },

  importEndpointParameters({ dispatch }, payload?: Array<EndpointParameterResponse>): any {
    if (!payload) return [];
    return Promise.all(
      payload.map((er: EndpointParameterResponse) => dispatch(IMPORT_ACTION, er)),
    );
  },
};
export default actions;
