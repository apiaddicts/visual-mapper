export interface ControllerStoreObject {
  source: string,
  name: string,
  requestMapping: string,
  entity?: string,
  services?: Array<string>,
  commonParameters?: Array<string>,
  additionalEntities?: Set<string>,
  endpoints?: Array<string>,
}

export interface ControllerState {
  _: {
    [key: string]: ControllerStoreObject
  },
  list: Array<string>,
}

export interface ControllerStateObject {
  controllers: ControllerStoreObject[];
}

const state: ControllerState = {
  _: {},
  list: [],
};
export default state;
