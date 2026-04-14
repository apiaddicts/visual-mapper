/* eslint-disable no-new */
export default {
  setToken({ commit } : any, token: any) {
    new Promise<void>((resolve) => {
      commit('SET_TOKEN', token);
      resolve();
    });
  },
};
