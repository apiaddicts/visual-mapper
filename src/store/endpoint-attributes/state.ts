// export interface Conversion {
//   type: string,
//   value: string
// }

/* eslint-disable camelcase */
export interface EntityMapping {
  name: string,
  type: string,
  foreign_table?: string,
  type_of_array: string,
  is_calculated?: boolean,
  resolved_entity?: string
}

export interface AllowedValues {
  value?: string,
}

export interface Validation {
  name?: string,
  type: string,
  value?: string,
  values?: Array<AllowedValues>,
}

export interface EndpointAttributeStoreObject {
  name: string,
  type: string,
  type_of_array: string,
  active: any,
  validations?: Array<Validation>,
  entity_mapping: EntityMapping,
  attributes?: Array<string>,
  related_entity?: string,
  relation_type: string,
  resolved_entity?: string,
  example?: string,
  description?: string,
  mappedByEndpoint?: string,
  readOnly?: boolean,
  writeOnly?: boolean,
  anonymization?: string,
}

export interface EndpointAttributesState {
  _: {
    [key: string]: EndpointAttributeStoreObject
  },
  list: Array<string>,
  suppressUnpropagate: boolean,
}

const state: EndpointAttributesState = {
  _: {},
  list: [],
  suppressUnpropagate: false,
};
export default state;
