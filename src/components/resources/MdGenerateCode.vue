<template lang="pug">
  .c-generate-code
    .px-5.py-3.text-center
      div.l-title.mb-3
        b GENERAR ARQUETIPO
      div.mb-3
        | Selecciona la tecnología y pulsa <i><b>Descargar código</b></i> para obtener el arquetipo.

      div.mb-3
        label.d-block.mb-2
          b Tecnología del backend
        .d-flex.justify-content-center(style="gap: 12px")
          template(v-for="backend in backends" :key="backend.key")
            label.btn.btn-outline-primary(
              :class="{ active: selectedBackend === backend.key, disabled: !backend.enabled }"
              style="cursor: pointer; min-width: 120px"
            )
              input.d-none(
                type="radio"
                :value="backend.key"
                v-model="selectedBackend"
                :disabled="!backend.enabled"
              )
              | {{ backend.label }}
              span.ml-1.small.text-muted(v-if="!backend.enabled") (Próximamente)

      div.small
        | Se descargará automáticamente un archivo comprimido ({{zipCodeFilename}})
        | con el arquetipo.

      div.mt-3(v-if="downloaded")
        div.d-flex.align-items-center.justify-content-center.color-ok
          i.far.fa-check-circle.mr-1.fa-2x
          div.h5.m-0.p-0 Descarga finalizada

    .border-top.pt-3.text-right
      b-button(variant='default' size='sm' @click='closeModal')
        | {{buttonClose}}
      b-button(
        v-if="!downloaded && !downloading"
        variant='success'
        size='sm'
        @click='generateCodeFile'
        style="width: 130px"
        :disabled="!selectedBackend"
        )
        | Descargar código

      b-button(
        v-if="!downloaded && downloading"
        variant='success'
        size='sm'
        style="width: 130px"
        :disabled="true"
        )
        i.fas.fa-spinner-third.fa-spin

</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, computed, inject, watch } from 'vue';
import { useStore } from 'vuex';
import { AxiosResponse } from 'axios';
import apigenApi, { ApigenBackend, ApigenBackendOption } from '@/services/apigen-api.service';

export default defineComponent({
  name: 'MdGenerateCode',
  props: {
    modalId: {
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
    const store = useStore();
    const $toast: any = inject('$toast');
    const $filesService: any = inject('$filesService');

    const downloaded = ref(false);
    const downloading = ref(false);
    const buttonClose = ref('Cancelar');
    const backends = ref<ApigenBackendOption[]>(apigenApi.getBackends());
    const selectedBackend = ref<ApigenBackend | ''>('dotnet');

    const zipCodeFilename = computed((): string => {
      const appName = store.getters['applicationStore/getName'];
      return `${appName}.zip`;
    });

    const existsDefinitionFromIframeConfiguration = computed((): boolean => {
      return store.state.iframe_initial_configuration != null && store.state.iframe_initial_configuration.openapi_yaml_in_base64 != null
    });

    const closeModal = (): void => {
      emit('close');
    };

    // Resetear estado cuando el modal se abre
    watch(() => props.visible, (newValue) => {
      if (newValue) {
        downloaded.value = false;
        downloading.value = false;
        buttonClose.value = 'Cancelar';
      }
    });

    const generateWithApigen = (): void => {
      if (!selectedBackend.value) return;

      downloading.value = true;

      store.dispatch('getEnrichedOpenApiYaml')
        .then((yamlContent: string | null) => {
          if (!yamlContent) {
            throw new Error('No hay un documento OpenAPI cargado para generar.');
          }
          return apigenApi.generateArchetype(selectedBackend.value as ApigenBackend, yamlContent);
        })
        .then((response: AxiosResponse<Blob>) => {
          downloaded.value = true;
          downloading.value = false;
          buttonClose.value = 'Cerrar';
          $toast.success('Ficheros generados', 'Se ha generado el arquetipo correctamente.');

          if (existsDefinitionFromIframeConfiguration) {
              return response.data.text();
            }
            return $filesService.downloadBlob(response.data, zipCodeFilename.value);
        })
        .then((data) => {
            if (existsDefinitionFromIframeConfiguration) {
              window.parent.postMessage(JSON.parse(data).data, '*');
            }
        })
        .catch((err: any) => {
          downloading.value = false;
          if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
            $toast.error({
              name: 'Error de conexion',
              message: 'No se pudo conectar con el backend. Verifique la URL del apigen seleccionado.',
            });
          } else {
            $toast.error({
              name: 'Error al generar',
              message: err.message || 'Error inesperado al generar el arquetipo.',
            });
          }
        });
    };

    const generateCodeFile = (): void => {
      const { name } = store.state.applicationStore;
      const { description } = store.state.applicationStore;
      const { group } = store.state.applicationStore;
      const { version } = store.state.applicationStore;

      if (name.length === 0) { $toast.error({ name: 'Error', message: 'El campo name es obligatorio' }); return; }
      if (description.length === 0) { $toast.error({ name: 'Error', message: 'El campo description es obligatorio' }); return; }
      if (group.length === 0) { $toast.error({ name: 'Error', message: 'El campo group es obligatorio' }); return; }
      if (version.length === 0) { $toast.error({ name: 'Error', message: 'El campo version es obligatorio' }); return; }

      generateWithApigen();
    };

    return {
      downloaded,
      downloading,
      buttonClose,
      zipCodeFilename,
      generateCodeFile,
      closeModal,
      backends,
      selectedBackend,
    };
  },
});
</script>
