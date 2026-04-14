import { GetterTree } from 'vuex';
import state, { RootState } from './state';

const getters: GetterTree<RootState, RootState> = {
  // eslint-disable-next-line no-shadow
  isProduction(state): boolean {
    return state.environment === 'production';
  },

  apiDefinition(): string {
    return state.api_definition;
  },

  asyncApiDefinition(): string {
    return state.async_api_definition;
  },

  asyncApi(): any {
    return state.async_api_definition_object;
  },

  asyncApiExtraTables(): string[] {
    return state.async_api_extra_tables;
  },

  asyncApiServers(): string[] {
    return state.async_api_servers;
  },
};
export default getters;
