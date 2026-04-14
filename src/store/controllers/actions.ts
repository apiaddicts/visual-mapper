/* eslint-disable */

import { ActionTree } from 'vuex';
import { RootState } from '@/store/state';
import { ControllerState, ControllerStoreObject } from './state';
import { ControllerResponse, mapControllerResponse } from '@/models/ControllerResponse';
import { KeyValue } from '@/models/KeyValue';
import { EndpointStoreObject } from '../endpoints/state';

const actions: ActionTree<ControllerState, RootState> = {

  addController({ commit, getters }, payload: ControllerStoreObject): any {
    const vkController: KeyValue<ControllerStoreObject> = {
      key: payload.name,
      value: payload,
    };
    if (getters.existsController(payload.name)) { throw new Error(`El controlador con nombre ${payload.name} ya se ha cargado. No se pueden repetir.`); }
    commit('ADD', vkController);
    return vkController;
  },

  importController({ dispatch }, payload: ControllerResponse): any {
    const cso: ControllerStoreObject = mapControllerResponse(payload);
    return dispatch('endpoints/importEndpoints', payload.endpoints, { root: true })
      .then((kves: Array<KeyValue<EndpointStoreObject>>) => {
        cso.endpoints = kves.map(x => x.key);
        return dispatch('addController', cso);
      });
  },

  importControllers({ dispatch }, payload?: Array<ControllerResponse>): Promise<any> {
    if (!payload) return Promise.all([]);
    if (payload !== undefined && payload !== null && payload.length !== undefined && payload.length > 1) {
      payload.sort((controller1: any, controller2: any) => {
        if (controller1.name === undefined || controller2.name === undefined) {
          return -1;
        }
        return controller1.name.localeCompare(controller2.name, 'es-ES');
      });
    }
    return Promise.all(
      // Omite el controlador con /status que no se cargará
      payload.filter((cr: ControllerResponse) => {
        if (cr !== undefined && cr.request_mapping !== undefined && cr.request_mapping !== '/status') {
          return cr;
        }
      }).map((cr: ControllerResponse) => dispatch('importController', cr)),
    );
  },
};
export default actions;
