import { EntityAttributeStoreObject } from '../entity-attributes/state';

export interface TableWithoutPK {
  owner: string,
  table: string
}

export interface EntityStoreObject {
  name: string,
  table: string,
  attributes?: Array<EntityAttributeStoreObject>,
  is_view?: boolean,
  ddl?: string,
  db_schema: string,
}

export interface EntityState {
  _: {
    [key: string]: EntityStoreObject
  },
  list: Array<string>,
  tables: Array<string>,
  tables_without_PK: Array<TableWithoutPK>,
  total_number_of_tables?: number,
}

const state: EntityState = {
  _: {},
  list: [],
  tables: [],
  tables_without_PK: [],
  total_number_of_tables: undefined,
};

export interface EntityStateObject {
  entities: EntityStoreObject[];
  tables_without_PK: TableWithoutPK[];
  total_number_of_tables?: number;
}

export default state;
