import { ActionTree } from 'vuex';
import { nanoid } from 'nanoid';
import { RootState } from '@/store/state';
import { KeyValue } from '@/models/KeyValue';
import { EndpointAttributeResponse, mapEndpointAttributeResponse } from '@/models/EndpointResponse';
import { EndpointAttributesState, EndpointAttributeStoreObject } from './state';

const ADD_ACTION = 'addEndpointAttribute';
const IMPORT_ACTION = 'importEndpointAttribute';

interface PropagateMappingPayload {
  sourceEndpointKey: string;
  attributeKey: string;
  schemaRef?: string;
  entity?: string;
  context: 'request' | 'response';
  forcePropagate?: boolean;
}

function sectionMatchesPayload(
  section: any,
  ep: any,
  payload: PropagateMappingPayload,
): boolean {
  // Coincidencia por schemaRef (preciso)
  if (payload.schemaRef && section.schemaRef && section.schemaRef === payload.schemaRef) return true;
  // Fallback: coincidencia por entidad del endpoint (todos los endpoints del mismo controller comparten entity)
  if (payload.entity && ep.entity && ep.entity.toLowerCase() === payload.entity.toLowerCase()) return true;
  return false;
}

const actions: ActionTree<EndpointAttributesState, RootState> = {
  addEndpointAttribute({ commit }, payload: EndpointAttributeStoreObject): any {
    const kveaso: KeyValue<EndpointAttributeStoreObject> = {
      key: nanoid(10),
      value: payload,
    };
    commit('ADD', kveaso);
    return kveaso;
  },

  importEndpointAttribute({ dispatch }, payload: EndpointAttributeResponse): any {
    const easo: EndpointAttributeStoreObject = mapEndpointAttributeResponse(payload);

    return dispatch('importEndpointAttributes', payload.attributes)
      .then((kveasos: Array<KeyValue<EndpointAttributeStoreObject>>) => {
        easo.attributes = kveasos.map((x) => x.key);
        return dispatch(ADD_ACTION, easo);
      });
  },

  importEndpointAttributes({ dispatch }, payload?: Array<EndpointAttributeResponse>): any {
    if (!payload) return [];
    return Promise.all(
      payload.map((er: EndpointAttributeResponse) => dispatch(IMPORT_ACTION, er)),
    );
  },

  propagateMapping({ state, rootState, commit }, payload: PropagateMappingPayload) {
    const sourceAttr = state._[payload.attributeKey];
    if (!sourceAttr?.entity_mapping?.name) return;

    const endpoints = rootState.endpoints._;
    Object.entries(endpoints).forEach(([epKey, ep]) => {
      const sections = [
        ep.requestBody,
        ep.responseData,
      ];

      sections.forEach((section) => {
        if (!section || !sectionMatchesPayload(section, ep, payload)) return;
        if (!section.attributes) return;

        // Saltar si es la misma sección del mismo endpoint (el atributo source)
        const isSourceSection = epKey === payload.sourceEndpointKey
          && section.attributes.includes(payload.attributeKey);
        if (isSourceSection) return;

        section.attributes.forEach((attrKey: string) => {
          const attr = state._[attrKey];
          if (!attr || attr.name !== sourceAttr.name) return;
          // Propagar a atributos vacíos O que ya fueron mapeados por el mismo endpoint
          if (!attr.entity_mapping?.name || attr.mappedByEndpoint === payload.sourceEndpointKey || payload.forcePropagate) {
            commit('SET_ENTITYMAPPING', { key: attrKey, value: sourceAttr.entity_mapping });
            commit('SET_MAPPED_BY_ENDPOINT', { key: attrKey, value: payload.sourceEndpointKey });
          }
        });
      });
    });
  },

  propagateAnonymization({ state, rootState, commit }, payload: PropagateMappingPayload) {
    const sourceAttr = state._[payload.attributeKey];
    if (!sourceAttr) return;

    const endpoints = rootState.endpoints._;
    Object.entries(endpoints).forEach(([epKey, ep]) => {
      const sections = [ep.requestBody, ep.responseData];

      sections.forEach((section) => {
        if (!section || !sectionMatchesPayload(section, ep, payload)) return;
        if (!section.attributes) return;

        const isSourceSection = epKey === payload.sourceEndpointKey
          && section.attributes.includes(payload.attributeKey);
        if (isSourceSection) return;

        section.attributes.forEach((attrKey: string) => {
          const attr = state._[attrKey];
          if (!attr || attr.name !== sourceAttr.name) return;
          commit('SET_ANONYMIZATION', { key: attrKey, value: sourceAttr.anonymization });
        });
      });
    });
  },

  propagateAllImportedMappings({ state, rootState, commit }) {
    const endpoints = rootState.endpoints._;

    // Paso 0: rellenar entity_mapping.type desde los atributos de la entidad en el store
    // (al importar desde YAML, type queda vacío porque el parser no tiene acceso al store)
    Object.values(endpoints).forEach((ep) => {
      if (!ep.entity) return;
      const entity = (rootState as any).entities._[ep.entity.toLowerCase()];
      if (!entity?.attributes) return;

      // Construir mapa: nombre_campo → tipo (ej: "id" → "Long", "firstName" → "String")
      // entity.attributes es array de EntityAttributeStoreObject, no de string keys
      const typeByName: Record<string, string> = {};
      (entity.attributes as any[]).forEach((ea: any) => {
        if (ea?.name && ea?.type) typeByName[ea.name] = ea.type;
      });

      [ep.requestBody, ep.responseData].forEach((section) => {
        if (!section?.attributes) return;
        section.attributes.forEach((attrKey: string) => {
          const attr = state._[attrKey];
          if (!attr?.entity_mapping?.name || attr.entity_mapping.type) return;
          const resolvedType = typeByName[attr.entity_mapping.name];
          if (!resolvedType) return;
          commit('SET_ENTITYMAPPING', {
            key: attrKey,
            value: { ...attr.entity_mapping, type: resolvedType },
          });
        });
      });
    });

    // Clave: "entity__nombreCampo" → atributo fuente (editable)
    const sourceMap = new Map<string, { sourceEndpointKey: string; sourceAttrKey: string }>();

    // Paso 1a: request bodies primero → son los editables (fuente)
    Object.entries(endpoints).forEach(([epKey, ep]) => {
      if (!ep.entity || !ep.requestBody?.attributes) return;
      ep.requestBody.attributes.forEach((attrKey: string) => {
        const attr = state._[attrKey];
        if (!attr?.entity_mapping?.name) return;
        const pKey = `${ep.entity}__${attr.name}`;
        if (!sourceMap.has(pKey)) {
          sourceMap.set(pKey, { sourceEndpointKey: epKey, sourceAttrKey: attrKey });
        }
      });
    });

    // Paso 1b: response bodies como fallback si no hay request body con ese campo
    Object.entries(endpoints).forEach(([epKey, ep]) => {
      if (!ep.entity || !ep.responseData?.attributes) return;
      ep.responseData.attributes.forEach((attrKey: string) => {
        const attr = state._[attrKey];
        if (!attr?.entity_mapping?.name) return;
        const pKey = `${ep.entity}__${attr.name}`;
        if (!sourceMap.has(pKey)) {
          sourceMap.set(pKey, { sourceEndpointKey: epKey, sourceAttrKey: attrKey });
        }
      });
    });

    // Paso 2: bloquear todos los NO-fuente (commit sincrónico, sin dispatch)
    Object.entries(endpoints).forEach(([, ep]) => {
      if (!ep.entity) return;
      [ep.requestBody, ep.responseData].forEach((section) => {
        if (!section?.attributes) return;
        section.attributes.forEach((attrKey: string) => {
          const attr = state._[attrKey];
          if (!attr?.entity_mapping?.name) return;
          if (attr.mappedByEndpoint) return;
          const pKey = `${ep.entity}__${attr.name}`;
          const source = sourceMap.get(pKey);
          if (!source || attrKey === source.sourceAttrKey) return;
          commit('SET_MAPPED_BY_ENDPOINT', { key: attrKey, value: source.sourceEndpointKey });
        });
      });
    });
  },

  unpropagateMapping({ state, rootState, commit }, payload: PropagateMappingPayload) {
    const sourceAttr = state._[payload.attributeKey];
    const sourceAttrName = sourceAttr?.name;
    if (!sourceAttrName) return;

    const emptyMapping = {
      name: '',
      type: '',
      type_of_array: '',
      is_calculated: true,
      foreign_table: '',
      resolved_entity: '',
    };

    const endpoints = rootState.endpoints._;
    Object.entries(endpoints).forEach(([epKey, ep]) => {
      const sections = [
        ep.requestBody,
        ep.responseData,
      ];

      sections.forEach((section) => {
        if (!section || !sectionMatchesPayload(section, ep, payload)) return;
        if (!section.attributes) return;

        const isSourceSection = epKey === payload.sourceEndpointKey
          && section.attributes.includes(payload.attributeKey);
        if (isSourceSection) return;

        section.attributes.forEach((attrKey: string) => {
          const attr = state._[attrKey];
          if (attr && attr.name === sourceAttrName && attr.mappedByEndpoint === payload.sourceEndpointKey) {
            commit('SET_ENTITYMAPPING', { key: attrKey, value: emptyMapping });
            commit('SET_MAPPED_BY_ENDPOINT', { key: attrKey, value: '' });
          }
        });
      });
    });
  },
};
export default actions;
