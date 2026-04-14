/* eslint-disable */
import { EndpointResponse, EndpointParameterResponse } from './EndpointResponse';
import { ControllerStoreObject } from '@/store/controllers/state';

export interface ControllerResponse {
  source: string,
  name?: string,
  request_mapping?: string,
  entity?: string,
  services?: Array<string>,
  common_parameters?: Array<EndpointParameterResponse>
  additional_entities?: Set<string>,
  endpoints?: Array<EndpointResponse>
}

export const mapControllerResponse = (cr: ControllerResponse): ControllerStoreObject => {
  // Se convierte de Array a Set la propiedad 'additional_entities' al importar un archivo de configuración
  const additionalEntitiesSet : Set<string> = new Set();
  if (cr.additional_entities !== undefined) {
    // eslint-disable-next-line
    for (const additionalEntity of cr.additional_entities.values()) {
      additionalEntitiesSet.add(additionalEntity);
    }
  }
  const cso: ControllerStoreObject = {
    source: cr.source || '',
    name: cr.name || '',
    requestMapping: cr.request_mapping || '',
    entity: cr.entity,
    services: cr.services,
    additionalEntities: additionalEntitiesSet,
  };

  if (cr.endpoints !== undefined) {
    cr.endpoints.forEach((endpoint: EndpointResponse) => {
      endpoint.source = cr.source;
    });
  }

  return cso;
};
