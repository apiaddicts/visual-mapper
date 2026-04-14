export interface AuthState {
    token: string,
    expiration: number
  }

const state: AuthState = {
  token: '',
  expiration: new Date().getTime(),
};
export default state;
