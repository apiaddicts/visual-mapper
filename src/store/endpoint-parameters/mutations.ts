/* eslint-disable no-param-reassign */
import { MutationTree } from 'vuex';
import { KeyValue } from '@/models/KeyValue';
import {
  EndpointParameterStoreObject, EndpointParametersState,
} from './state';

const mutations: MutationTree<EndpointParametersState> = {
  ADD(state, payload: KeyValue<EndpointParameterStoreObject>) {
    state.list.push(payload.key);
    state._[payload.key] = payload.value;
  },
  UPDATE(state, payload: KeyValue<EndpointParameterStoreObject>) {
    state._[payload.key] = payload.value;
  },
  REMOVE(state, payload: string) {
    state.list = state.list.filter((k) => k !== payload);
    delete state._[payload];
  },
  RESET_ENTITYMAPPING(state, payload: any) {
    payload.forEach((key: string) => {
      if (state._[key] && state._[key].entity_mapping) {
        state._[key].entity_mapping = undefined;
      }
    });
  },
};
export default mutations;
