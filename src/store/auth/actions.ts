/* eslint-disable */
import { ActionTree } from 'vuex';
import { authApi } from '@/services/auth-api.service';
import { AuthState } from './state';
import { RootState } from '@/store/state';

interface TokenData {
  access_token: string,
  expiration: number
}

const actions: ActionTree<AuthState, RootState> = {
  fetchToken({ commit }) {
    return authApi.getToken()
      .then((response: any) => {
        if (response.access_token) {
          commit('SET_TOKEN', {'token': `${response.access_token}`, 'expiration': new Date().getTime() + response.expires_in * 1000});
          //commit('SET_TOKEN', response.access_token);
          return response.access_token;
        }
        return response;
      })
      .catch((err) => {
        if (err !== undefined && (err.code == null || err.code === undefined) && err.message === 'Network Error') {
          err.name = 'Error de conexión';
          err.message = `${err.config == null || err.config.url == null ? '(Sin URL)' : err.config.url} con método ${err.config.method !== undefined ? err.config.method.toUpperCase() : '(Sin método HTTP)'} y error: ${err.message}. Compruebe su conexión a internet y la conectividad con ${process.env.VUE_APP_CONFIG_GEN_API_URL}/status`;
        }
        else if (err.code === 'ECONNABORTED' && err.isAxiosError === true) {
          err.name = 'Error de conexión';
          err.message = `Se ha producido un error de timeout tratando de conectar a ${err.config == null || err.config.url == null ? '(Sin URL)' : err.config.url} con método ${err.config.method !== undefined ? err.config.method.toUpperCase() : '(Sin método HTTP)'} puesto que se han superado ${20000}ms de timeout`;
        }
        throw err;
      });
  },
  setToken({ commit }, tokenData: TokenData) {
    new Promise<void>((resolve) => {
      commit('SET_TOKEN', tokenData);
      resolve();
    });
  },
};
export default actions;
