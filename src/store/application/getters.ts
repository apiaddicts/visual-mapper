import { GetterTree } from 'vuex';
import { RootState } from '@/store/state';
import { ApplicationState } from './state';

const getters: GetterTree<ApplicationState, RootState> = {
  getName(state): string | undefined {
    return state.name;
  },
  exportData(state): ApplicationState {
    return {
      name: state.name,
      description: state.description,
      group: state.group,
      artifact: state.name,
      version: state.version,
      package_name: state.group,
      partial: state.partial,
      starters: state.starters,
      archetype_has_database: state.archetype_has_database,
      generation_options: {
        tests_generation: state.tests_generation,
        files_generation: state.files_generation,
      },
      /* kafka_loc_user: state.kafka_loc_user,
      kafka_dev_user: state.kafka_dev_user,
      kafka_val_user: state.kafka_val_user,
      kafka_for_user: state.kafka_for_user,
      kafka_pre_user: state.kafka_pre_user,
      kafka_pro_user: state.kafka_pro_user,
      kafka_loc_password: state.kafka_loc_password,
      kafka_dev_password: state.kafka_dev_password,
      kafka_val_password: state.kafka_val_password,
      kafka_for_password: state.kafka_for_password,
      kafka_pre_password: state.kafka_pre_password,
      kafka_pro_password: state.kafka_pro_password, */
      // Se exporta como un objeto, pero se actualiza como un valor en plano, esto se hace porque si se actualiza un miembro
      // del objeto, debe actualizarse el objeto entero
      kafka_credentials: {
        local: { username: state.kafka_loc_user, password: state.kafka_loc_password },
        develop: { username: state.kafka_dev_user, password: state.kafka_dev_password },
        validation: { username: state.kafka_val_user, password: state.kafka_val_password },
        formation: { username: state.kafka_for_user, password: state.kafka_for_password },
        preproduction: { username: state.kafka_pre_user, password: state.kafka_pre_password },
        production: { username: state.kafka_pro_user, password: state.kafka_pro_password },
      },
    };
  },
  archetypeHasDatabase(state): boolean {
    return state.archetype_has_database;
  },
};
export default getters;
