export interface EndpointExampleDataStoreObject {
  name: string,
  value: string,
  values: Array<EndpointExampleDataStoreObject>,
  list_values: Array<Array<EndpointExampleDataStoreObject>>,
}

export interface EndpointStoreObject {
  operation: string,
  mapping: string,
  entity: string,
  summary: string,
  description: string,
  parameters: Array<string>,
  source: string,
  requestBody?: {
    entity?: string,
    attributes?: Array<string>,
    schemaRef?: string,
    example?: string,
    examples?: Array<EndpointExampleDataStoreObject>,
  },
  responseData?: {
    entity?: string,
    attributes?: Array<string>,
    schemaRef?: string,
    responseSchema?: string,
    example?: string,
    examples?: Array<EndpointExampleDataStoreObject>,
  },
}

export interface EndpointState {
  _: {
    [key: string]: EndpointStoreObject
  },
  list: Array<string>,
}

const state: EndpointState = {
  _: {},
  list: [],
};
export default state;
