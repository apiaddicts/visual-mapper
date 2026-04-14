import { Module } from 'vuex';
import state, { ConnectionState } from './state';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { RootState } from '../state';

const m: Module<ConnectionState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
export default m;
