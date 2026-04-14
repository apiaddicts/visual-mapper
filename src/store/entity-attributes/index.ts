import { Module } from 'vuex';
import state, { EntityAttributesState } from './state';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { RootState } from '../state';

const m: Module<EntityAttributesState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
export default m;
