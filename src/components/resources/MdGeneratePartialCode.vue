<template lang="pug">
  .c-generate-code
    .px-5.py-3.text-center
      div.l-title.mb-3
        b GENERACIÓN PARCIAL
      div.mb-3
        | Pulsa <i><b>Continuar</b></i> para obtener el recurso.
      div.small
        | Se descargará automáticamente un archivo comprimido ({{zipCodeFilename}})
        | con las clases del recurso.
      div.mt-3(v-if="downloaded")
        div.d-flex.align-items-center.justify-content-center.color-ok
          i.far.fa-check-circle.mr-1.fa-2x
          div.h5.m-0.p-0 Descarga finalizada
    .border-top.pt-3.text-right
      b-button(variant='default' size='sm' @click='closeModal')
        | {{buttonClose}}
      b-button(
        v-if="!downloaded"
        variant='success'
        size='sm'
        @click='generateCodeFile'
        )
        | Descargar código

</template>
<script lang="ts">
import {
  defineComponent, ref, computed, getCurrentInstance, 
} from 'vue';
import { useStore } from 'vuex';
import { AxiosError, AxiosResponse } from 'axios';
import { ProjectGenApiResponse } from '../../services/project-gen-api.service';

export default defineComponent({
  name: 'ImportConfiguration',
  props: {
    modalId: {
      type: String,
      required: true,
    },
    resourceName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    // Obtenemos la instancia para acceder a plugins globales ($toast, $bvModal, etc.)
    const { proxy } = getCurrentInstance() as any;

    // Estado reactivo (Data)
    const downloaded = ref(false);
    const buttonClose = ref('Cancelar');

    // Propiedades computadas
    const zipCodeFilename = computed(() => `${props.resourceName || 'recurso'}.zip`);

    // Métodos
    const closeModal = () => {
      // En Vue 3 con bootstrap-vue-3 se sigue usando el ID del modal
      proxy.$bvModal.hide(props.modalId);
    };

    const generateCodeFile = () => {
      const {
        name, description, group, version, 
      } = store.state.applicationStore;

      if (name.length > 0 && description.length > 0 && group.length > 0 && version.length > 0) {
        store.commit('applicationStore/SET_PARTIAL', true);
        const existsDefinitionFromIframeConfiguration = proxy.$store.state.iframe_initial_configuration != null && proxy.$store.state.iframe_initial_configuration.openapi_yaml_in_base64 != null;

        return store.dispatch('generateJSONPartialConfig', props.resourceName)
          .then((configFile: any) => proxy.$projectGenApi.generateProject(configFile, existsDefinitionFromIframeConfiguration))
          .then((response: AxiosResponse<ProjectGenApiResponse>) => {
            const { data } = response;
            downloaded.value = true;
            buttonClose.value = 'Cerrar';
            proxy.$toast.success('FILE GENERATED', 'Se ha generado el recurso correctamente.');
            return data;
          })
          .then((data: any) => {
            if (existsDefinitionFromIframeConfiguration) {
              return data.text();
            }
            return proxy.$filesService.downloadBlob(data, zipCodeFilename.value);
          })
          .then((data: any) => {
            if (existsDefinitionFromIframeConfiguration) {
              window.parent.postMessage(JSON.parse(data).data, '*');
            }
          })
          .catch((err: AxiosError) => {
            if ((err.code == null || err.code === 'ERR_NETWORK') && err.message === 'Network Error' && err.response === undefined) {
              // En lugar de modificar err.name y err.message directamente:
              const errorTitle = 'Error de conexión';
              const errorMessage = `${err.config?.url ?? '(Sin URL)'} con método ${err.config?.method?.toUpperCase() ?? '(Sin método HTTP)'} y error: ${err.message}. Compruebe su conexión a internet y la conectividad con ${process.env.VUE_APP_CONFIG_GEN_API_URL}/status`;
              
              // Pasamos el título y mensaje directamente al toast
              proxy.$toast.error(errorTitle, errorMessage);
            } else {
              proxy.$toast.errorFromServer(err);
            }
            closeModal();
          });
      }

      // Validaciones de error
      if (name.length === 0) proxy.$toast.Error('Error', 'El campo name es obligatorio');
      if (description.length === 0) proxy.$toast.Error('Error', 'El campo description es obligatorio');
      if (group.length === 0) proxy.$toast.Error('Error', 'El campo group es obligatorio');
      if (version.length === 0) proxy.$toast.Error('Error', 'El campo version es obligatorio');
      
      return undefined;
    };

    return {
      downloaded,
      buttonClose,
      zipCodeFilename,
      generateCodeFile,
      closeModal,
    };
  },
});
</script>
