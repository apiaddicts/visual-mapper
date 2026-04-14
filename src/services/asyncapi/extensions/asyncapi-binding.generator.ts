/* eslint-disable no-param-reassign */
import { ControllerStoreObject } from '@/store/controllers/state';
import { EndpointStoreObject } from '@/store/endpoints/state';
import { AsyncAPIDocument } from '../models/asyncapi.types';

/**
 * Determina la action de binding basándose en el nombre del message o la operación.
 */
function determineAction(messageKey: string, operationKey?: string): string {
  const combined = `${messageKey} ${operationKey || ''}`.toLowerCase();

  if (/creat|register/.test(combined)) return 'create';
  if (/updat|ship|chang|modif/.test(combined)) return 'update';
  if (/delet|remov/.test(combined)) return 'delete';
  return 'custom';
}

/**
 * Construye un mapa de channelAddress → entity desde los controllers del store.
 */
function buildChannelEntityMap(
  controllers: Record<string, ControllerStoreObject>,
  endpoints: Record<string, EndpointStoreObject>,
): Map<string, { entity: string; modelName: string; operationKeys: string[] }> {
  const map = new Map<string, { entity: string; modelName: string; operationKeys: string[] }>();

  Object.values(controllers).forEach((controller) => {
    if (!controller.entity || !controller.requestMapping) return;

    const modelName = controller.entity; // Usar nombre de entidad BD, no nombre de schema
    const operationKeys: string[] = [];

    if (controller.endpoints) {
      controller.endpoints.forEach((epKey) => {
        const ep = endpoints[epKey];
        if (ep) {
          operationKeys.push(ep.summary || ep.operation);
        }
      });
    }

    map.set(controller.requestMapping, {
      entity: controller.entity,
      modelName,
      operationKeys,
    });
  });

  return map;
}

/**
 * Resuelve la clave de componente de un message referenciado desde un canal.
 * channels/X/messages/Y puede tener $ref: "#/components/messages/Z"
 */
function resolveChannelMsgToComponent(
  asyncapi: AsyncAPIDocument,
  channelKey: string,
  channelMsgKey: string,
): string {
  const channelMsg = asyncapi.channels?.[channelKey]?.messages?.[channelMsgKey];
  if (channelMsg?.$ref) {
    const compMatch = channelMsg.$ref.match(/^#\/components\/messages\/(.+)$/);
    if (compMatch) return compMatch[1];
  }
  return channelMsgKey;
}

/**
 * Busca qué operaciones referencian un message dado (por clave de componente),
 * y devuelve el channelAddress asociado.
 */
function findChannelForMessage(
  asyncapi: AsyncAPIDocument,
  componentMessageKey: string,
): { channelAddress: string; operationKey: string } | null {
  if (!asyncapi.operations) return null;

  // eslint-disable-next-line no-restricted-syntax
  for (const [opKey, operation] of Object.entries(asyncapi.operations)) {
    const channelRef = operation.channel?.$ref;
    if (!channelRef) continue; // eslint-disable-line no-continue

    const channelKeyMatch = channelRef.match(/^#\/channels\/(.+)$/);
    if (!channelKeyMatch) continue; // eslint-disable-line no-continue
    const channelKey = channelKeyMatch[1];

    const channel = asyncapi.channels?.[channelKey];
    if (!channel) continue; // eslint-disable-line no-continue

    // Verificar si algún message de la operación resuelve al componentMessageKey
    if (operation.messages) {
      const hasMessage = operation.messages.some((msgRef) => {
        const ref = msgRef.$ref || '';
        // Caso 1: referencia directa a componente
        const compMatch = ref.match(/^#\/components\/messages\/(.+)$/);
        if (compMatch) return compMatch[1] === componentMessageKey;
        // Caso 2: referencia a canal (#/channels/X/messages/Y) → resolver Y a componente
        const chanMatch = ref.match(/^#\/channels\/([^/]+)\/messages\/(.+)$/);
        if (chanMatch) {
          const resolved = resolveChannelMsgToComponent(asyncapi, chanMatch[1], chanMatch[2]);
          return resolved === componentMessageKey;
        }
        return false;
      });
      if (hasMessage) {
        return { channelAddress: channel.address, operationKey: opKey };
      }
    }

    // Si no tiene messages explícitos, verificar en el channel resolviendo $ref
    if (!operation.messages && channel.messages) {
      // eslint-disable-next-line no-restricted-syntax
      for (const chanMsgKey of Object.keys(channel.messages)) {
        const resolved = resolveChannelMsgToComponent(asyncapi, channelKey, chanMsgKey);
        if (resolved === componentMessageKey) {
          return { channelAddress: channel.address, operationKey: opKey };
        }
      }
    }
  }

  return null;
}

/**
 * Genera x-apigen-binding en components/messages del AsyncAPI.
 */
export default function generateAsyncBindings(
  asyncapi: AsyncAPIDocument,
  controllers: Record<string, ControllerStoreObject>,
  endpoints: Record<string, EndpointStoreObject>,
  entityToSchema: Map<string, string>,
): void {
  if (!asyncapi.components?.messages) return;

  const channelEntityMap = buildChannelEntityMap(controllers, endpoints);

  const newMessages: Record<string, any> = {};

  Object.entries(asyncapi.components.messages).forEach(([msgKey, message]) => {
    // Buscar el channel asociado a este message
    const channelInfo = findChannelForMessage(asyncapi, msgKey);

    // Solo añadir binding si el channel tiene una entidad asignada
    const entityInfo = channelInfo ? channelEntityMap.get(channelInfo.channelAddress) : null;

    if (entityInfo) {
      const newMessage: any = {
        'x-apigen-binding': {
          model: entityInfo.modelName,
          action: determineAction(msgKey, channelInfo!.operationKey),
        },
      };
      Object.entries(message).forEach(([key, value]) => {
        if (key !== 'x-apigen-binding') newMessage[key] = value;
      });
      newMessages[msgKey] = newMessage;
    } else {
      // Sin entidad → mantener mensaje sin modificar
      newMessages[msgKey] = message;
    }
  });

  asyncapi.components.messages = newMessages;
}
