/* eslint-disable camelcase */
import { GetterTree } from 'vuex';
import { RootState } from '@/store/state';
import { ConnectionState, ConnectionStateDatasourceObject, ConnectionStateObject } from './state';

const getters: GetterTree<ConnectionState, RootState> = {
  hasConnectionData(state): boolean {
    return !!state.host && !!state.port && !!state.database
      && !!state.username && !!state.password;
  },
  connectionData(state: ConnectionState): ConnectionStateDatasourceObject {
    const {
      type,
      host,
      port,
      schema,
      database,
      username,
      password,
    } = state;
    return {
      type,
      host,
      port,
      schema,
      database,
      username,
      password,
    };
  },
  getIsOpen(state: ConnectionState): boolean {
    return state.is_open;
  },
  exportData(state: ConnectionState): ConnectionStateObject {
    return {
      configuration: {
        datasource: {
          type: state.type,
          host: state.host,
          port: state.port,
          schema: state.schema,
          database: state.database,
          username: state.username,
          password: state.password,
        },
      },
    };
  },
  getConnectionId(state: ConnectionState): number | string | null {
    return state.id || null;
  },
};
export default getters;
