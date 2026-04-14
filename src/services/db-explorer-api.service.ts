/* eslint-disable */
import { App } from 'vue';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosPromise } from 'axios';

const isDev = process.env.NODE_ENV === 'development';

const BASE_URL = isDev
  ? '/db-explorer'
  : (process.env.VUE_APP_DB_EXPLORER_URL || 'http://localhost:8080');

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
};

if (process.env.VUE_APP_API_KEY) {
  headers.apikey = process.env.VUE_APP_API_KEY;
}

const CONFIG: AxiosRequestConfig = {
  baseURL: BASE_URL,
  withCredentials: false,
  headers,
};

export type DatabaseType = 'POSTGRES' | 'ORACLE' | 'MYSQL' | 'SQLSERVER' | 'MARIADB';

export interface DatabaseTypeOption {
  value: DatabaseType;
  label: string;
}

export const DATABASE_TYPES: DatabaseTypeOption[] = [
  { value: 'POSTGRES', label: 'PostgreSQL' },
  { value: 'ORACLE', label: 'Oracle' },
  { value: 'MYSQL', label: 'MySQL' },
  { value: 'SQLSERVER', label: 'SQL Server' },
  { value: 'MARIADB', label: 'MariaDB' },
];

export interface DatasourcePayload {
  type: DatabaseType;
  host: string;
  port: number;
  schema: string;
  database: string;
  username: string;
  password: string;
}

export interface DatasourceResponse {
  id: number;
  type: string;
  host: string;
  port: number;
  schema: string;
  database: string;
  username: string;
}

export interface TableInfo {
  name: string;
  schema?: string;
}

export interface ConfigControllerPayload {
  table: string;
  methods: string[];
}

export interface ConfigPayload {
  controllers: ConfigControllerPayload[];
}

export interface ConfigEntityAttribute {
  name: string;
  type: string;
  type_of_array?: string;
  column?: {
    name: string;
    primary_key?: boolean;
    unique?: boolean;
    sequence_name?: string;
    type?: string;
    precision?: number;
    scale?: number;
    length?: number;
  };
  validations?: Array<{
    type: string;
    value?: string;
    values?: any[];
  }>;
  relation?: {
    type: string;
    owner?: boolean;
    foreign_class: string;
    foreign_table: string;
    columns?: any;
    intermediate_table?: string;
    foreign_schema: string;
  };
  resolved_entity?: string;
}

export interface ConfigEntity {
  name: string;
  table: string;
  attributes: ConfigEntityAttribute[];
  is_view?: boolean;
  db_schema: string;
}

export interface ConfigResponse {
  entities: ConfigEntity[];
  controllers?: any[];
}

class DbExplorerApiService {
  private connection: AxiosInstance;

  constructor(cfg: AxiosRequestConfig) {
    this.connection = axios.create(cfg);
  }

  createDatasource(payload: DatasourcePayload): AxiosPromise<any> {
    return this.connection.post('/datasources', payload);
  }

  getTables(datasourceId: number | string): AxiosPromise<any> {
    return this.connection.get(`/datasources/${encodeURIComponent(datasourceId)}/tables`);
  }

  getConfigs(datasourceId: number | string, payload: ConfigPayload): AxiosPromise<any> {
    return this.connection.post(`/datasources/${encodeURIComponent(datasourceId)}/configs`, payload);
  }

  createDatabase(type: DatabaseType, database: string, file: File): AxiosPromise<any> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('database', database);
    formData.append('file', file);
    return this.connection.post('/databases', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

export const dbExplorerApi = new DbExplorerApiService(CONFIG);

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dbExplorerApi: DbExplorerApiService;
  }
}

const DbExplorerApiPlugin = {
  install: (app: App): void => {
    const { globalProperties } = app.config;
    globalProperties.$dbExplorerApi = dbExplorerApi;
    app.provide('$dbExplorerApi', dbExplorerApi);
  },
};

export default DbExplorerApiPlugin;
