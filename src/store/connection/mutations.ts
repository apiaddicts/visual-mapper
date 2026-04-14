/* eslint-disable no-param-reassign */
import { MutationTree } from 'vuex';
import { DatabaseType } from '@/services/db-explorer-api.service';
import { ConnectionState } from './state';

const mutations: MutationTree<ConnectionState> = {
  SET_ID(state, value: number | string | undefined) {
    state.id = value;
  },
  SET_OPEN(state, value: boolean) {
    state.is_open = value;
  },
  SET_TYPE(state, value: DatabaseType) {
    state.type = value;
  },
  SET_HOST(state, value: string) {
    state.host = value;
  },
  SET_PORT(state, value: string) {
    state.port = value;
  },
  SET_SCHEMA(state, value: string) {
    state.schema = value;
  },
  SET_DATABASE(state, value: string) {
    state.database = value;
  },
  SET_USERNAME(state, value: string) {
    state.username = value;
  },
  SET_PASSWORD(state, value: string) {
    state.password = value;
  },
  SET_ISCONNECTED(state, value: boolean) {
    state.is_connected = value;
  },
};
export default mutations;
