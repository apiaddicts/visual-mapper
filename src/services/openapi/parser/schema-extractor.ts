/* eslint-disable no-use-before-define */
import { EndpointAttributeResponse } from '@/models/EndpointResponse';
import {
  SchemaObject,
  isReferenceObject,
  isSchemaObject,
} from '../models/openapi.types';
import { mapOpenApiTypeToJava, extractValidationsFromSchema } from './parameter-extractor';

function getSchemaFromMediaType(content: Record<string, any> | undefined): SchemaObject | null {
  if (!content) return null;
  const mediaType = content['application/json'] || content['*/*'] || Object.values(content)[0];
  if (!mediaType || !mediaType.schema) return null;
  if (isReferenceObject(mediaType.schema)) return null;
  return mediaType.schema as SchemaObject;
}

// Extrae el nombre de clase de un $ref (ej: "#/components/schemas/Pet" → "Pet")
function classNameFromRef(ref?: string): string | null {
  if (!ref) return null;
  const match = ref.match(/^#\/components\/schemas\/(.+)$/);
  return match ? match[1] : null;
}

function extractSingleAttribute(
  name: string,
  schema: SchemaObject,
  required: string[],
  depth: number,
  rawPropValue?: any,
): EndpointAttributeResponse {
  const type = mapOpenApiTypeToJava(schema.type as string, schema.format);
  const rawValidations = extractValidationsFromSchema(schema);

  if (required.includes(name)) {
    rawValidations.push({ type: 'NotNull', value: '' });
  }

  const validations = rawValidations.map((v) => ({
    type: v.type,
    value: v.value || '',
  }));

  const mappedField: string | undefined = (schema as any)['x-apigen-mapping']?.field || undefined;

  const attr: EndpointAttributeResponse = {
    name,
    type,
    active: true,
    validations: validations.length > 0 ? validations : undefined,
    example: schema.example !== undefined ? String(schema.example) : undefined,
    description: schema.description,
    readOnly: schema.readOnly === true ? true : undefined,
    writeOnly: schema.writeOnly === true ? true : undefined,
    anonymization: (schema as any)['x-anonymization'] || undefined,
    entity_mapping: mappedField ? {
      name: mappedField,
      type: '',
      foreign_table: '',
      type_of_array: '',
      is_calculated: false,
    } : undefined,
  };

  if (schema.type === 'array' && schema.items) {
    if (isSchemaObject(schema.items)) {
      const itemsSchema = schema.items as SchemaObject;
      attr.type = 'array';

      // Si el raw schema tiene items.$ref, usar el nombre de clase (ej: "Pet") como type_of_array
      const itemsRefClass = classNameFromRef(rawPropValue?.items?.$ref);
      attr.type_of_array = itemsRefClass || mapOpenApiTypeToJava(itemsSchema.type as string, itemsSchema.format);

      // Si el mapping existe y tenemos el nombre de clase, set entity_mapping.type
      if (itemsRefClass && attr.entity_mapping) {
        attr.entity_mapping = { ...attr.entity_mapping, type: itemsRefClass };
      }

      if (itemsSchema.type === 'object' && itemsSchema.properties) {
        attr.attributes = extractAttributesFromSchema(
          itemsSchema,
          rawPropValue?.items?.properties,
          depth + 1,
        );
      }
    }
  } else if (schema.type === 'object' && schema.properties) {
    attr.type = 'Object';

    // Si el raw schema tiene $ref directo (objeto referenciado), usar el nombre de clase
    const objRefClass = classNameFromRef(rawPropValue?.$ref);
    if (objRefClass && attr.entity_mapping) {
      attr.entity_mapping = { ...attr.entity_mapping, type: objRefClass };
    }

    attr.attributes = extractAttributesFromSchema(schema, rawPropValue?.properties, depth + 1);
  }

  return attr;
}

function extractAttributesFromSchema(
  schema: SchemaObject,
  rawProperties?: Record<string, any>,
  depth = 0,
): EndpointAttributeResponse[] {
  if (depth > 10) return [];

  const properties = schema.properties || {};
  const required = schema.required || [];

  const attributes: EndpointAttributeResponse[] = Object.entries(properties)
    .filter(([, propValue]) => !isReferenceObject(propValue))
    .map(([propName, propValue]) => extractSingleAttribute(
      propName,
      propValue as SchemaObject,
      required,
      depth,
      rawProperties?.[propName],
    ));

  if (schema.allOf) {
    schema.allOf.forEach((item) => {
      if (isSchemaObject(item) && item.properties) {
        const subAttrs = extractAttributesFromSchema(item, undefined, depth + 1);
        attributes.push(...subAttrs);
      }
    });
  }

  return attributes;
}

// Obtiene las properties del raw schema desde el content de la mediaType
function getRawPropertiesFromContent(rawContent: Record<string, any> | undefined): Record<string, any> | undefined {
  if (!rawContent) return undefined;
  const mediaType = rawContent['application/json'] || rawContent['*/*'] || Object.values(rawContent)[0];
  if (!mediaType?.schema) return undefined;
  const { schema } = mediaType;
  // Si es $ref directo, no podemos resolverlo aquí (ya se resolvió en el dereference)
  if (schema.$ref) return undefined;
  return schema.properties || schema.items?.properties;
}

export function extractRequestBodyAttributes(
  requestBody: any,
  rawRequestBody?: any,
): { entity?: string; attributes: EndpointAttributeResponse[] } | null {
  if (!requestBody || isReferenceObject(requestBody)) return null;

  const schema = getSchemaFromMediaType(requestBody.content);
  if (!schema) return null;

  const rawProperties = getRawPropertiesFromContent(rawRequestBody?.content);
  const attributes = extractAttributesFromSchema(schema, rawProperties, 0);
  return {
    attributes,
  };
}

export function extractResponseAttributes(
  responses: Record<string, any> | undefined,
  rawResponses?: Record<string, any>,
): { attributes: EndpointAttributeResponse[]; responseSchema?: string } | null {
  if (!responses) return null;

  const successResponse = responses['200'] || responses['201'] || responses['202'];
  if (!successResponse || isReferenceObject(successResponse)) return null;

  const schema = getSchemaFromMediaType(successResponse.content);
  if (!schema) return null;

  const rawSuccessResponse = rawResponses?.['200'] || rawResponses?.['201'] || rawResponses?.['202'];
  const rawProperties = getRawPropertiesFromContent(rawSuccessResponse?.content);

  let responseSchema: string | undefined;
  let targetSchema = schema;

  if (schema.type === 'object' && schema.properties) {
    const dataProperty = schema.properties.data || schema.properties.content || schema.properties.result;
    if (dataProperty && isSchemaObject(dataProperty)) {
      targetSchema = dataProperty as SchemaObject;
      responseSchema = 'standard';
    }
  }

  if (targetSchema.type === 'array' && targetSchema.items && isSchemaObject(targetSchema.items)) {
    const itemsSchema = targetSchema.items as SchemaObject;
    const attributes = extractAttributesFromSchema(itemsSchema, rawProperties, 0);
    return { attributes, responseSchema: responseSchema || 'list' };
  }

  const attributes = extractAttributesFromSchema(targetSchema, rawProperties, 0);
  return { attributes, responseSchema };
}

export { extractAttributesFromSchema, getSchemaFromMediaType };
