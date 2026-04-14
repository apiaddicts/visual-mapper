/* eslint-disable no-param-reassign */
import { MutationTree } from 'vuex';
import { KeyValue } from '@/models/KeyValue';
import { EndpointState, EndpointStoreObject } from './state';

const mutations: MutationTree<EndpointState> = {
  ADD(state, payload: KeyValue<EndpointStoreObject>) {
    state.list.push(payload.key);
    state._[payload.key] = payload.value;
  },
  UPDATE(state, payload: KeyValue<EndpointStoreObject>) {
    state._[payload.key] = payload.value;
  },
  REMOVE(state, payload: string) {
    state.list = state.list.filter((k) => k !== payload);
    delete state._[payload];
  },
  SET_ENTITY_CLASS_NAME(state, payload: KeyValue<string>) {
    state._[payload.key].entity = payload.value;
  },
};
export default mutations;
