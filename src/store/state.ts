import { InitialConfiguration } from '@/models/InitialConfiguration';
import * as applicationState from './application/state';
import * as connectionState from './connection/state';
import * as endpointsState from './endpoints/state';
import * as authState from './auth/state';
import { AuthState } from './auth/state';
import { ConnectionState } from './connection/state';
import { EndpointState } from './endpoints/state';
import { ApplicationState } from './application/state';

export interface RootState {
  applicationStore: ApplicationState,
  userStore: any,
  connectionStore: ConnectionState,
  controllers: any,
  endpoints: EndpointState,
  endpointAttributes: any,
  endpointParameters: any,
  entities: any,
  entityAttributes: any,
  authStore: AuthState,
  description: string,
  version: string,
  environment: string,
  api_definition: string,
  async_api_definition: string,
  async_api_definition_object: any,
  async_api_extra_tables: string[],
  async_api_servers: string[],
  iframe_initial_configuration?: InitialConfiguration,
}

const state: RootState = {
  applicationStore: applicationState.default,
  userStore: {},
  connectionStore: connectionState.default,
  controllers: {},
  endpoints: endpointsState.default,
  endpointAttributes: {},
  endpointParameters: {},
  entities: {},
  entityAttributes: {},
  authStore: authState.default,
  description: process.env.VUE_APP_DESCRIPTION,
  version: process.env.VUE_APP_VERSION,
  environment: process.env.VUE_APP_ENV,
  api_definition: '',
  async_api_definition: '',
  async_api_definition_object: {},
  async_api_extra_tables: [],
  async_api_servers: [],
  iframe_initial_configuration: undefined,
};

export default state;
