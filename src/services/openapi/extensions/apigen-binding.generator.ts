/* eslint-disable no-param-reassign */
import { ControllerStoreObject } from '@/store/controllers/state';
import { ApigenBinding } from '../models/apigen.types';
import { OpenAPIDocument, isReferenceObject } from '../models/openapi.types';

function buildControllerPathMap(
  controllers: Record<string, ControllerStoreObject>,
): Record<string, string> {
  const map: Record<string, string> = {};

  Object.values(controllers).forEach((controller) => {
    if (controller.entity && controller.requestMapping) {
      map[controller.requestMapping] = controller.entity;
    }
  });

  return map;
}

function findEntityForPath(
  path: string,
  controllerByPath: Record<string, string>,
): string | undefined {
  const match = Object.entries(controllerByPath).find(
    ([basePath]) => path === basePath || path.startsWith(`${basePath}/`) || path.startsWith(`${basePath}{`),
  );
  return match ? match[1] : undefined;
}

function findBasePathForPath(
  path: string,
  controllerByPath: Record<string, string>,
): string | undefined {
  const match = Object.entries(controllerByPath).find(
    ([basePath]) => path === basePath || path.startsWith(`${basePath}/`) || path.startsWith(`${basePath}{`),
  );
  return match ? match[0] : undefined;
}

function extractPathParams(path: string): string[] {
  const params: string[] = [];
  const regex = /\{(\w+)\}/g;
  let m = regex.exec(path);
  while (m !== null) {
    params.push(m[1]);
    m = regex.exec(path);
  }
  return params;
}

function mapParamToModelField(paramName: string, modelName: string): string {
  if (/id$/i.test(paramName)) {
    return `${modelName}.id`;
  }
  return `${modelName}.${paramName}`;
}

export default function generateApigenBindings(
  openapi: OpenAPIDocument,
  controllers: Record<string, ControllerStoreObject>,
  entityToSchema: Map<string, string>,
): void {
  if (!openapi.paths) return;

  const controllerByPath = buildControllerPathMap(controllers);
  const newPaths: Record<string, any> = {};

  Object.entries(openapi.paths).forEach(([path, pathItem]) => {
    if (!pathItem || isReferenceObject(pathItem)) {
      newPaths[path] = pathItem;
      return;
    }

    const entityName = findEntityForPath(path, controllerByPath);
    if (!entityName) {
      newPaths[path] = pathItem;
      return;
    }

    // Usar schema name (singular) en vez de entity name (plural)
    const modelName = entityToSchema.get(entityName) || entityName;

    const binding: ApigenBinding = { model: modelName };

    // Mapear path params al modelo
    const pathParams = extractPathParams(path);
    pathParams.forEach((param) => {
      binding[param] = mapParamToModelField(param, modelName);
    });

    // Agregar operation-level bindings para sub-paths sin path params
    // Ej: /pet/findByStatus → findByStatus: Pet
    //     /store/order → order: Order
    //     /store/order/{orderId} → order: Order (además de orderId: Order.id)
    const basePath = findBasePathForPath(path, controllerByPath);
    if (basePath && path !== basePath) {
      const subPath = path.substring(basePath.length + 1); // quitar basePath + "/"
      const segments = subPath.split('/');
      segments.forEach((segment) => {
        // Solo agregar segmentos que NO son path params
        if (segment && !segment.startsWith('{')) {
          binding[segment] = modelName;
        }
      });
    }

    // Reconstruir el pathItem con x-apigen-binding PRIMERO
    const newPathItem: any = {
      'x-apigen-binding': binding,
    };

    // Copiar el resto de las propiedades del pathItem original
    Object.entries(pathItem as any).forEach(([key, value]) => {
      if (key !== 'x-apigen-binding') {
        newPathItem[key] = value;
      }
    });

    newPaths[path] = newPathItem;
  });

  // Reemplazar paths con los nuevos (con x-apigen-binding al inicio)
  (openapi as any).paths = newPaths;
}
