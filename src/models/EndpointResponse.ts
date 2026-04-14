/* eslint-disable camelcase */
import { EndpointStoreObject } from '@/store/endpoints/state';
import { EndpointAttributeStoreObject, EntityMapping } from '@/store/endpoint-attributes/state';
import { EndpointParameterStoreObject } from '@/store/endpoint-parameters/state';

export interface AllowedValues {
  value?: string,
}

export interface Validation {
  name?: string,
  type: string,
  value?: string,
  values?: Array<AllowedValues>,
}

export interface EndpointParameterResponse {
  in: string,
  name: string,
  type: string,
  format?: string,
  entity_mapping?: EntityMapping,
  validations?: Array<Validation>,
  example?: string,
}

interface ValidationResponse {
  type: string,
  value: string
}

/* eslint-disable camelcase */
export interface EndpointAttributeResponse {
  name?: string,
  type?: string,
  type_of_array?: string,
  active?: any,
  entity_mapping?: {
    name: string,
    type: string,
    foreign_table: string,
    type_of_array: string,
    is_calculated: boolean,
    resolved_entity?: string
  },
  related_entity?: string,
  relation_type?: string,
  validations?: Array<ValidationResponse>,
  attributes?: Array<EndpointAttributeResponse>,
  resolved_entity?: string,
  example?: string,
  description?: string,
  readOnly?: boolean,
  writeOnly?: boolean,
  anonymization?: string,
}

/* eslint-disable camelcase */
export interface EndpointResponseExampleData {
  name: string,
  value: string,
  values: Array<EndpointResponseExampleData>,
  list_values: Array<Array<EndpointResponseExampleData>>,
}

/* eslint-disable camelcase */
export interface EndpointResponse {
  operation: string,
  mapping: string,
  entity: string,
  summary: string,
  description: string,
  source: string,
  parameters?: Array<EndpointParameterResponse>,
  request_body?: {
    entity?: string,
    attributes?: Array<EndpointAttributeResponse>,
    schema_ref?: string,
    example?: string,
    examples?: Array<EndpointResponseExampleData>,
  }
  response_data?: {
    entity?: string,
    attributes?: Array<EndpointAttributeResponse>,
    schema_ref?: string,
    response_schema?: string,
    example?: string,
    examples?: Array<EndpointResponseExampleData>,
  },
}

export const mapEndpointResponse = (er: EndpointResponse): EndpointStoreObject => {
  const eso: EndpointStoreObject = {
    operation: er.operation,
    mapping: er.mapping,
    entity: er.entity,
    summary: er.summary,
    source: er.source,
    description: er.description,
    parameters: [],
    requestBody: er.request_body
      ? {
        entity: er.request_body.entity,
        attributes: [],
        schemaRef: er.request_body.schema_ref,
        example: er.request_body.example,
        examples: er.request_body.examples,
      }
      : undefined,
    responseData: er.response_data
      ? {
        entity: er.response_data.entity,
        schemaRef: er.response_data.schema_ref,
        responseSchema: er.response_data.response_schema,
        example: er.response_data.example,
        examples: er.response_data.examples,
      }
      : undefined,
  };
  return eso;
};

export const mapEndpointAttributeResponse = (ear: EndpointAttributeResponse)
: EndpointAttributeStoreObject => {
  const entityMapping: EntityMapping = ear.entity_mapping
    ? {
      name: ear.entity_mapping.name,
      type: ear.entity_mapping.type,
      foreign_table: ear.entity_mapping.foreign_table,
      type_of_array: ear.entity_mapping.type_of_array,
      resolved_entity: ear.entity_mapping.resolved_entity,
    }
    : {
      name: '',
      type: '',
      foreign_table: '',
      type_of_array: '',
    };
  const validations: Array<Validation> = ear.validations
    ? ear.validations.map((v) => ({
      name: v.type,
      type: v.type,
      value: v.value,
    }))
    : [];
  let act = null;
  if (ear.active === undefined) {
    act = true;
  }
  const easo: EndpointAttributeStoreObject = {
    name: ear.name || '',
    type: ear.type || '',
    type_of_array: ear.type_of_array || '',
    active: act || ear.active,
    entity_mapping: entityMapping,
    validations,
    related_entity: ear.related_entity || '',
    relation_type: ear.relation_type || '',
    resolved_entity: ear.resolved_entity,
    example: ear.example,
    description: ear.description,
    readOnly: ear.readOnly,
    writeOnly: ear.writeOnly,
    anonymization: ear.anonymization,
  };

  if (ear.relation_type !== undefined && ear.relation_type !== '' && easo.relation_type === '') {
    easo.relation_type = ear.relation_type;
  }

  return easo;
};

export const mapEndpointParameterResponse = (epr: EndpointParameterResponse)
: EndpointParameterStoreObject => {
  const epso: EndpointParameterStoreObject = {
    in: epr.in,
    name: epr.name,
    type: epr.type,
    format: epr.format,
    entity_mapping: epr.entity_mapping,
    validations: epr.validations,
    example: epr.example,
  };
  return epso;
};
