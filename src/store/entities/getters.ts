/* eslint-disable no-shadow */
import { GetterTree } from 'vuex';
import { RootState } from '@/store/state';
import { EntityState, EntityStateObject, TableWithoutPK } from './state';

const getters: GetterTree<EntityState, RootState> = {
  existsEntity(state) {
    return (name: string): boolean => state.list.includes(name);
  },
  
  exportData(state): EntityStateObject {
    return {
      entities: state.list.map((k: string) => {
        const o = state._[k];
        return {
          name: o.name,
          table: o.table,
          attributes: o.attributes,
          is_view: o.is_view,
          ddl: o.ddl,
          db_schema: o.db_schema,
        };
      }),
      tables_without_PK: state.tables_without_PK,
      total_number_of_tables: state.total_number_of_tables,
    };
  },
  
  exportPartialData: (state): any => (entitiesName: any) => {
    const stateFixedKeys = Object.assign({}, ...Object.keys(state._)
      .map((key) => ({ [key]: state._[key] })));
    const entitiesArray = entitiesName.map((k: string) => {
      if (stateFixedKeys[k]) {
        const o = stateFixedKeys[k];
        return {
          name: o.name,
          table: o.table,
          attributes: o.attributes,
          is_view: o.is_view,
          ddl: o.ddl,
          db_schema: o.db_schema,
        };
      }
      return null;
    });
    return entitiesArray.length === 1 && entitiesArray[0] === null
      ? { entities: [] }
      : { entities: entitiesArray.filter((item: any) => item !== null) };
  },
  
  getTablesWithoutPK: (state): TableWithoutPK[] => state.tables_without_PK,
  
  getTotalOfTables: (state): number | undefined => state.total_number_of_tables,
};
export default getters;
