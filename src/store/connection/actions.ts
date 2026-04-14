/* eslint-disable no-param-reassign */
import { ActionTree } from 'vuex';
import { AxiosError } from 'axios';
import { RootState } from '@/store/state';
import { dbExplorerApi, DatasourcePayload, DatabaseType } from '@/services/db-explorer-api.service';
import { ConnectionState } from './state';

/**
 * Normaliza el tipo de validacion del DB Explorer al formato esperado por el store.
 * DB Explorer: "SIZE", "NOT_NULL", "MIN", "MAX"
 * Store espera: "Size", "NotNull", "Min", "Max"
 */
function normalizeValidationType(rawType: string): string {
  const map: Record<string, string> = {
    SIZE: 'Size',
    NOT_NULL: 'NotNull',
    MIN: 'Min',
    MAX: 'Max',
    PATTERN: 'Pattern',
    EMAIL: 'Email',
    NOT_EMPTY: 'NotEmpty',
    NOT_BLANK: 'NotBlank',
    POSITIVE: 'Positive',
    NEGATIVE: 'Negative',
    PAST: 'Past',
    FUTURE: 'Future',
    DIGITS: 'Digits',
    DECIMAL_MIN: 'DecimalMin',
    DECIMAL_MAX: 'DecimalMax',
  };
  return map[rawType] || rawType;
}

/**
 * Extrae el valor y values de una validacion del DB Explorer.
 * El DB Explorer usa campos como integer_value_two, long_value, string_value, etc.
 * Para SIZE se generan values: [min, max] ademas del value.
 */
function extractValidationValue(v: any): { value?: string; values?: any[] } {
  // SIZE tiene dos valores: integer_value_one (min) y integer_value_two (max)
  if (v.type === 'SIZE') {
    const min = v.integer_value_one != null ? Number(v.integer_value_one) : 0;
    const max = v.integer_value_two != null ? Number(v.integer_value_two) : 255;
    return { value: String(max), values: [min, max] };
  }
  if (v.string_value != null) return { value: String(v.string_value) };
  if (v.integer_value_two != null) return { value: String(v.integer_value_two) };
  if (v.integer_value_one != null) return { value: String(v.integer_value_one) };
  if (v.long_value != null) return { value: String(v.long_value) };
  if (v.decimal_value != null) return { value: String(v.decimal_value) };
  return {};
}

/**
 * Determina el tipo de relacion basandose en is_collection y owner.
 */
function inferRelationType(attr: any): string {
  if (attr.is_collection) {
    return 'ONE_TO_MANY';
  }
  if (attr.relation && attr.relation.owner === true) {
    return 'MANY_TO_ONE';
  }
  if (attr.relation && attr.relation.owner === false) {
    return 'ONE_TO_ONE';
  }
  return 'MANY_TO_ONE';
}

/**
 * Adapta una entidad del DB Explorer al formato EntityResponse esperado por el store.
 */
function adaptEntity(entity: any, schema: string): any {
  const adaptedAttributes = (entity.attributes || []).map((attr: any) => {
    // Adaptar column: DB Explorer usa columns[] (array), store espera column (objeto)
    const firstCol = (attr.columns && attr.columns.length > 0) ? attr.columns[0] : null;
    const column = firstCol ? {
      name: firstCol.name,
      primary_key: firstCol.primary_key || false,
      unique: firstCol.unique || false,
      sequence_name: firstCol.sequence || undefined,
      type: firstCol.type || undefined,
      precision: firstCol.precision != null ? Number(firstCol.precision) : undefined,
      scale: firstCol.scale != null ? Number(firstCol.scale) : undefined,
      length: firstCol.length != null ? Number(firstCol.length) : undefined,
    } : undefined;

    // Adaptar validations: cada una con type, value y opcionalmente values
    const validations = (attr.validations || []).map((v: any) => {
      const extracted = extractValidationValue(v);
      return {
        type: normalizeValidationType(v.type),
        value: extracted.value,
        values: extracted.values,
      };
    });

    // Adaptar relation
    let relation = null;
    if (attr.relation) {
      relation = {
        type: inferRelationType(attr),
        foreign_class: attr.relation.related_entity || attr.type,
        foreign_table: attr.relation.related_entity
          ? attr.relation.related_entity.toLowerCase()
          : (attr.type || '').toLowerCase(),
        foreign_schema: schema,
        owner: attr.relation.owner != null ? attr.relation.owner : undefined,
        intermediate_table: attr.relation.intermediate_table || undefined,
        columns: attr.relation.columns || [],
      };
    }

    // Determinar type_of_array para colecciones
    let typeOfArray;
    if (attr.is_collection && attr.relation) {
      typeOfArray = attr.relation.related_entity || attr.type;
    }

    return {
      name: attr.name,
      type: attr.is_collection ? 'array' : attr.type,
      owner: attr.relation ? attr.relation.owner : undefined,
      type_of_array: typeOfArray,
      column,
      validations,
      relation,
      resolved_entity: attr.relation ? attr.relation.related_entity : undefined,
    };
  });

  return {
    name: entity.name,
    table: entity.table,
    db_schema: schema,
    attributes: adaptedAttributes,
    is_view: false,
  };
}

/**
 * Adapta la respuesta completa del DB Explorer /configs al formato que espera
 * entities/importEntities.
 */
function adaptConfigResponse(data: any, schema: string): any {
  const entities = (data.entities || []).map((ent: any) => adaptEntity(ent, schema));
  return { entities };
}

const actions: ActionTree<ConnectionState, RootState> = {
  fetch({ commit, state }): any {
    const timeout = 20000;

    const payload: DatasourcePayload = {
      type: state.type,
      host: state.host || '',
      port: Number(state.port) || 5432,
      schema: state.schema || 'public',
      database: state.database || '',
      username: state.username || '',
      password: state.password || '',
    };

    return dbExplorerApi.createDatasource(payload)
      .then((response) => {
        const body = response.data;
        const innerData = body.data || body;
        if (!innerData.id) { throw new Error('GENERIC'); }
        commit('SET_ID', innerData.id);
        commit('SET_ISCONNECTED', true);
        return innerData;
      })
      .catch((err: AxiosError) => {
        if ((err.code == null || err.code === undefined || err.code === 'ERR_NETWORK') && err.message === 'Network Error') {
          err.name = 'Error de conexion';
          err.message = `${err.config == null || err.config.url == null ? '(Sin URL)' : err.config.url} con metodo ${err.config!.method !== undefined ? err.config!.method.toUpperCase() : '(Sin metodo HTTP)'} y error: ${err.message}. Compruebe su conexion a internet y la conectividad con el Database Explorer.`;
        } else if (err.code === 'ECONNABORTED' && err.isAxiosError === true) {
          err.name = 'Error de conexion';
          err.message = `Se ha producido un error de timeout tratando de conectar a ${err.config == null || err.config.url == null ? '(Sin URL)' : err.config.url} con metodo ${err.config!.method !== undefined ? err.config!.method.toUpperCase() : '(Sin metodo HTTP)'} puesto que se han superado ${timeout}ms de timeout`;
        }
        throw err;
      });
  },

  fetchTables({ state }): any {
    if (!state.id) {
      return Promise.reject(new Error('No hay conexion establecida. Conecte primero a la base de datos.'));
    }
    return dbExplorerApi.getTables(state.id)
      .then((response) => {
        const body = response.data;
        return body.data || body;
      });
  },

  fetchConfigs({ state }, tables: string[]): any {
    if (!state.id) {
      return Promise.reject(new Error('No hay conexion establecida. Conecte primero a la base de datos.'));
    }

    const payload = {
      controllers: tables.map((table) => ({
        table,
        methods: ['GET_ALL', 'GET_ONE', 'POST', 'PUT', 'DELETE'],
      })),
    };

    const schema = state.schema || 'public';

    return dbExplorerApi.getConfigs(state.id, payload)
      .then((response) => {
        const body = response.data;
        const rawData = body.data || body;
        return adaptConfigResponse(rawData, schema);
      });
  },

  createDatabase({ commit }, payload: { type: DatabaseType; database: string; file: File }): any {
    return dbExplorerApi.createDatabase(payload.type, payload.database, payload.file)
      .then((response) => {
        const body = response.data;
        const innerData = body.data || body;
        if (!innerData.id) { throw new Error('GENERIC'); }
        commit('SET_ID', innerData.id);
        commit('SET_TYPE', payload.type);
        commit('SET_DATABASE', payload.database);
        commit('SET_ISCONNECTED', true);
        return innerData;
      });
  },

  clearData({ commit }): any {
    commit('SET_ID', undefined);
    commit('SET_OPEN', true);
    commit('SET_TYPE', 'POSTGRES');
    commit('SET_HOST', '');
    commit('SET_PORT', '5432');
    commit('SET_SCHEMA', 'public');
    commit('SET_DATABASE', '');
    commit('SET_USERNAME', '');
    commit('SET_PASSWORD', '');
    commit('SET_ISCONNECTED', false);
  },
};
export default actions;
