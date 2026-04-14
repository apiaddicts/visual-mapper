import { MutationTree } from 'vuex';
import { KeyValue } from '@/models/KeyValue';
import { EntityAttributeStoreObject, EntityAttributesState } from './state';

const mutations: MutationTree<EntityAttributesState> = {
  ADD(state, payload: KeyValue<EntityAttributeStoreObject>) {
    state.list.push(payload.key);
    state._[payload.key] = payload.value;
  },
  UPDATE(state, payload: KeyValue<EntityAttributeStoreObject>) {
    state._[payload.key] = payload.value;
  },
  REMOVE(state, payload: string) {
    state.list = state.list.filter((k) => k !== payload);
    delete state._[payload];
  },
};
export default mutations;
