/* eslint-disable */
import { MutationTree } from 'vuex';
import { ApplicationState } from './state';
import { ApigenType } from '@/models/ApigenType';

const mutations: MutationTree<ApplicationState> = {
  SET_NAME(state, payload: string) {
    state.name = payload;
  },
  SET_DESCRIPTION(state, payload: string) {
    state.description = payload;
  },
  SET_GROUP(state, payload: string) {
    state.group = payload;
  },
  SET_ARTIFACT(state, payload: string) {
    state.artifact = payload;
  },
  SET_VERSION(state, payload: string) {
    state.version = payload;
  },
  SET_PACKAGE_NAME(state, payload: string) {
    state.package_name = payload;
  },
  SET_PARTIAL(state, payload: boolean) {
    state.partial = payload;
  },
  SET_COLLAPSED(state, payload: boolean) {
    state.collapsed = payload;
  },
  ADD_STARTER(state, payload: string) {
    let modifiedStarters = state.starters;

    if (!modifiedStarters.includes(payload)) {
      modifiedStarters.push(payload);
    }
    
    state.starters = modifiedStarters;
  },
  REMOVE_STARTER(state, payload: string) {
    let modifiedStarters = state.starters;
    modifiedStarters = modifiedStarters.filter(starter => starter !== payload);
    state.starters = modifiedStarters;
  },
  SET_STARTERS(state, payload: string[]) {
    state.starters = payload;
  },
  SET_STARTERS_OBJECT(state, payload: any[]) {
    state.starters_object = payload;
  },
  SET_DB_USAGE(state, payload: boolean) {
    state.archetype_has_database = payload;
  },
  SET_TESTS_GENERATION(state, payload: boolean) {
    state.tests_generation = payload;
  },
  SET_FILES_GENERATION(state, payload: boolean) {
    state.files_generation = payload;
  },
  SET_KAFKA_USER_LOC(state, payload: string) {
    state.kafka_loc_user = payload;
  },
  SET_KAFKA_USER_DEV(state, payload: string) {
    state.kafka_dev_user = payload;
  },
  SET_KAFKA_USER_VAL(state, payload: string) {
    state.kafka_val_user = payload;
  },
  SET_KAFKA_USER_FOR(state, payload: string) {
    state.kafka_for_user = payload;
  },
  SET_KAFKA_USER_PRE(state, payload: string) {
    state.kafka_pre_user = payload;
  },
  SET_KAFKA_USER_PRO(state, payload: string) {
    state.kafka_pro_user = payload;
  },
  SET_KAFKA_PASSWORD_LOC(state, payload: string) {
    state.kafka_loc_password = payload;
  },
  SET_KAFKA_PASSWORD_DEV(state, payload: string) {
    state.kafka_dev_password = payload;
  },
  SET_KAFKA_PASSWORD_VAL(state, payload: string) {
    state.kafka_val_password = payload;
  },
  SET_KAFKA_PASSWORD_FOR(state, payload: string) {
    state.kafka_for_password = payload;
  },
  SET_KAFKA_PASSWORD_PRE(state, payload: string) {
    state.kafka_pre_password = payload;
  },
  SET_KAFKA_PASSWORD_PRO(state, payload: string) {
    state.kafka_pro_password = payload;
  },
  SET_TARGET_FRAMEWORK(state, payload: ApigenType) {
    state.targetFramework = payload;
  },
  SET_GROUP_ID(state, payload: string) {
    state.groupId = payload;
  },
  SET_ARTIFACT_ID(state, payload: string) {
    state.artifactId = payload;
  },
  SET_ANONYMIZATION_CONFIG(state, payload: any) {
    state.anonymizationConfig = payload;
  },
  ADD_SWAP_LIST(state, payload: { name: string; values: string[] }) {
    if (!state.anonymizationConfig) {
      state.anonymizationConfig = {};
    }
    if (!state.anonymizationConfig.swapLists) {
      state.anonymizationConfig.swapLists = {};
    }
    state.anonymizationConfig = {
      ...state.anonymizationConfig,
      swapLists: {
        ...state.anonymizationConfig.swapLists,
        [payload.name]: payload.values || [],
      },
    };
  },
  REMOVE_SWAP_LIST(state, listName: string) {
    if (!state.anonymizationConfig?.swapLists) return;
    const { [listName]: _, ...rest } = state.anonymizationConfig.swapLists;
    state.anonymizationConfig = {
      ...state.anonymizationConfig,
      swapLists: rest,
    };
  },
  UPDATE_SWAP_LIST_VALUES(state, payload: { name: string; values: string[] }) {
    if (!state.anonymizationConfig?.swapLists) return;
    state.anonymizationConfig = {
      ...state.anonymizationConfig,
      swapLists: {
        ...state.anonymizationConfig.swapLists,
        [payload.name]: payload.values,
      },
    };
  },
};
export default mutations;
