<template lang="pug">
  div
      div.border-bottom.text-center
        h2 {{ $t('footer.status.title') }}
      div.pt-3.pb-3.text-center
        // Status config generator
        div.pb-3
          span {{ $t('footer.status.configGenerator') }}
            a.pl-2.fas.fa-external-link(target="_blank" :href="configStatusUrl")
          div(v-if="loadingConfig")
            i.fas.fa-spinner-third.fa-spin
          div(v-else)
            div(v-if="configGeneratorStatus == 200")
              span(style="color: #28a745; font-weight: bold;") OK 
              span - 
              span Version: {{ configGeneratorVersion }}
              div(v-if="!configGeneratorJWKS")
                span(style="color: orange;") El servicio REST config-generator no tiene conectividad al JWKS
            div(v-else)
              span(style="color: red; font-weight: bold;") ERROR
        // Status project generator
        div.pb-3
          span {{ $t('footer.status.projectGenerator') }}
            a.pl-2.fas.fa-external-link(target="_blank" :href="projectGeneratorStatusUrl")
          div(v-if="loadingProject")
            i.fas.fa-spinner-third.fa-spin
          div(v-else)
            div(v-if="projectGeneratorStatus == 200")
              span(style="color: #28a745; font-weight: bold;") OK 
              span - 
              span Version: {{ projectGeneratorVersion }}
              div(v-if="!projectGeneratorJWKS")
                span(style="color: orange;") El servicio REST project-generator no tiene conectividad al JWKS
            div(v-else)
              span(style="color: red; font-weight: bold;") ERROR
        // Status Wso2
        div.pb-3
          span {{ $t('footer.status.wso2') }}
            a.pl-2.fas.fa-external-link(target="_blank" :href="wso2StatusUrl")
          div(v-if="loadingWso2")
            i.fas.fa-spinner-third.fa-spin
          div(v-else)
            div(v-if="wso2Status == 200")
              span(style="color: #28a745; font-weight: bold;") OK
            div(v-else)
              span(style="color: red; font-weight: bold;") ERROR
        // Mensaje final
        div(v-if="!loading")
          div(v-if="!projectGeneratorJWKS || !configGeneratorJWKS")
            span(style="color: orange; white-space: pre-line") {{ $t('footer.status.connection_error') }}
          div(v-else-if="configGeneratorStatus == 200 && projectGeneratorStatus == 200 && wso2Status == 200")
            span(style="color: #28a745;") {{ $t('footer.status.success') }}
          div(v-else)
            span(style="color: red;") {{ $t('footer.status.error') }}
      
      .border-top.pt-3.text-right
        b-button(variant='default' size='sm' @click='closeModal')
          | Cerrar
        b-button(
          variant='success'
          size='sm'
          v-if="!loading"
          style="width: 230px"
          @click='checkStatus'
          :disabled="loading")
            | {{ $t('footer.status.retryButton') }}
        b-button(
          variant='success'
          size='sm'
          v-else
          :disabled="true"
          style="width: 230px")
          i.fas.fa-spinner-third.fa-spin
    
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, watch } from 'vue';
import { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';

export default defineComponent({
  name: 'MdStatus',
  props: {
    modalId: {
      type: String,
      required: true,
    },
    configStatusUrl: {
      type: String,
      required: true,
    },
    projectGeneratorStatusUrl: {
      type: String,
      required: true,
    },
    wso2StatusUrl: {
      type: String,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {

    const loading = ref(true);
    const loadingConfig = ref(true);
    const configGeneratorStatus = ref<any>(null);
    const configGeneratorVersion = ref<any>(null);
    const configGeneratorJWKS = ref(false);
    const loadingProject = ref(true);
    const projectGeneratorStatus = ref<any>(null);
    const projectGeneratorVersion = ref<any>(null);
    const projectGeneratorJWKS = ref(false);
    const loadingWso2 = ref(true);
    const wso2Status = ref<any>(null);

    const closeModal = () => {
      emit('close');
    };

    const checkLoading = () => {
      if (!loadingConfig.value && !loadingProject.value && !loadingWso2.value) {
        loading.value = false;
      }
    };

    const checkConfigGeneratorStatus = () => {
      return axios.get(props.configStatusUrl)
        .then((response: AxiosResponse<any>) => {
          const { data } = response.data;
          configGeneratorStatus.value = response.status;
          return data;
        })
        .then((data) => {
          if (data != null) {
            configGeneratorVersion.value = data.app_version.split(' ')[0];

            if (data.systems != null) {
              // Se tienen en cuenta tanto JWKS como JSWK porque en algunas versiones de los REST había un error
              const jwks = data.systems.filter((item: any) => item.system === 'JWKS' || item.system === 'JSWK');
              if (jwks.length > 0 && jwks[0].status === 'true') {
                configGeneratorJWKS.value = true;
              } else {
                configGeneratorJWKS.value = false;
              }
            }
          }
        })
        .catch(() => {
          configGeneratorStatus.value = 500;
        });
    };

    const checkProjectGeneratorStatus = () => {
      return axios.get(props.projectGeneratorStatusUrl)
        .then((response: AxiosResponse<any>) => {
          const { data } = response.data;
          projectGeneratorStatus.value = response.status;
          return data;
        })
        .then((data) => {
          if (data != null) {
            projectGeneratorVersion.value = data.app_version.split(' ')[0];

            if (data.systems != null) {
              // Se tienen en cuenta tanto JWKS como JSWK porque en algunas versiones de los REST había un error
              const jwks = data.systems.filter((item: any) => item.system === 'JWKS' || item.system === 'JSWK');
              if (jwks.length > 0 && jwks[0].status === 'true') {
                projectGeneratorJWKS.value = true;
              } else {
                projectGeneratorJWKS.value = false;
              }
            }
          }
        })
        .catch(() => {
          projectGeneratorStatus.value = 500;
        });
    };

    const checkWso2Status = () => {
      return axios.get(props.wso2StatusUrl)
        .then((response: AxiosResponse<any>) => {
          wso2Status.value = response.status;
        })
        .catch(() => {
          wso2Status.value = 500;
        });
    };

    const checkStatus = () => {
      loading.value = true;
      loadingConfig.value = true;
      loadingProject.value = true;
      loadingWso2.value = true;

      const configGeneratorPromise = checkConfigGeneratorStatus();
      const projectGeneratorPromise = checkProjectGeneratorStatus();
      const wso2Promise = checkWso2Status();

      Promise.all([configGeneratorPromise]).then(() => {
        loadingConfig.value = false;
      }).then(() => { checkLoading(); });

      Promise.all([projectGeneratorPromise]).then(() => {
        loadingProject.value = false;
      }).then(() => { checkLoading(); });

      Promise.all([wso2Promise]).then(() => {
        loadingWso2.value = false;
      }).then(() => { checkLoading(); });
    };

    // Solo hacer las peticiones cuando el modal se abre (visible = true)
    watch(() => props.visible, (newValue) => {
      if (newValue) {
        checkStatus();
      }
    });

    return {
      loading,
      loadingConfig,
      configGeneratorStatus,
      configGeneratorVersion,
      configGeneratorJWKS,
      loadingProject,
      projectGeneratorStatus,
      projectGeneratorVersion,
      projectGeneratorJWKS,
      loadingWso2,
      wso2Status,
      closeModal,
      checkStatus,
    };
  },
});
</script>
