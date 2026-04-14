import { MutationTree } from 'vuex';
import { RootState } from './state';

const mutations: MutationTree<RootState> = {
  SET_API_DEFINITION(state: any, value: any) {
    state.api_definition = value;
  },
  SET_ASYNC_API_DEFINITION(state: any, value: any) {
    state.async_api_definition = value;
  },
  SET_ASYNC_API_DEFINITION_OBJECT(state: any, value: any) {
    state.async_api_definition_object = value;
  },
  SET_ASYNC_API_SERVERS(state: any, value: any) {
    state.async_api_servers = value;
  },
  SET_ASYNC_API(state: any, value: any) {
    state.async_api_definition_object = value;
  },
  SET_ASYNC_API_EXTRA_TABLES(state: any, value: any) {
    state.async_api_extra_tables = value;
  },
  SET_TOTAL_NUMBER_OF_TABLES(state: any, value: any) {
    state.total_number_of_tables = value;
  },
  SET_TABLES_WITHOUT_PK(state: any, value: any) {
    state.tables_without_PK = value;
  },
};
export default mutations;
