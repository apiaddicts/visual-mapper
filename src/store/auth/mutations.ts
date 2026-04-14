/* eslint-disable no-param-reassign */
export default {
  SET_TOKEN(state: any, value: any) {
    state.token = value.token;
    state.expiration = value.expiration;
  },
};
