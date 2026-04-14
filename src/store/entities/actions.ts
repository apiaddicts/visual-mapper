import { ActionTree } from 'vuex';
import { RootState } from '@/store/state';
import { KeyValue } from '@/models/KeyValue';
import { mapEntityResponse, EntityResponse } from '@/models/EntityResponse';
import { EntityState, EntityStoreObject } from './state';

const ADD_ACTION = 'addEntity';
const IMPORT_ACTION = 'importEntity';

const actions: ActionTree<EntityState, RootState> = {

  addEntity({ commit, getters }, payload: EntityStoreObject): any {
    const vkController: KeyValue<EntityStoreObject> = {
      key: payload.name.toLowerCase(),
      value: payload,
    };
    
    if (getters.existsEntity(payload.name)) { commit('UPDATE', vkController); }
    commit('ADD', vkController);
    return vkController;
  },

  importEntity({ dispatch }, payload: EntityResponse): any {
    const eso: EntityStoreObject = mapEntityResponse(payload);
    return dispatch(ADD_ACTION, eso);
  },

  importEntities({ dispatch }, payload?: Array<EntityResponse>): any {
    if (!payload) return [];
    return Promise.all(
      payload.map((cr: EntityResponse) => dispatch(IMPORT_ACTION, cr)),
    );
  },
};

export default actions;
