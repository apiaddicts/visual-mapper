/* eslint-disable no-shadow */
import { GetterTree } from 'vuex';
import { RootState } from '@/store/state';
import { EndpointAttributesState } from './state';

const getters: GetterTree<EndpointAttributesState, RootState> = {
  exportData: (state, getters) => (key: string): any => {
    const o = state._[key];
    if (!o) return undefined;
    return {
      name: o.name,
      type: o.type,
      type_of_array: o.type_of_array,
      validations: o.validations,
      active: o.active,
      entity_mapping: o.entity_mapping,
      relation_type: o.relation_type,
      related_entity: o.related_entity,
      resolved_entity: o.resolved_entity,
      attributes: o.attributes?.map((x) => getters.exportData(x)),
      example: o.example,
      description: o.description,
    };
  },
};
export default getters;
