/* eslint-disable no-shadow */

export enum RelationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_ONE = 'MANY_TO_ONE',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

export enum ValidationType {
  NOT_NULL = 'NotNull',
  NOT_BLANK = 'NotBlank',
  ALLOWED_VALUES = 'AllowedValues',
  MAX_LENGTH = 'MaxLength',
  MAX_VALUE = 'MaxValue',
  MIN_LENGTH = 'MinLength',
  MIN_VALUE = 'MinValue',
  REGEXP = 'RegExp',
  DATE_FORMAT = 'DateFormat',
  DATE_TIME_FORMAT = 'DateTimeFormat',
  DEFAULT_VALUE = 'DefaultValue',
  SIZE = 'Size',
}

export enum FormatType {
  DATE = 'LocalDate',
  DATETIME = 'LocalDateTime',
  ZONEDDATETIME = 'ZonedDateTime',
  INT32 = 'Integer',
  INT64 = 'Long',
  FLOAT = 'Float',
  DOUBLE = 'Double',
  BINARY = 'Blob',
}

export const FORMAT_TYPE_MAP: Record<string, FormatType> = {
  date: FormatType.DATE,
  'date-time': FormatType.DATETIME,
  int32: FormatType.INT32,
  int64: FormatType.INT64,
  float: FormatType.FLOAT,
  double: FormatType.DOUBLE,
  binary: FormatType.BINARY,
};

export interface ConfigValue {
  value?: string;
  min?: number;
  max?: number;
}

export interface Validation {
  name?: string;
  type: string;
  value?: string;
  values?: ConfigValue[];
}

export interface Conversion {
  type: string;
  value: string;
}

export interface Column {
  name?: string;
  primary_key?: boolean;
  unique?: boolean;
  sequence_name?: string;
  intermediate_table_foreign_key?: string;
  type?: string;
  precision?: number;
  scale?: number;
  length?: number;
}

export interface Relation {
  type: RelationType;
  columns?: Column[];
  owner?: boolean;
  optional?: boolean;
  foreign_class?: string;
  foreign_table?: string;
  intermediate_table?: string;
  foreign_column?: string;
  foreign_schema?: string;
}

export interface Attribute {
  name: string;
  resolved_entity?: string;
  type: string;
  column?: Column;
  relation?: Relation;
  validations?: Validation[];
  type_of_array?: string;
}

export interface Entity {
  name: string;
  table: string;
  attributes: Attribute[];
  is_view?: boolean;
  ddl?: string;
  db_schema?: string;
}

export interface EntityMapping {
  name: string;
  type: string;
  type_of_array?: string;
  conversion?: Conversion;
  related_entity?: string;
  is_calculated?: boolean;
  resolved_entity?: string;
}

export interface Parameter {
  in: string;
  name: string;
  type: string;
  validations?: Validation[];
  required?: boolean;
  entity_mapping?: EntityMapping;
  example?: string;
}

export interface RequestBodyAttribute {
  name: string;
  type: string;
  type_of_array?: string;
  related_entity?: string;
  relation_type?: string;
  attributes?: RequestBodyAttribute[];
  validations?: Validation[];
  active?: boolean;
  entity_mapping?: EntityMapping;
  example?: string;
  description?: string;
  additional_properties?: boolean;
}

export interface ResponseDataAttribute extends RequestBodyAttribute {
  object_attributes?: ResponseDataAttribute[];
}

export interface EndpointRequestBody {
  entity?: string;
  attributes?: RequestBodyAttribute[];
  example?: string;
}

export interface EndpointResponseData {
  entity?: string;
  attributes?: ResponseDataAttribute[];
  response_http_code?: number;
  response_schema?: string;
  example?: string;
}

export interface Endpoint {
  summary?: string;
  description?: string;
  operation: string;
  mapping: string;
  entity?: string;
  parameters?: Parameter[];
  request_body?: EndpointRequestBody;
  response_data?: EndpointResponseData;
}

export interface Controller {
  name: string;
  request_mapping: string;
  resource_name?: string;
  entity?: string;
  include_standard_parameters_by_default?: boolean;
  services?: string[];
  endpoints: Endpoint[];
  source?: string;
}
