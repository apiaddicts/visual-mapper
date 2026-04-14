/* eslint-disable no-param-reassign */
import { MutationTree } from 'vuex';
import { KeyValue } from '@/models/KeyValue';
import { ControllerState, ControllerStoreObject } from './state';

const mutations: MutationTree<ControllerState> = {
  SET_NAME(state, payload: KeyValue<string>) {
    state._[payload.key].name = payload.value;
  },
  SET_REQUEST_MAPPING(state, payload: KeyValue<string>) {
    state._[payload.key].requestMapping = payload.value;
  },
  SET_ENTITY_CLASS_NAME(state, payload: KeyValue<string>) {
    state._[payload.key].entity = payload.value;
  },
  ADD(state, payload: KeyValue<ControllerStoreObject>) {
    state.list.push(payload.key);
    state.list.sort((el1, el2) => el1.localeCompare(el2, 'es-ES'));
    state._[payload.key] = payload.value;
  },
  UPDATE(state, payload: KeyValue<ControllerStoreObject>) {
    state._[payload.key] = payload.value;
  },
  REMOVE(state, payload: string) {
    state.list = state.list.filter((k) => k !== payload);
    delete state._[payload];
  },
  ADD_ADDITIONAL_ENTITY(state, payload: KeyValue<string>) {
    if (state._[payload.key]?.additionalEntities === undefined) {
      state._[payload.key].additionalEntities = new Set();
    }
    const { additionalEntities } = state._[payload.key];
    additionalEntities?.add(payload.value);
    state._[payload.key].additionalEntities = additionalEntities;
  },
  REMOVE_ADDITIONAL_ENTITY(state, payload: KeyValue<string>) {
    const { additionalEntities } = state._[payload.key];
    additionalEntities?.delete(payload.value);
    state._[payload.key].additionalEntities = additionalEntities;
  },
};
export default mutations;
