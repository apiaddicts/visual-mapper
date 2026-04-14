/* eslint-disable */
import { ApigenType } from '@/models/ApigenType';

export interface ApplicationState {
  name?: string,
  description?: string,
  group?: string,
  artifact?: string,
  version?: string,
  package_name?: string,
  partial?: boolean,
  collapsed?: boolean,
  starters: string[],
  starters_object?: any[],
  archetype_has_database: boolean,
  tests_generation?: boolean,
  files_generation?: boolean,
  kafka_loc_user?: string,
  kafka_dev_user?: string,
  kafka_val_user?: string,
  kafka_for_user?: string,
  kafka_pre_user?: string,
  kafka_pro_user?: string,
  kafka_loc_password?: string,
  kafka_dev_password?: string,
  kafka_val_password?: string,
  kafka_for_password?: string,
  kafka_pre_password?: string,
  kafka_pro_password?: string,
  kafka_credentials?: KafkaCredentials,
  generation_options?: GenerationOptions,
  anonymizationConfig?: any,
  targetFramework?: ApigenType,
  groupId?: string,
  artifactId?: string,
}

const applicationStateObject: ApplicationState = {
  name: '',
  description: '',
  group: '',
  artifact: '',
  version: '',
  package_name: '',
  partial: false,
  collapsed: false,
  starters: [],
  starters_object: [],
  archetype_has_database: true,
  tests_generation: true,
  files_generation: true,
  kafka_loc_user: undefined,
  kafka_dev_user: undefined,
  kafka_val_user: undefined,
  kafka_for_user: undefined,
  kafka_pre_user: undefined,
  kafka_pro_user: undefined,
  kafka_loc_password: undefined,
  kafka_dev_password: undefined,
  kafka_val_password: undefined,
  kafka_for_password: undefined,
  kafka_pre_password: undefined,
  kafka_pro_password: undefined,
  kafka_credentials: undefined,
  anonymizationConfig: undefined,
  targetFramework: 'python',
  groupId: '',
  artifactId: '',
};

interface KafkaCredentials {
  local?: KafkaEnvironmentCredentials;
  develop?: KafkaEnvironmentCredentials;
  validation?: KafkaEnvironmentCredentials;
  formation?: KafkaEnvironmentCredentials;
  preproduction?: KafkaEnvironmentCredentials;
  production?: KafkaEnvironmentCredentials;
};

interface KafkaEnvironmentCredentials {
  username?: string;
  password?: string;
};

interface GenerationOptions {
  tests_generation?: boolean,
  files_generation?: boolean,
}

export default applicationStateObject;
