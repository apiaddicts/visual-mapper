import { DatabaseType } from '@/services/db-explorer-api.service';

export interface ConnectionState {
  is_open: boolean,
  id?: number | string,
  type: DatabaseType,
  host?: string,
  port?: string,
  schema?: string,
  database?: string,
  username?: string,
  password?: string,
  is_connected: boolean,
}

export interface ConnectionStateDatasourceObject {
  type: DatabaseType,
  host?: string,
  port?: string,
  schema?: string,
  database?: string,
  username?: string,
  password?: string,
}

export interface ConnectionStateObject {
  configuration: {
    datasource?: ConnectionStateDatasourceObject
  }
}

const state: ConnectionState = {
  is_open: true,
  id: undefined,
  type: 'POSTGRES',
  host: '',
  port: '5432',
  schema: 'public',
  database: '',
  username: '',
  password: '',
  is_connected: false,
};

export default state;
