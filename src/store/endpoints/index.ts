import { Module } from 'vuex';
import state, { EndpointState } from './state';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { RootState } from '../state';

const m: Module<EndpointState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
export default m;
