<template lang="pug">
  .l-subheader
    .container-fluid
      .row.justify-content-center
        .col-md-12
          .d-flex.justify-content-between.align-items-center

            .font-weight-bold.color-brand {{ name }}

            .l-subheader__icons
              //- Refrescar token (oculto temporalmente)
              //- b-button.l-subheader__icons-item(
              //-   variant="link"
              //-   @click="refreshToken"
              //-   v-b-tooltip.bottom="$t('header.token')"
              //- )
              //-   i.fas.fa-key

              b-button.l-subheader__icons-item(
                variant="link"
                @click="refreshTables"
                v-b-tooltip.bottom="$t('header.tables')"
                :disabled="!connectedWithDB"
              )
                i.fas.fa-sync

              b-button.l-subheader__icons-item(
                variant="link"
                v-b-tooltip.bottom="$t('header.collapse')"
                @click="collapseMenu"
              )
                i.fas.fa-arrow-alt-to-left(v-if="!collapsed")
                i.fas.fa-arrow-alt-to-right(v-else)

              b-button.l-subheader__icons-item(
                variant="link"
                @click="exportConfiguration"
                v-b-tooltip.bottom="$t('header.export')"
              )
                i.fas.fa-download

              b-button.l-subheader__icons-item(
                @click="openModal(nameIdModal)"
                variant="link"
                v-b-tooltip.bottom="$t('header.import')"
                :disabled="!connectedWithDB || loadedSwaggerOrLoadedConfig"
              )
                i.fas.fa-upload

              b-button.l-subheader__icons-item(
                variant="link"
                @click="openModal(modalGenerateCode)"
                v-b-tooltip.bottom="$t('header.generate')"
                :disabled="!validMavenParams()"
              )
                i.fas.fa-file-code

    md-modal(:modalId="nameIdModal" v-model="importModalVisible")
      md-import-configuration(:modalId="nameIdModal" @close="importModalVisible = false")
    md-modal(:modalId="modalGenerateCode" v-model="generateCodeModalVisible")
      md-generate-code(
        :modalId="modalGenerateCode"
        :visible="generateCodeModalVisible"
        @close="generateCodeModalVisible = false"
      )

</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, computed, inject } from 'vue';
import { mapState, useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import MdImportConfiguration from '@/components/MdImportConfiguration.vue';
import MdModal from '@/components/commons/MdModal.vue';
import MdGenerateCode from '@/components/resources/MdGenerateCode.vue';
import { ConfigGenApiResponse } from '@/services/config-gen-api.service';
import { AxiosError, AxiosResponse } from 'axios';
import { ConnectionStateDatasourceObject } from '@/store/connection/state';
import { mapRootState } from '@/store';
import { RootState } from '@/store/state';
import { archetypeDataValidator } from '@/services/archetype-data-validation-service';

export default defineComponent({
  name: 'MdSubheader',
  components: {
    MdImportConfiguration,
    MdGenerateCode,
    MdModal,
  },
  computed: {
    ...mapState('applicationStore', ['name']),
  },
  setup() {
    const store = useStore();
    const { t } = useI18n();
    const $configGenApi: any = inject('$configGenApi');
    const $toast: any = inject('$toast');
    const $filesService: any = inject('$filesService');

    const nameIdModal = ref('modal-import-json');
    const modalGenerateCode = ref('md-modal-generate-code');
    const collapsed = ref(false);
    const importModalVisible = ref(false);
    const generateCodeModalVisible = ref(false);

    const config = computed(() => ({
      headers: { 'x-datasource-id': store.state.connectionStore.id },
    }));

    const loadedSwaggerOrLoadedConfig = computed((): boolean => {
      return store.state.controllers.list != null && store.state.controllers.list.length > 0;
    });

    const connectedWithDB = computed((): boolean => {
      return store.state.connectionStore.is_connected === true;
    });

    const appName = computed((): string => {
      return store.getters['applicationStore/getName'];
    });

    const connectionId = computed((): string | null => {
      return store.getters['connectionStore/getConnectionId'];
    });

    const connectionData = computed((): ConnectionStateDatasourceObject => {
      return store.getters['connectionStore/getConnectionData'];
    });

    const jsonConfigFilename = computed((): string => {
      let actualDate = new Date();
      return `${appName.value}-config-file-${actualDate.getFullYear()}-${('0' + (actualDate.getMonth() + 1)).slice(-2)}-${('0' + actualDate.getDate()).slice(-2)}-${('0' + actualDate.getHours()).slice(-2)}-${('0' + actualDate.getMinutes()).slice(-2)}-${('0' + actualDate.getSeconds()).slice(-2)}.json`;
    });

    const enableExport = computed((): boolean => {
      if (!appName.value || !connectionId.value) {
        return false;
      }
      return true;
    });

    const exportConfiguration = (): Promise<void> => {
      const typedState: RootState = mapRootState(store.state);
      return store.dispatch('generateJSONConfig')
        .then((configFile) => {
          let passwordValue = '';

          // Se elimina el campo de la password de base de datos para evitar que se guarde en plano
          if (configFile.configuration !== undefined &&
              configFile.configuration.datasource !== undefined &&
              configFile.configuration.datasource.password !== undefined)
          {
              passwordValue = configFile.configuration.datasource.password;
              configFile.configuration.datasource.password = undefined;
          }

          // Se eliminan los campos de la password de los campos de Kafka para evitar que se guarden en plano
          let kafkaPasswordLoc = '';
          let kafkaPasswordDev = '';
          let kafkaPasswordVal = '';
          let kafkaPasswordFor = '';
          let kafkaPasswordPre = '';
          let kafkaPasswordPro = '';

          if (configFile.kafka_loc_password !== undefined) {
            kafkaPasswordLoc = configFile.kafka_loc_password;
            configFile.kafka_loc_password = undefined;
          }

          if (configFile.kafka_dev_password !== undefined) {
            kafkaPasswordDev = configFile.kafka_dev_password;
            configFile.kafka_dev_password = undefined;
          }

          if (configFile.kafka_val_password !== undefined) {
            kafkaPasswordVal = configFile.kafka_val_password;
            configFile.kafka_val_password = undefined;
          }

          if (configFile.kafka_for_password !== undefined) {
            kafkaPasswordVal = configFile.kafka_for_password;
            configFile.kafka_for_password = undefined;
          }

          if (configFile.kafka_pre_password !== undefined) {
            kafkaPasswordPre = configFile.kafka_pre_password;
            configFile.kafka_pre_password = undefined;
          }

          if (configFile.kafka_pro_password !== undefined) {
            kafkaPasswordPro = configFile.kafka_pro_password;
            configFile.kafka_pro_password = undefined;
          }

          $filesService.downloadJSON(configFile, jsonConfigFilename.value)
            .then(() => {
              configFile.configuration.datasource.password = passwordValue;
              configFile.kafka_loc_password = kafkaPasswordLoc;
              configFile.kafka_dev_password = kafkaPasswordDev;
              configFile.kafka_val_password = kafkaPasswordVal;
              configFile.kafka_for_password = kafkaPasswordFor;
              configFile.kafka_pre_password = kafkaPasswordPre;
              configFile.kafka_pro_password = kafkaPasswordPro;
            });
        });
    };

    const openModal = (modal?: string): void => {
      const m = modal || nameIdModal.value;
      if (m === nameIdModal.value) {
        importModalVisible.value = true;
      } else if (m === modalGenerateCode.value) {
        generateCodeModalVisible.value = true;
      }
    };

    const collapseMenu = (): void => {
      collapsed.value = !collapsed.value;
      store.commit('applicationStore/SET_COLLAPSED', collapsed.value);
    };

    const validMavenParams = (): boolean => {
      const mavenData = store.getters['applicationStore/exportData'];

      if (mavenData != null) {
        const validArtifact = archetypeDataValidator.artifactIdIsValid(mavenData.artifact);
        const validgroup = archetypeDataValidator.groupIdIsValid(mavenData.group);
        const validName = archetypeDataValidator.packageManagerProjectNameIsValid(mavenData.name);
        const validPackageName = archetypeDataValidator.packageManagerProjectNameIsValid(mavenData.package_name);
        const validVersion = archetypeDataValidator.packageManagerProjectNameIsValid(mavenData.version);

        return validArtifact && validgroup && validName && validPackageName && validVersion;
      }

      // Se pone a true puesto que esto es un error, pero de darse, impediría generar código.
      // Dado que este método sólo gestiona el estado disabled del botón, que mejora la experiencia de usuario
      // pero no es algo crítico, se opta por permitir por defecto
      return true;
    };

    const refreshTables = (): Promise<any> => {
      const connectionDataValue = store.getters['connectionStore/connectionData'];
      // Como en este punto aún no se ha hecho la asociación con las tablas,
      // se llama a este endpoint sin parámetros para que las cargue todas

      return $configGenApi
        .postGetTables(connectionDataValue, config.value)
        .then((response: AxiosResponse<ConfigGenApiResponse<any>>) => {
          const { data } = response.data;
          const { result } = response.data;
          if (!result.status) {
            throw new Error(result.info);
          }

          return data.table_names;
        })
        .then((data: any) => store.commit('entities/SET_TABLES', data))
        .then(() => store.dispatch('controllers/importControllers'))
        .catch((err: AxiosError) => {
          const x: string = `errors.${err.message}`;
          const msg = String(t(x));
          if (msg && x !== msg) err.message = msg;
          $toast.errorFromServer(err);
        })
        .catch((err: AxiosError) => {
          const x: string = `errors.${err.message}`;
          const msg = String(t(x));
          if (msg && x !== msg) err.message = msg;
          $toast.error(err);
        });
    };

    const refreshToken = (): void => {
      const useToken = Number(process.env.VUE_APP_OAUTH_GENERATE_ACCESS_TOKEN);

      if (useToken) {
        store.dispatch('authStore/fetchToken');
      }
    };

    return {
      nameIdModal,
      modalGenerateCode,
      collapsed,
      importModalVisible,
      generateCodeModalVisible,
      loadedSwaggerOrLoadedConfig,
      connectedWithDB,
      appName,
      connectionId,
      connectionData,
      jsonConfigFilename,
      enableExport,
      exportConfiguration,
      openModal,
      collapseMenu,
      validMavenParams,
      refreshTables,
      refreshToken,
    };
  },
});
</script>
