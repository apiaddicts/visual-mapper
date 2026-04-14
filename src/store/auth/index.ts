import { Module } from 'vuex';
import state, { AuthState } from './state';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { RootState } from '../state';

const m: Module<AuthState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

export default m;
