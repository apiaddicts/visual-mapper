/* eslint-disable no-param-reassign */
import { MutationTree } from 'vuex';
import { KeyValue } from '@/models/KeyValue';
import {
  EndpointAttributeStoreObject, EndpointAttributesState, Validation,
} from './state';
import { EntityAttributeStoreObject } from '../entity-attributes/state';

const mutations: MutationTree<EndpointAttributesState> = {
  SET_NAME(state, payload: KeyValue<string>) {
    state._[payload.key].name = payload.value;
  },

  SET_TYPE(state, payload: KeyValue<string>) {
    state._[payload.key].type = payload.value;
  },

  SET_TYPE_OF_ARRAY(state, payload: KeyValue<string>) {
    state._[payload.key].type_of_array = payload.value;
  },

  SET_ENTITY_TYPE(state, payload: KeyValue<string>) {
    state._[payload.key].entity_mapping.type = payload.value;
  },

  SET_ENTITY_TYPE_OF_ARRAY(state, payload: KeyValue<string>) {
    state._[payload.key].entity_mapping.type_of_array = payload.value;
  },

  SET_ENTITY_NAME(state, payload: KeyValue<string>) {
    state._[payload.key].entity_mapping.name = payload.value;
  },

  SET_ENTITY_RELATED_ENTITY(state, payload: KeyValue<string>) {
    state._[payload.key].related_entity = payload.value;
  },

  SET_VALIDATIONS(state, payload: KeyValue<Array<Validation>>) {
    state._[payload.key].validations = payload.value;
  },

  SET_ISACTIVE(state, payload: KeyValue<boolean>) {
    state._[payload.key].active = payload.value;
  },
  
  SET_RELATEDENTITY(state, payload: KeyValue<string>) {
    state._[payload.key].related_entity = payload.value;
  },
  
  SET_RELATEDENTITY_ATTRIBUTES(state, payload: KeyValue<any>) {
    state._[payload.key].attributes = payload.value;
  },
  
  SET_ENTITYMAPPING(state, payload: KeyValue<EntityAttributeStoreObject>) {
    state._[payload.key].entity_mapping.name = payload.value.name;
    state._[payload.key].entity_mapping.type = payload.value.type;
    state._[payload.key].entity_mapping.foreign_table = payload.value.foreign_table;

    if (payload.value.relation !== undefined && payload.value.relation.foreign_table !== undefined) {
      state._[payload.key].entity_mapping.foreign_table = payload.value.relation.foreign_table;
    }

    state._[payload.key].entity_mapping.resolved_entity = payload.value.resolved_entity;

    if (payload.value.type_of_array !== undefined) {
      state._[payload.key].entity_mapping.type_of_array = payload.value.type_of_array;
    }

    if (payload.value.name === '' && payload.value.type === '') {
      state._[payload.key].entity_mapping.is_calculated = true;
    } else {
      state._[payload.key].entity_mapping.is_calculated = false;
    }

    if (payload.validations) {
      state._[payload.key].validations = payload.value.validations;
    }
  },
  
  RESET_ENTITYMAPPING(state, payload: any) {
    payload.forEach((key: string) => {
      if (state._[key] && state._[key].entity_mapping) {
        state._[key].entity_mapping.name = '';
        state._[key].entity_mapping.type = '';
        state._[key].entity_mapping.type_of_array = '';
        state._[key].entity_mapping.is_calculated = true;
        state._[key].entity_mapping.foreign_table = '';
        state._[key].entity_mapping.resolved_entity = '';
      }
      if (state._[key].attributes) {
        const subAttributes = state._[key].attributes;
        if (subAttributes) {
          subAttributes.forEach((subAttributeKey) => {
            state._[subAttributeKey].entity_mapping.name = '';
            state._[subAttributeKey].entity_mapping.type = '';
            state._[subAttributeKey].entity_mapping.type_of_array = '';
          });
        } else {
          state._[key].entity_mapping.is_calculated = true;
        }
      }
    });
  },
  
  SET_MAPPED_BY_ENDPOINT(state, payload: KeyValue<string>) {
    state._[payload.key].mappedByEndpoint = payload.value;
  },

  SET_SUPPRESS_UNPROPAGATE(state, value: boolean) {
    state.suppressUnpropagate = value;
  },

  ADD(state, payload: KeyValue<EndpointAttributeStoreObject>) {
    if (payload.value.entity_mapping.type !== undefined && payload.value.entity_mapping.type !== '' 
     && payload.value.entity_mapping.name !== undefined && payload.value.entity_mapping.name !== '') {
      payload.value.entity_mapping.is_calculated = false;
    } else if (payload.value.entity_mapping.is_calculated === undefined) {
      payload.value.entity_mapping.is_calculated = true;
    }
    state.list.push(payload.key);
    state._[payload.key] = payload.value;
  },

  UPDATE(state, payload: KeyValue<EndpointAttributeStoreObject>) {
    state._[payload.key] = payload.value;
  },

  REMOVE(state, payload: string) {
    state.list = state.list.filter((k) => k !== payload);
    delete state._[payload];
  },

  SET_ANONYMIZATION(state, payload: KeyValue<string>) {
    state._[payload.key].anonymization = payload.value;
  },

  UPDATE_ATTRIBUTES(state, payload: KeyValue<any>) {
    state._[payload.key].attributes = payload.value;
  },

};
export default mutations;
