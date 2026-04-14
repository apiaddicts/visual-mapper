<template lang="pug">
  .c-import-config
    .dropbox.mb-3
      input#file.input-file(
        type='file'
        @change='uploadJsonFile'
        accept='.json')
      .text(v-if="!file")
        | Arrastra tu archivo JSON aquí
        br
        |  o haz click
      .border(v-else)
        span {{ formatLongFileName(file.name) }}
    .border-top.pt-3.text-right
      b-button(variant='default' size='sm' @click='closeModal')
        | Cancelar
      b-button(
        variant='success'
        size='sm'
        v-if="loadingConfig == false"
        style="width: 130px"
        @click='applyConfiguration'
        :disabled="!jsonConfiguration")
        | Cargar JSON
      b-button(
        variant='success'
        size='sm'
        v-else
        :disabled="true"
        style="width: 130px")
        i.fas.fa-spinner-third.fa-spin
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { AxiosError, AxiosResponse } from 'axios';
import { ConfigGenApiResponse } from '@/services/config-gen-api.service';

export default defineComponent({
  name: 'MdImportConfiguration',
  props: {
    modalId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { t } = useI18n();
    const $toast: any = inject('$toast');
    const $bvModal: any = inject('$bvModal');
    const $bvToast: any = inject('$bvToast');
    const $configGenApi: any = inject('$configGenApi');

    const file = ref<any>(null);
    const jsonConfiguration = ref<any>(null);
    const loadingConfig = ref(false);
    const maxFileNameSizeToShow = 80;

    const config = computed(() => ({
      headers: { 'x-datasource-id': store.state.connectionStore.id },
    }));

    const formatLongFileName = (fileName: string) => {
      if (fileName != null && fileName.length >= maxFileNameSizeToShow) {
        return `${fileName.substring(0, maxFileNameSizeToShow)}...`;
      }
      return fileName;
    };

    const uploadJsonFile = (ev: any) => {
      file.value = ev.target.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          jsonConfiguration.value = JSON.parse(e.target.result);
        }
        catch (e) {
          let err = new Error();
          err.name = "Error leyendo el fichero JSON";
          err.message = "Compruebe que no hay ningún error en el formato del fichero JSON. Mensaje recibido: " + e;
          $toast.error(err);
        }
      };
      reader.readAsText(file.value);
    };

    const closeModal = () => {
      $bvModal.hide(props.modalId);
    };

    const showToast = () => {
      $bvModal.hide(props.modalId);
      const toastOptions = {
        title: 'Configuración JSON cargada',
        variant: 'success',
        toaster: 'b-toaster-bottom-left',
        solid: true,
      };
      setTimeout(() => {
        $bvToast.toast(
          'La configuración ha sido cargada con éxito',
          toastOptions,
        );
      }, 500);
    };

    const getTablesIfExists = (entities: any[]): string[] => {
      let tableNames: string[] = [];
      if (entities !== undefined) {
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          if (entity !== undefined && entity.table !== undefined) {
            tableNames.push(entity.table);
          }
        }
      }
      return tableNames;
    };

    const loadAllTables = (): Promise<any> => {
      const connectionData = store.getters['connectionStore/connectionData'];

      return $configGenApi
        .postGetTables(connectionData, config.value)
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

    const applyConfiguration = () => {
      loadingConfig.value = true;

      // Importamos DATOS APLICACIÓN
      store.commit('applicationStore/SET_NAME', jsonConfiguration.value.name);

      // Importamos DESCRIPCIÓN APLICACIÓN
      store.commit('applicationStore/SET_DESCRIPTION', jsonConfiguration.value.description);

      // Importamos GROUP
      store.commit('applicationStore/SET_GROUP', jsonConfiguration.value.group);

      // Importamos VERSIÓN
      store.commit('applicationStore/SET_VERSION', jsonConfiguration.value.version);

      // Importamos package_name
      store.commit('applicationStore/SET_PACKAGE_NAME', jsonConfiguration.value.package_name);

      // Importamos ARTIFACT
      store.commit('applicationStore/SET_ARTIFACT', jsonConfiguration.value.artifact);

      // Importamos la definición de las apis que pudiesen estar cargadas
      store.commit('SET_API_DEFINITION', jsonConfiguration.value.api_definition);
      store.commit('SET_ASYNC_API_DEFINITION', jsonConfiguration.value.async_api_definition);
      store.commit('SET_ASYNC_API', jsonConfiguration.value.async_api);
      store.commit('SET_ASYNC_API_EXTRA_TABLES', jsonConfiguration.value.async_api_extra_tables);
      store.commit('SET_TOTAL_NUMBER_OF_TABLES', jsonConfiguration.value.total_number_of_tables);
      store.commit('SET_TABLES_WITHOUT_PK', jsonConfiguration.value.tables_without_PK);

      if (jsonConfiguration.value != null && jsonConfiguration.value.kafka_credentials != null) {
        if (jsonConfiguration.value.kafka_credentials.local != null &&
            jsonConfiguration.value.kafka_credentials.local.username != null &&
            jsonConfiguration.value.kafka_credentials.local.password != null)
        {
          store.commit('applicationStore/SET_KAFKA_USER_LOC', jsonConfiguration.value.kafka_credentials.local.username);
          store.commit('applicationStore/SET_KAFKA_PASSWORD_LOC', jsonConfiguration.value.kafka_credentials.local.password);
        }

        if (jsonConfiguration.value.kafka_credentials.develop != null &&
            jsonConfiguration.value.kafka_credentials.develop.username != null &&
            jsonConfiguration.value.kafka_credentials.develop.password != null)
        {
          store.commit('applicationStore/SET_KAFKA_USER_DEV', jsonConfiguration.value.kafka_credentials.local.username);
          store.commit('applicationStore/SET_KAFKA_PASSWORD_DEV', jsonConfiguration.value.kafka_credentials.local.password);
        }

        if (jsonConfiguration.value.kafka_credentials.validation != null &&
            jsonConfiguration.value.kafka_credentials.validation.username != null &&
            jsonConfiguration.value.kafka_credentials.validation.password != null)
        {
          store.commit('applicationStore/SET_KAFKA_USER_VAL', jsonConfiguration.value.kafka_credentials.local.username);
          store.commit('applicationStore/SET_KAFKA_PASSWORD_VAL', jsonConfiguration.value.kafka_credentials.local.password);
        }

        if (jsonConfiguration.value.kafka_credentials.formation != null &&
            jsonConfiguration.value.kafka_credentials.formation.username != null &&
            jsonConfiguration.value.kafka_credentials.formation.password != null)
        {
          store.commit('applicationStore/SET_KAFKA_USER_FOR', jsonConfiguration.value.kafka_credentials.local.username);
          store.commit('applicationStore/SET_KAFKA_PASSWORD_FOR', jsonConfiguration.value.kafka_credentials.local.password);
        }

        if (jsonConfiguration.value.kafka_credentials.preproduction != null &&
            jsonConfiguration.value.kafka_credentials.preproduction.username != null &&
            jsonConfiguration.value.kafka_credentials.preproduction.password != null)
        {
          store.commit('applicationStore/SET_KAFKA_USER_PRE', jsonConfiguration.value.kafka_credentials.local.username);
          store.commit('applicationStore/SET_KAFKA_PASSWORD_PRE', jsonConfiguration.value.kafka_credentials.local.password);
        }

        if (jsonConfiguration.value.kafka_credentials.production != null &&
            jsonConfiguration.value.kafka_credentials.production.username != null &&
            jsonConfiguration.value.kafka_credentials.production.password != null)
        {
          store.commit('applicationStore/SET_KAFKA_USER_PRO', jsonConfiguration.value.kafka_credentials.local.username);
          store.commit('applicationStore/SET_KAFKA_PASSWORD_PRO', jsonConfiguration.value.kafka_credentials.local.password);
        }
      }

      // Importamos ENTITIES
      store.dispatch('entities/importEntities', jsonConfiguration.value.entities)
        .then(() => {
          if (store.state.entities.tables === undefined || store.state.entities.tables.length === 0) {
            return $configGenApi.postGetTables(store.getters['connectionStore/connectionData'], config.value);
          }
          showToast();
          return Promise.resolve(null);
        })
        .then((response: any) => {
          if (response !== undefined && response !== null) {
            const { data } = response.data;
            const { result } = response.data;
            if (!result === undefined || data === undefined || !result.status) {
              loadingConfig.value = false;
              throw new Error(result.info);
            }
            return data.table_names;
          } else {
            loadingConfig.value = false;
            return null;
          }
        })
        .then((data: any) => {
          loadingConfig.value = false;
          if (data != null) {
            store.commit('entities/SET_TABLES', data);
            showToast();
          }
        })
        .catch((err: AxiosError) => {
          loadingConfig.value = false;
          if ((err.code == null || err.code === undefined || err.code === 'ERR_NETWORK') && (err.message === 'Network Error' || err.name === 'Error de conexión')) {
            if (err.name !== 'Error de conexión') {
              err.name = 'Error de conexión';
              err.message = `${err.config === undefined || err.config.url === undefined ? '(Sin URL)' : err.config.url} con método ${err.config!.method !== undefined ? err.config!.method.toUpperCase() : '(Sin método HTTP)'} y error: ${err.message}. Compruebe su conexión a internet y la conectividad con ${process.env.VUE_APP_CONFIG_GEN_API_URL}/status`;
            }
            $toast.error(err);
          }
          else {
           $toast.errorFromServer(err);
          }
          closeModal();
        })
        .catch((err: any) => {
          loadingConfig.value = false;
          $toast.error(err);
          closeModal();
        });

      // Importamos CONTROLLERS
      store.dispatch(
        'controllers/importControllers', jsonConfiguration.value.controllers,
      ).catch((err: any) => {
          $toast.error(err);
          closeModal();
        });
    };

    return {
      file,
      jsonConfiguration,
      loadingConfig,
      formatLongFileName,
      uploadJsonFile,
      closeModal,
      applyConfiguration,
      loadAllTables,
      showToast,
      getTablesIfExists,
    };
  },
});
</script>
