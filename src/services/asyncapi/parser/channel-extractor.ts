import { ControllerResponse } from '@/models/ControllerResponse';
import {
  EndpointResponse,
  EndpointAttributeResponse,
} from '@/models/EndpointResponse';
import { extractAttributesFromSchema } from '../../openapi/parser/schema-extractor';
import { AsyncAPIDocument, AsyncAPIOperation } from '../models/asyncapi.types';
import { SchemaObject } from '../../openapi/models/openapi.types';

function getSchemaNameFromRef(ref: string): string | null {
  const match = ref.match(/^#\/components\/schemas\/(.+)$/);
  return match ? match[1] : null;
}

function getChannelKeyFromRef(ref: string): string | null {
  const match = ref.match(/^#\/channels\/(.+)$/);
  return match ? match[1] : null;
}

function getChannelMessageKeyFromRef(ref: string): { channelKey: string; msgKey: string } | null {
  const match = ref.match(/^#\/channels\/([^/]+)\/messages\/(.+)$/);
  if (match) return { channelKey: match[1], msgKey: match[2] };
  return null;
}

function getComponentMessageKeyFromRef(ref: string): string | null {
  const compMatch = ref.match(/^#\/components\/messages\/(.+)$/);
  return compMatch ? compMatch[1] : null;
}

/**
 * Resuelve un channel message key al component message key.
 * En AsyncAPI v3, channels/X/messages/Y tiene $ref: "#/components/messages/Z"
 * donde Y (channel msg key) puede ser diferente de Z (component msg key).
 */
function resolveToComponentMessageKey(
  rawDocument: AsyncAPIDocument,
  channelKey: string,
  channelMsgKey: string,
): string {
  const channelMsg = rawDocument.channels?.[channelKey]?.messages?.[channelMsgKey];
  if (channelMsg?.$ref) {
    const compKey = getComponentMessageKeyFromRef(channelMsg.$ref);
    if (compKey) return compKey;
  }
  return channelMsgKey;
}

/**
 * Extrae el schemaRef del payload de un message en el rawDocument (con $ref preservados).
 */
function getPayloadSchemaRef(
  rawDocument: AsyncAPIDocument,
  messageKey: string,
): string | undefined {
  const rawMessage = rawDocument.components?.messages?.[messageKey];
  if (!rawMessage?.payload?.$ref) return undefined;
  return getSchemaNameFromRef(rawMessage.payload.$ref) || undefined;
}

/**
 * Extrae atributos de un payload de message (ya dereferenciado).
 */
function extractPayloadAttributes(
  payload: any,
): EndpointAttributeResponse[] {
  if (!payload || typeof payload !== 'object') return [];

  // El payload es directamente un schema object (no envuelto en content/mediaType)
  const schema = payload as SchemaObject;

  if (schema.type === 'object' && schema.properties) {
    return extractAttributesFromSchema(schema);
  }

  // allOf, oneOf, anyOf — extraer atributos de cada sub-schema
  if (schema.allOf) {
    const attrs: EndpointAttributeResponse[] = [];
    schema.allOf.forEach((item: any) => {
      if (item && typeof item === 'object' && !item.$ref) {
        if (item.properties) {
          attrs.push(...extractAttributesFromSchema(item));
        }
      }
    });
    return attrs;
  }

  if (schema.oneOf || schema.anyOf) {
    const items = schema.oneOf || schema.anyOf;
    const attrs: EndpointAttributeResponse[] = [];
    (items as any[]).forEach((item: any) => {
      if (item && typeof item === 'object' && !item.$ref && item.properties) {
        attrs.push(...extractAttributesFromSchema(item));
      }
    });
    return attrs;
  }

  // Payload con properties directas (sin type: object explícito)
  if (schema.properties) {
    return extractAttributesFromSchema(schema);
  }

  return [];
}

interface OperationInfo {
  operationKey: string;
  operation: AsyncAPIOperation;
  channelKey: string;
  channelAddress: string;
  messageKeys: string[];
}

/**
 * Resuelve las operaciones de AsyncAPI v3 y las agrupa por channel.
 * Usa rawDocument para leer $ref (preservados) y parsed para contenido resuelto.
 */
function resolveOperations(
  parsed: AsyncAPIDocument,
  rawDocument: AsyncAPIDocument,
): OperationInfo[] {
  const result: OperationInfo[] = [];

  // Usar rawDocument.operations para los $ref (no están dereferenciados)
  if (!rawDocument.operations) return result;

  Object.entries(rawDocument.operations).forEach(([opKey, rawOperation]: [string, any]) => {
    const channelRef = rawOperation.channel?.$ref;
    if (!channelRef) return;

    const channelKey = getChannelKeyFromRef(channelRef);
    if (!channelKey) return;

    const channel = parsed.channels?.[channelKey];
    if (!channel) return;

    // Resolver message keys usando $ref del rawDocument
    // Los $ref de operaciones apuntan a channels (ej: #/channels/orderEvents/messages/OrderCreated)
    // pero necesitamos la clave de components/messages (ej: OrderCreatedEvent)
    const messageKeys: string[] = [];
    if (rawOperation.messages && rawOperation.messages.length > 0) {
      rawOperation.messages.forEach((msgRef: any) => {
        if (msgRef?.$ref) {
          // Intentar como referencia a canal: #/channels/X/messages/Y
          const channelMsgInfo = getChannelMessageKeyFromRef(msgRef.$ref);
          if (channelMsgInfo) {
            const compKey = resolveToComponentMessageKey(rawDocument, channelMsgInfo.channelKey, channelMsgInfo.msgKey);
            messageKeys.push(compKey);
          } else {
            // Intentar como referencia directa a componente: #/components/messages/Z
            const compKey = getComponentMessageKeyFromRef(msgRef.$ref);
            if (compKey) messageKeys.push(compKey);
          }
        }
      });
    } else if (rawDocument.channels?.[channelKey]?.messages) {
      // Si la operación no especifica messages, resolver cada mensaje del channel
      Object.entries(rawDocument.channels[channelKey].messages as any).forEach(([chanMsgKey, chanMsg]: [string, any]) => {
        if (chanMsg?.$ref) {
          const compKey = getComponentMessageKeyFromRef(chanMsg.$ref);
          if (compKey) messageKeys.push(compKey);
        } else {
          messageKeys.push(chanMsgKey);
        }
      });
    }

    // Usar la operación del parsed document para datos resueltos (action, summary, etc.)
    const parsedOp = parsed.operations?.[opKey];
    const operation: AsyncAPIOperation = parsedOp || {
      action: rawOperation.action,
      channel: rawOperation.channel,
      summary: rawOperation.summary,
      description: rawOperation.description,
    };

    result.push({
      operationKey: opKey,
      operation,
      channelKey,
      channelAddress: channel.address,
      messageKeys,
    });
  });

  return result;
}

/**
 * Agrupa operaciones por channel y genera ControllerResponse[].
 */
export default function extractChannelGroups(
  parsed: AsyncAPIDocument,
  rawDocument: AsyncAPIDocument,
): ControllerResponse[] {
  const operations = resolveOperations(parsed, rawDocument);

  // Agrupar por channelKey
  const groups: Record<string, {
    channelKey: string;
    channelAddress: string;
    operations: OperationInfo[];
  }> = {};

  operations.forEach((op) => {
    if (!groups[op.channelKey]) {
      groups[op.channelKey] = {
        channelKey: op.channelKey,
        channelAddress: op.channelAddress,
        operations: [],
      };
    }
    groups[op.channelKey].operations.push(op);
  });

  // Convertir cada grupo en un ControllerResponse
  return Object.values(groups).map((group) => {
    const endpoints: EndpointResponse[] = [];

    group.operations.forEach((op) => {
      // Para cada message de la operación, generar un endpoint
      if (op.messageKeys.length === 0) {
        // Operación sin messages explícitos (ej: onNotification)
        endpoints.push({
          operation: op.operation.action.toUpperCase(),
          mapping: '',
          entity: '',
          summary: op.operation.summary || op.operationKey,
          description: op.operation.description || '',
          source: 'asyncapi',
        });
        return;
      }

      op.messageKeys.forEach((msgKey) => {
        // Buscar el message resuelto en el parsed document
        const resolvedMessage = parsed.components?.messages?.[msgKey];
        const payload = resolvedMessage?.payload;

        const attributes = extractPayloadAttributes(payload);
        const schemaRef = getPayloadSchemaRef(rawDocument, msgKey);

        const payloadSection = attributes.length > 0 ? {
          attributes,
          schema_ref: schemaRef,
        } : undefined;

        const isSend = op.operation.action === 'send';

        const endpoint: EndpointResponse = {
          operation: op.operation.action.toUpperCase(),
          mapping: '',
          entity: '',
          summary: op.operation.summary || op.operationKey,
          description: op.operation.description || '',
          source: 'asyncapi',
          // SEND → payload va en request_body (el mensaje que se envía)
          // RECEIVE → payload va en response_data (el mensaje que se recibe)
          request_body: isSend ? payloadSection : undefined,
          response_data: !isSend ? payloadSection : undefined,
        };

        endpoints.push(endpoint);
      });
    });

    return {
      source: 'asyncapi',
      name: group.channelKey,
      request_mapping: group.channelAddress,
      endpoints,
    } as ControllerResponse;
  });
}
