<template lang="pug">
.l-footer.bg-brand
  .container-fluid
    .row.justify-content-center
      .col-md-12.text-center.py-5
        .color-white.small
          div.mt-4
            div
              | Versión {{ version }} - {{ compilationDate }} | {{ $t('footer.copy') }}
            //- Comprobar conectividad (oculto temporalmente)
            //- div
            //-   a.e-btn.bg-brand.color-white.mr-3(
            //-     @click="openStatusModal"
            //-   ) {{ $t('footer.status.modal') }}

              md-modal(
                :modalId="statusModal"
                v-model="showStatusModal"
              )
                md-status(
                  :modalId="statusModal"
                  :configStatusUrl="configStatusUrl"
                  :projectGeneratorStatusUrl="projectGeneratorStatusUrl"
                  :wso2StatusUrl="wso2StatusUrl"
                  :visible="showStatusModal"
                  @close="closeStatusModal"
                )
</template>

<script lang="ts">
import {
  defineComponent, ref, computed,
} from 'vue';
import MdStatus from '@/components/MdStatus.vue';
import MdModal from '@/components/commons/MdModal.vue';
import YAML from 'yaml';
import { InitialConfiguration, isInitialConfiguration } from '@/models/InitialConfiguration';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'MdFooter',
  components: {
    MdStatus,
    MdModal,
  },
  setup() {
    const $store = useStore();
    
    window.addEventListener('message', (event) => {
      if (event != null && event.data != null && event.origin != null) {
        if (isInitialConfiguration(event.data)) {
          const initialConfiguration: InitialConfiguration = event.data;
          $store.state.iframe_initial_configuration = initialConfiguration;

          // Extract name/description/version from OpenAPI immediately (no DB needed)
          if (initialConfiguration.openapi_yaml_in_base64) {
            try {
              const fileText = atob(initialConfiguration.openapi_yaml_in_base64);
              const rawDoc = fileText.trim().startsWith('{') ? JSON.parse(fileText) : YAML.parse(fileText);
              if (rawDoc?.info) {
                if (rawDoc.info.title) $store.commit('applicationStore/SET_NAME', rawDoc.info.title);
                if (rawDoc.info.description) $store.commit('applicationStore/SET_DESCRIPTION', rawDoc.info.description);
                if (rawDoc.info.version) $store.commit('applicationStore/SET_VERSION', rawDoc.info.version);
              }
            } catch (e) {
              // Will be parsed again later in continueWithImportedConfiguration
            }
          }

          if (initialConfiguration.apigen_type) {
            $store.commit('applicationStore/SET_TARGET_FRAMEWORK', initialConfiguration.apigen_type);
          }

          const credentials = initialConfiguration.database?.credentials;
          if (credentials?.host) {
            if (credentials.type) {
              $store.commit('connectionStore/SET_TYPE', credentials.type);
            }
            $store.commit('connectionStore/SET_HOST', credentials.host);
            if (credentials.port) {
              $store.commit('connectionStore/SET_PORT', credentials.port);
            }
            if (credentials.name) {
              $store.commit('connectionStore/SET_DATABASE', credentials.name);
            }
            if (credentials.schema) {
              $store.commit('connectionStore/SET_SCHEMA', credentials.schema);
            }
            if (credentials.username) {
              $store.commit('connectionStore/SET_USERNAME', credentials.username);
            }
          }
        }
      }
    });

    const statusModal = ref('md-status');
    const showStatusModal = ref(false);

    // Auxiliar para formatear números (08 en lugar de 8)
    const getFormattedNumber = (num: number) => (num < 10 ? `0${num}` : num);

    // Versión (antes getVersion)
    const version = computed(() => process.env.VUE_APP_VERSION || '');

    // Fecha de compilación (antes getCompilationDate)
    const compilationDate = computed(() => {
      const dateEnv = process.env.VUE_COMPILATION_DATE;
      if (!dateEnv) return '';

      const d = new Date(dateEnv);
      const day = getFormattedNumber(d.getDate());
      const month = getFormattedNumber(d.getMonth() + 1);
      const year = d.getFullYear();
      const hours = getFormattedNumber(d.getHours());
      const minutes = getFormattedNumber(d.getMinutes());

      return `${day}/${month}/${year} - ${hours}:${minutes}`;
    });

    // URLs de configuración
    const configStatusUrl = computed(() => process.env.VUE_APP_CONFIG_GEN_STATUS_URL || '');
    const projectGeneratorStatusUrl = computed(() => process.env.VUE_APP_PROJECT_GEN_STATUS_URL || '');
    const wso2StatusUrl = computed(() => process.env.VUE_APP_WSO2_STATUS_URL || '');

    // Acciones
    const openStatusModal = () => {
      showStatusModal.value = true;
    };

    const closeStatusModal = () => {
      showStatusModal.value = false;
    };

    return {
      statusModal,
      showStatusModal,
      version,
      compilationDate,
      configStatusUrl,
      projectGeneratorStatusUrl,
      wso2StatusUrl,
      openStatusModal,
      closeStatusModal,
    };
  },
});
</script>
