import { GetterTree } from 'vuex';
import { RootState } from '@/store/state';
import { AuthState } from './state';

const getters: GetterTree<AuthState, RootState> = {
  getToken(state: any): any {
    return { token: state.token, expiration: state.expiration };
  },
};
export default getters;
