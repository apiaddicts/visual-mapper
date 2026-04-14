/* eslint-disable no-shadow */

export interface ReferenceObject {
  $ref: string;
}

export interface SchemaObject {
  type?: string;
  format?: string;
  properties?: Record<string, SchemaObject | ReferenceObject>;
  items?: SchemaObject | ReferenceObject;
  required?: string[];
  allOf?: (SchemaObject | ReferenceObject)[];
  oneOf?: (SchemaObject | ReferenceObject)[];
  anyOf?: (SchemaObject | ReferenceObject)[];
  enum?: any[];
  description?: string;
  example?: any;
  maxLength?: number;
  minLength?: number;
  maximum?: number;
  minimum?: number;
  pattern?: string;
  [key: string]: any;
}

export interface MediaTypeObject {
  schema?: SchemaObject | ReferenceObject;
  example?: any;
  [key: string]: any;
}

export interface ParameterObject {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  schema?: SchemaObject | ReferenceObject;
  example?: any;
  [key: string]: any;
}

export interface RequestBodyObject {
  description?: string;
  content: Record<string, MediaTypeObject>;
  required?: boolean;
  [key: string]: any;
}

export interface ResponseObject {
  description?: string;
  content?: Record<string, MediaTypeObject>;
  [key: string]: any;
}

export interface OperationObject {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: (ParameterObject | ReferenceObject)[];
  requestBody?: RequestBodyObject | ReferenceObject;
  responses?: Record<string, ResponseObject | ReferenceObject>;
  [key: string]: any;
}

export interface PathItemObject {
  summary?: string;
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  patch?: OperationObject;
  parameters?: (ParameterObject | ReferenceObject)[];
  [key: string]: any;
}

export interface ComponentsObject {
  schemas?: Record<string, SchemaObject | ReferenceObject>;
  [key: string]: any;
}

export interface OpenAPIDocument {
  openapi: string;
  info: any;
  paths?: Record<string, PathItemObject | ReferenceObject>;
  components?: ComponentsObject;
  servers?: any[];
  [key: string]: any;
}

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch'];

export function isReferenceObject(obj: any): obj is ReferenceObject {
  return obj != null && '$ref' in obj;
}

export function isSchemaObject(obj: any): obj is SchemaObject {
  return obj != null && !('$ref' in obj);
}
