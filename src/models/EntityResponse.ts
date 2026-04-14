/* eslint-disable camelcase */
import { EntityStoreObject } from '@/store/entities/state';
import {
  EntityAttributeStoreObject, Validation, Column, Relation,
} from '@/store/entity-attributes/state';

interface ColumnResponse {
  name: string,
  primary_key?: boolean,
  unique?: boolean,
  sequence_name?: string,
  type?: string, 
  precision?: number,
  scale?: number,
  length?: number
}

interface RelationResponse {
  // type: string,
  // opcional: boolean,
  type: string,
  owner?: boolean,
  foreign_class: string,
  foreign_table: string,
  columns?: any,
  intermediate_table?: string,
  foreign_schema: string,
}

interface ValidationResponse {
  type: string,
  value?: string,
  values?: any[]
}

export interface EntityAttributeResponse {
  name?: string,
  type?: string,
  owner?: boolean,
  type_of_array?: string,
  column?: ColumnResponse
  validations?: Array<ValidationResponse>,
  relation: RelationResponse,
  resolved_entity?: string,
  // relations: any,
}

export interface EntityResponse {
  name?: string,
  table?: string,
  attributes?: Array<EntityAttributeResponse>,
  is_view?: boolean,
  db_schema: string,
}

export const mapEntityAttributeResponse = (ear: EntityAttributeResponse)
: EntityAttributeStoreObject => {
  const column: Column | undefined = ear.column
    ? {
      name: ear.column.name,
      primary_key: ear.column.primary_key,
      unique: ear.column.unique,
      sequence_name: ear.column.sequence_name,
      type: ear.column.type, 
      precision: ear.column.precision, 
      scale: ear.column.scale,
      length: ear.column.length, 
    }
    : undefined;
  const validations: Array<Validation> | undefined = ear.validations
    ? ear.validations.map((v) => ({
      type: v.type,
      value: v.value,
      values: v.values,
    }))
    : undefined;
  const relation: Relation | undefined = ear.relation
    ? {
      type: ear.relation.type,
      owner: ear.owner || false,
      columns: ear.relation.columns,
      foreign_class: ear.relation.foreign_class,
      foreign_table: ear.relation.foreign_table,
      intermediate_table: ear.relation.intermediate_table,
      foreign_schema: ear.relation.foreign_schema,
    }
    : undefined;
  const easo: EntityAttributeStoreObject = {
    name: ear.name || '',
    type: ear.type || '',
    type_of_array: ear.type_of_array,
    column,
    relation,
    validations,
    resolved_entity: ear.resolved_entity,
    // relations: ear.relations || [],
  };
  return easo;
};

export const mapEntityResponse = (er: EntityResponse): EntityStoreObject => {
  let attributes: Array<EntityAttributeStoreObject> = [];

  if (er.attributes && er.attributes.length > 0) {
    attributes = er.attributes.map((x) => mapEntityAttributeResponse(x));
  }

  const eso: EntityStoreObject = {
    name: er.name || '',
    table: er.table || '',
    attributes,
    is_view: er.is_view,
    db_schema: er.db_schema,
  };

  return eso;
};
