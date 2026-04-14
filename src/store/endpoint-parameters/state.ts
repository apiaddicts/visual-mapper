export interface EntityMapping {
  name: string;
  type: string;
}

export interface AllowedValues {
  value?: string,
}

export interface Validation {
  type: string,
  value?: string,
  values?: Array<AllowedValues>,
}

export interface EndpointParameterStoreObject {
  in: string,
  name: string,
  type: string,
  format?: string,
  // defaultValue?: string,
  // minValue?: string,
  // maxValue?: string,
  // eslint-disable-next-line
  entity_mapping?: EntityMapping,
  // entityMapping?: EntityMapping,
  // required?: boolean,
  // maxLength?: number,
  // minLength?: number,
  // allowedValues?: Array<string>,
  validations?: Array<Validation>,
  example?: string,
}

export interface EndpointParametersState {
  _: {
    [key: string]: EndpointParameterStoreObject
  },
  list: Array<string>,
}

const state: EndpointParametersState = {
  _: {},
  list: [],
};
export default state;
