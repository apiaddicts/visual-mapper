/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import { App } from 'vue'; // Cambiado de PluginFunction
import axios, {
  AxiosInstance, AxiosRequestConfig, AxiosPromise, AxiosError, AxiosResponse,
} from 'axios';
import qs from 'qs';

const CONFIG: AxiosRequestConfig = {
  baseURL: process.env.VUE_APP_AUTH_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${btoa(`${process.env.VUE_APP_AUTH_CLIENT_ID}:${process.env.VUE_APP_AUTH_CLIENT_SECRET}`)}`,
  },
  data: qs.stringify({
    grant_type: 'client_credentials',
  }),
  timeout: 20000,
};

export interface AuthApiResponse {
  access_token: string,
  expires_in: number,
  scope: string,
  token_type: string,
  // Agregado para soportar la estructura de error si viene con result
  result?: {
    info: string;
  }
}

const responseHandler = (response: AxiosResponse<any>) => {
  if (response.data) return response.data;
  throw new Error('GENERIC');
};

const errorResponseHandler = (error: AxiosError<any>) => {
  let { message } = error;
  
  if (error.response) {
    const { data } = error.response;
    if (data && data.result) {
      message = data.result.info;
    }
  } else if (error.request) {
    message = 'GENERIC';
  }

  const err = new Error(message);
  err.name = 'HTTP Error';
  throw err;
};

class AuthApiConnection {
  private connection: AxiosInstance;

  constructor(cfg: AxiosRequestConfig) {
    this.connection = axios.create(cfg);
    this.connection.interceptors.response.use(
      responseHandler,
      errorResponseHandler,
    );
  }

  getToken = (payload: string = CONFIG.data, config: any = { headers: CONFIG.headers }): AxiosPromise<AuthApiResponse> => this.connection.post<AuthApiResponse>('/', payload, config);
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $authApi: AuthApiConnection;
  }
}

export const authApi = new AuthApiConnection(CONFIG);

const AuthApiService = {
  install(app: App): void {
    app.config.globalProperties.$authApi = authApi;
  },
};

export default AuthApiService;
