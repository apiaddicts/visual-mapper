/* eslint-disable */
import { App } from 'vue';
import axios, {
  AxiosInstance, AxiosRequestConfig, AxiosPromise, AxiosError, AxiosResponse,
} from 'axios';
import authState from '../store/auth/state';
import { authApi } from './auth-api.service';
const uuid = require('uuid');

const { VUE_APP_DEBUG_PODS } = process.env;
const { VUE_APP_CONFIG_GEN_API_URL_DEBUG_POD1 } = process.env;
const { VUE_APP_CONFIG_GEN_API_URL_DEBUG_POD2 } = process.env;
let actualPod = 0;

const CONFIG: AxiosRequestConfig = {
  baseURL: process.env.VUE_APP_CONFIG_GEN_API_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
};

export interface ConfigGenApiResponse <T = any> {
  result: {
    status: boolean,
    http_code: number,
    info: string,
  }
  data: T
}
class ConfigGenApiConnection {
  private connection: AxiosInstance;

  private try: number;

  private tryMax: number;

  constructor(cfg: AxiosRequestConfig) {
    this.connection = axios.create(cfg);
    this.connection.interceptors.request.use(this.tokenHandler);
    this.connection.interceptors.response.use(
      this.responseHandler,
      this.errorResponseHandler,
    );
    this.try = 0;
    this.tryMax = 3;
  }

  tokenHandler = async (config: AxiosRequestConfig = CONFIG) => {
    const useToken = Number(process.env.VUE_APP_OAUTH_GENERATE_ACCESS_TOKEN);
    if (useToken) {
      // const { token, expiration } = authState;
      // const { token } = authState;
      if (new Date().getTime() >= authState.expiration) {
        const response: any = await authApi.getToken();
        authState.token = response.access_token;
        authState.expiration = new Date().getTime() + response.expires_in * 1000;
        //store.commit('SET_TOKEN', {'token': `${response.access_token}`, 'expiration': new Date().getTime() + response.expires_in});
        config.headers!.Authorization = `Bearer ${response.access_token}`;
      }
      // else
      if (!authState.token) {
        // throw new Error('No existe un token de identificación.');
        console.error('No existe un token de identificación, se procede a solicitar uno nuevo.');
        const response: any = await authApi.getToken();
        config.headers!.Authorization = `Bearer ${response.access_token}`;
      } else {
        config.headers!.Authorization = `Bearer ${authState.token}`;
      }
    }
    return config;
  };

  responseHandler = (response: AxiosResponse<ConfigGenApiResponse>) => {
    if (!response.data) { throw new Error('Falta información en la respuesta del servidor'); }
    if (!response.data.data) { throw new Error('Falta información en la respuesta del servidor'); }
    if (response.data.result === null || response.data.result === undefined) { throw new Error('Falta información en la respuesta del servidor'); }
    if (response.data.result.status === false) { throw new Error('Falta información en la respuesta del servidor'); }
    return response;
  };
  /* eslint-disable */

  errorResponseHandler = (error: AxiosError<ConfigGenApiResponse>) => {
    if ((error.code == null || error.code === undefined) && error.message === 'Network Error' && error.response === undefined) {
      let connectionError = new Error();
      connectionError.name = 'Error de conexión';
      connectionError.message = `${error.config == null || error.config.url == null ? '(Sin URL)' : error.config.url} con método ${error.config!.method !== undefined ? error.config!.method.toUpperCase() : '(Sin método HTTP)'} y error: ${error.message}. Compruebe su conexión a internet y la conectividad con ${process.env.VUE_APP_CONFIG_GEN_API_URL}/status`;
      throw connectionError;
    }
    else {
      throw error;
    }
  };

  postDatasources = (payload: any, config: any = {}): AxiosPromise<ConfigGenApiResponse> => this.makePost('/datasources', payload, config);

  postGetTablesList = (payload: any, config: any = {}): AxiosPromise<ConfigGenApiResponse> => this.makePost('/tables-info/get', payload, config);

  postGetTablesWithoutPrimaryKeys = (payload: any, config: any = {}): AxiosPromise<ConfigGenApiResponse> => this.makePost('/tables/get?tables_without_pk=true', payload, config);

  postGetTables = (payload: any, config: any = {}): AxiosPromise<ConfigGenApiResponse> => this.makePost('/tables-info/names', payload, config);

  postGetTablesData = (payload: any, config: any = {}, tables: string[]): AxiosPromise<ConfigGenApiResponse> => this.makePost(`/tables/get?tables=${tables}`, payload, config);

  postResources = (payload: any, config: any = {}): AxiosPromise<ConfigGenApiResponse> => this.makePost('/resources', payload, config);

  postControllers = (payload: any, config: any = {}): AxiosPromise<ConfigGenApiResponse> => this.makePost('/controllers', payload, config);

  postEntities = (payload: any, config: any = {}): AxiosPromise<ConfigGenApiResponse> => this.makePost('/entities', payload, config);

  postViewsDDL = (payload: any, config: any = {}, views: string[]): AxiosPromise<ConfigGenApiResponse> => this.makePost(`/views-ddl?views=${views}`, payload, config);

  postAsyncAPIParse = (payload: any, config: any = {}): AxiosPromise<ConfigGenApiResponse> => this.makePost('/asyncapi/parse', payload, config);

  postAsyncAPIEntities = (payload: any, config: any = {}): AxiosPromise<ConfigGenApiResponse> => this.makePost('/asyncapi/entities', payload, config);

  makePost = (endpoint: string, payload: any, config: any = {}): AxiosPromise<ConfigGenApiResponse> => {
    if (VUE_APP_DEBUG_PODS == 1 && VUE_APP_CONFIG_GEN_API_URL_DEBUG_POD1 !== null && VUE_APP_CONFIG_GEN_API_URL_DEBUG_POD2 !== null) {
      actualPod == 0 ? config.baseURL = VUE_APP_CONFIG_GEN_API_URL_DEBUG_POD1 : config.baseURL = VUE_APP_CONFIG_GEN_API_URL_DEBUG_POD2;
      actualPod = (actualPod + 1) % 2;
    }

    return this.connection.post<ConfigGenApiResponse>(endpoint, payload, config);
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $configGenApi: ConfigGenApiConnection;
  }
}

export const configGenApi = new ConfigGenApiConnection(CONFIG);

const ConfigGenApiService = {
  install: (app: App, options?: any): void => {
    const { globalProperties } = app.config;
    globalProperties.$configGenApi = configGenApi;
    app.provide('$configGenApi', configGenApi);
  },
};

export default ConfigGenApiService;
