import { ApigenType } from '@/models/ApigenType';
import { ApigenProject } from '../models/apigen.types';

export interface ProjectConfig {
  name: string;
  version: string;
  description?: string;
  partial?: boolean;
  dataDriver?: string;
  targetFramework?: ApigenType;
  groupId?: string;
  artifactId?: string;
}

const DB_TYPE_TO_DRIVER: Record<string, string> = {
  POSTGRES: 'postgresql',
  MYSQL: 'mysql',
  MARIADB: 'mysql',
  SQLSERVER: 'mssql',
  ORACLE: 'oracle',
};

export default function generateApigenProject(config: ProjectConfig): ApigenProject {
  // Determinar el driver - SIEMPRE requerido por el backend
  const driver = config.dataDriver
    ? (DB_TYPE_TO_DRIVER[config.dataDriver] || config.dataDriver.toLowerCase())
    : 'mysql'; // Default a mysql si no hay conexión configurada

  // Construir el proyecto en el orden exacto del archivo válido:
  // name, description, version, data-driver
  const project: ApigenProject = {
    name: config.name || 'Project',
    description: config.description || 'Generated from OpenAPI',
    version: config.version || '1.0.0',
    'data-driver': driver,
  };

  if (config.partial) {
    project.partial = config.partial;
  }

  if (config.targetFramework === 'springboot' && (config.groupId || config.artifactId)) {
    project['java-properties'] = {
      'group-id': config.groupId || '',
      'artifact-id': config.artifactId || '',
    };
  }

  return project;
}
