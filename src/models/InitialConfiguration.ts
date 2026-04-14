import { ApigenType } from './ApigenType';

export interface DatabaseCredentials {
  type?: string,
  host?: string,
  port?: string,
  name?: string,
  schema?: string,
  username?: string,
}

export interface DatabaseGenerated {
  connection_id?: string,
}

export interface DatabaseConfig {
  credentials?: DatabaseCredentials,
  generated?: DatabaseGenerated,
}

/**
 * Define una serie de parámetros que pueden ser recibidos al arrancar la aplicación
 */
export interface InitialConfiguration {
  openapi_yaml_in_base64: string,
  apigen_type?: ApigenType,
  database?: DatabaseConfig,
}

export const isInitialConfiguration = (object: any): boolean => {
  if (object != null && object.type === undefined && typeof object !== 'string' && 'openapi_yaml_in_base64' in object) {
    return true;
  }

  return false;
};
