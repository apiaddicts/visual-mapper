/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
import { App } from 'vue';
import axios, {
  AxiosInstance, AxiosRequestConfig, AxiosPromise, AxiosError, AxiosResponse, 
} from 'axios';
import ConfigGenerationFile from '@/store/config-generation-file';
import authState from '../store/auth/state';
import { authApi } from './auth-api.service'; // Eliminado AuthApiResponse (warning solucionado)

export interface ProjectGenApiResponse <T = any> {
  result: {
    status: boolean,
    http_code: number,
    info: string,
  }
  data: T
}

const CONFIG: AxiosRequestConfig = {
  baseURL: process.env.VUE_APP_PROJECT_GEN_API_URL,
  withCredentials: false,
  headers: {
    Accept: '*/*',
    'Content-Type': 'application/json',
  },
  responseType: 'blob',
};

class ProjectGenApiConnection {
  private connection: AxiosInstance;

  private try: number;

  private tryMax: number;

  constructor(cfg: AxiosRequestConfig) {
    this.connection = axios.create(cfg);
    this.connection.interceptors.request.use(this.tokenHandler as any);
    this.connection.interceptors.response.use(
      this.responseHandler,
      this.errorResponseHandler,
    );
    this.try = 0;
    this.tryMax = Number(process.env.VUE_APP_REQUEST_RETRY) || 0;
  }

  tokenHandler = async (config: AxiosRequestConfig) => {
    const useToken = Number(process.env.VUE_APP_OAUTH_GENERATE_ACCESS_TOKEN);
    if (useToken) {
      if (new Date().getTime() >= authState.expiration) {
        const response: any = await authApi.getToken();
        config.headers!.Authorization = `Bearer ${response.access_token}`;
        authState.token = response.access_token;
      }
      if (!authState.token) {
        const response: any = await authApi.getToken();
        config.headers!.Authorization = `Bearer ${response.access_token}`;
      } else {
        config.headers!.Authorization = `Bearer ${authState.token}`;
      }
    }
    return config;
  };

  responseHandler = (response: AxiosResponse<ProjectGenApiResponse>) => {
    if (!response.data) { throw new Error('Response has no expected structure'); }
    return response;
  };

  errorResponseHandler = (error: AxiosError<ProjectGenApiResponse>) => {
    throw error;
  };

  generateProject = (payload: ConfigGenerationFile, downloadLinks: boolean, config: any = {}): AxiosPromise<ProjectGenApiResponse> => this.connection.post<ProjectGenApiResponse>(downloadLinks === true ? '/project/japi?download_links=true' : '/project/japi', payload, config);
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $projectGenApi: ProjectGenApiConnection;
    $additionalEntities: any;
    $selectAdditionalEntity: (selectedValue: any) => void;
    $removeAdditionalEntity: (controllerKey: any, removedValue: any) => void;
  }
}

export const projectGenApi = new ProjectGenApiConnection(CONFIG);
export const additionalEntities: any = {};

const ProjectGenApiService = {
  install: (app: App): void => {
    const { globalProperties } = app.config;

    globalProperties.$projectGenApi = projectGenApi;
    globalProperties.$additionalEntities = additionalEntities;

    // Definir las funciones ANTES de hacer provide
    globalProperties.$selectAdditionalEntity = (selectedValue: any) => {
      if (globalProperties.$additionalEntities[selectedValue] !== null && globalProperties.$additionalEntities[selectedValue] !== undefined) {
        globalProperties.$additionalEntities[selectedValue] += 1;
      } else {
        globalProperties.$additionalEntities[selectedValue] = 1;
      }
    };

    globalProperties.$removeAdditionalEntity = (controllerKey: any, removedValue: any) => {
      if (globalProperties.$additionalEntities[removedValue] !== null && globalProperties.$additionalEntities[removedValue] !== undefined) {
        globalProperties.$additionalEntities[removedValue] -= 1;
      }
    };

    // Ahora hacer provide con las funciones ya definidas
    app.provide('$projectGenApi', projectGenApi);
    app.provide('$additionalEntities', additionalEntities);
    app.provide('$selectAdditionalEntity', globalProperties.$selectAdditionalEntity);
    app.provide('$removeAdditionalEntity', globalProperties.$removeAdditionalEntity);
  },
};

export default ProjectGenApiService;
