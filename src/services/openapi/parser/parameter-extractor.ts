import { EndpointParameterResponse, Validation } from '@/models/EndpointResponse';
import {
  ParameterObject,
  SchemaObject,
  isReferenceObject,
  isSchemaObject,
} from '../models/openapi.types';
import { FORMAT_TYPE_MAP } from '../models/config.types';

function mapOpenApiTypeToJava(type?: string, format?: string): string {
  if (format && FORMAT_TYPE_MAP[format]) {
    return FORMAT_TYPE_MAP[format];
  }
  switch (type) {
    case 'integer':
      return format === 'int64' ? 'Long' : 'Integer';
    case 'number':
      return format === 'double' ? 'Double' : 'Float';
    case 'boolean':
      return 'Boolean';
    case 'array':
      return 'array';
    case 'object':
      return 'Object';
    case 'string':
    default:
      return 'String';
  }
}

function extractValidationsFromSchema(schema: SchemaObject): Validation[] {
  const validations: Validation[] = [];

  if (schema.maxLength !== undefined) {
    validations.push({ type: 'MaxLength', value: String(schema.maxLength) });
  }
  if (schema.minLength !== undefined) {
    validations.push({ type: 'MinLength', value: String(schema.minLength) });
  }
  if (schema.maximum !== undefined) {
    validations.push({ type: 'MaxValue', value: String(schema.maximum) });
  }
  if (schema.minimum !== undefined) {
    validations.push({ type: 'MinValue', value: String(schema.minimum) });
  }
  if (schema.pattern) {
    validations.push({ type: 'RegExp', value: schema.pattern });
  }
  if (schema.enum && schema.enum.length > 0) {
    validations.push({
      type: 'AllowedValues',
      values: schema.enum.map((v: any) => ({ value: String(v) })),
    });
  }

  return validations;
}

function extractParameters(
  parameters: (ParameterObject | any)[],
  bindingMappings?: Record<string, string>,
): EndpointParameterResponse[] {
  return parameters
    .filter((param) => !isReferenceObject(param))
    .map((param) => {
      const p = param as ParameterObject;
      let type = 'String';
      let format: string | undefined;
      let validations: Validation[] = [];

      if (p.schema && isSchemaObject(p.schema)) {
        const schema = p.schema as SchemaObject;
        type = mapOpenApiTypeToJava(schema.type as string, schema.format);
        format = schema.format;
        validations = extractValidationsFromSchema(schema);
      }

      if (p.required) {
        validations.push({ type: 'NotNull' });
      }

      // Leer entity_mapping desde x-apigen-binding del path (ej: ownerId: "Owner.id" → name: "id")
      let entityMapping: { name: string; type: string; type_of_array: string } | undefined;
      if (bindingMappings?.[p.name]) {
        const parts = bindingMappings[p.name].split('.');
        const fieldName = parts.length > 1 ? parts[1] : parts[0];
        entityMapping = { name: fieldName, type, type_of_array: '' };
      }

      return {
        in: p.in,
        name: p.name,
        type,
        format,
        validations: validations.length > 0 ? validations : undefined,
        example: p.example !== undefined ? String(p.example) : undefined,
        entity_mapping: entityMapping,
      };
    });
}

export { extractParameters, mapOpenApiTypeToJava, extractValidationsFromSchema };
