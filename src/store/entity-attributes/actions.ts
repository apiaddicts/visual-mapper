import { ActionTree } from 'vuex';
import { nanoid } from 'nanoid';
import { RootState } from '@/store/state';
import { KeyValue } from '@/models/KeyValue';
import { EntityAttributeResponse, mapEntityAttributeResponse } from '@/models/EntityResponse';
import { EntityAttributesState, EntityAttributeStoreObject } from './state';

const ADD_ACTION = 'addEntityAttribute';
const IMPORT_ACTION = 'importEntityAttribute';

const actions: ActionTree<EntityAttributesState, RootState> = {
  addEntityAttribute({ commit }, payload: EntityAttributeStoreObject): any {
    const kveaso: KeyValue<EntityAttributeStoreObject> = {
      key: nanoid(10),
      value: payload,
    };
    commit('ADD', kveaso);
    return kveaso;
  },

  importEntityAttribute({ dispatch }, payload: EntityAttributeResponse): any {
    const easo: EntityAttributeStoreObject = mapEntityAttributeResponse(payload);
    return dispatch(ADD_ACTION, easo);
  },

  importEntityAttributes({ dispatch }, payload?: Array<EntityAttributeResponse>): any {
    if (!payload) return [];
    return Promise.all(
      payload.map((er: EntityAttributeResponse) => dispatch(IMPORT_ACTION, er)),
    );
  },
};
export default actions;
