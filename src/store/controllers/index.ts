import { Module } from 'vuex';
import { RootState } from '@/store/state';
import state, { ControllerState } from './state';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';

const m: Module<ControllerState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
export default m;
