import { createStore, StoreOptions, mapState } from 'vuex';

import state, { RootState } from './state';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';

/* import modules */
import userStore from './user/index';
import applicationStore from './application/index';
import connectionStore from './connection/index';
import controllers from './controllers/index';
import endpoints from './endpoints/index';
import endpointAttributes from './endpoint-attributes/index';
import endpointParameters from './endpoint-parameters/index';
import entities from './entities/index';
import entityAttributes from './entity-attributes/index';
import authStore from './auth/index';

const storeOptions: StoreOptions<RootState> = {
  state,
  actions,
  mutations,
  getters,
  modules: {
    userStore,
    applicationStore,
    connectionStore,
    controllers,
    endpoints,
    endpointAttributes,
    endpointParameters,
    entities,
    entityAttributes,
    authStore,
  },
};

export function mapTypedState<State>(keys: (string & keyof State)[]) {
  type Key = typeof keys[number];
  return mapState(keys) as {
    [key in Key]: State[key];
  };
}

export function mapRootState(keys: (keyof RootState)[]): RootState {
  return mapTypedState<RootState>(keys);
}

export default createStore<RootState>(storeOptions);
