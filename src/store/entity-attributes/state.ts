export interface Column {
  name?: string,
  primary_key?: boolean,
  unique?: boolean,
  sequence_name?: string, 
  type?: string, 
  precision?: number,
  scale?: number, 
  length?: number
}

export interface Relation {
  type: string,
  owner?: boolean,
  foreign_class: string,
  foreign_table: string,
  columns?: any,
  intermediate_table?: string,
  foreign_schema: string,
}

export interface Validation {
  type: string,
  value?: string,
  values?: any[],
}

export interface EntityAttributeStoreObject {
  name: string,
  type: string,
  foreign_table?: string,
  type_of_array?: string,
  column?: Column,
  validations?: Array<Validation>,
  relation?: Relation,
  related_entity?: string,
  resolved_entity?: string
}

export interface EntityAttributesState {
  _: {
    [key: string]: EntityAttributeStoreObject
  },
  list: Array<string>,
}

const state: EntityAttributesState = {
  _: {},
  list: [],
};

export default state;
