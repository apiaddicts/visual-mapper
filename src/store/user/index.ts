import { Module } from 'vuex';
import actions from './actions';
import mutations from './mutations';
import { RootState } from '../state';

const m: Module<any, RootState> = {
  namespaced: true,
  state: {
    token: false,
  },
  mutations,
  actions,
};

export default m;
