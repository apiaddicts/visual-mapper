/* eslint-disable no-shadow */
import { GetterTree } from 'vuex';
import { RootState } from '@/store/state';
import { EndpointParametersState } from './state';

const getters: GetterTree<EndpointParametersState, RootState> = {
  exportData: (state) => (key: string): any => {
    const o = state._[key];
    return {
      in: o.in,
      name: o.name,
      type: o.type,
      format: o.format,
      entity_mapping: o.entity_mapping,
      validations: o.validations,
      example: o.example,
    };
  },

};
export default getters;
