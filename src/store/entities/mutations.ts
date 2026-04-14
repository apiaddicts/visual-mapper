import { MutationTree } from 'vuex';
import { KeyValue } from '@/models/KeyValue';
import { EntityState, EntityStoreObject, TableWithoutPK } from './state';

const mutations: MutationTree<EntityState> = {
  ADD(state, payload: KeyValue<EntityStoreObject>) {
    if (!state.list.includes(payload.key)) {
      state.list.push(payload.key);
    }
    state._[payload.key] = payload.value;
  },

  UPDATE(state, payload: KeyValue<EntityStoreObject>) {
    state._[payload.key] = payload.value;
  },
  
  REMOVE(state, payload: any) {
    if (payload != null && payload.previouslySelectedEntityName != null) {
      state.list = state.list.filter((k) => k !== payload.previouslySelectedEntityName.toLowerCase());
      delete state._[payload.previouslySelectedEntityName.toLowerCase()];
    }
  },
  
  SET_LIST(state, payload: Array<string>) {
    state.list = payload;
  },
  
  SET_TABLES(state, payload: Array<string>) {
    state.tables = payload;
  },
  
  SET_TABLES_WITHOUT_PK(state, payload: TableWithoutPK[]) {
    state.tables_without_PK = payload;
  },
  
  SET_TOTAL_NUMBER_OF_TABLES(state, payload: number | undefined) {
    state.total_number_of_tables = payload;
  },
};
export default mutations;
