<template lang="pug">
  .c-resources
    .d-flex.align-items-center.justify-content-between.mb-4.mt-4
      div(v-if="connection && openApiDefinitionExists")
        h1.l-title.m-0.pl-4
          span {{ $t('resources.title') }} ({{resources.length}})
      div(v-else)
        h1.l-title.m-0.pl-4
          span
      div(v-if="existsDefinitionFromIframeConfiguration")
        div(v-if="!connection")
          button(disabled='disabled').e-btn.bg-brand.color-white.mr-3.disabled Esperando conexión...
        div(v-else-if="!applicationDataFilled")
          b-button(variant="link"
                  v-b-tooltip.hover.bottomleft
                  v-b-tooltip.hover.html="$t('resources.importApiDefinitionDisabled')"
                  tabindex="-1")
                i.fas.fa-question-circle(style="color: red")
        div(v-else-if="autoLoadingIframe")
          div(style="display: flex; align-items: center; gap: 10px")
            i.fas.fa-spinner.fa-spin
            span Cargando definición del API...

      div(v-else)
        div(v-if="connection && applicationDataFilled")
          button(@click="openModalImportApi").e-btn.bg-brand.color-white.mr-3 {{ $t('resources.importApiDefinition') }}
        div(v-else)
          div(v-if="connection")
            b-button(variant="link"
                    v-b-tooltip.hover.bottomleft
                    v-b-tooltip.hover.html="$t('resources.importApiDefinitionDisabled')"
                    tabindex="-1")
                  i.fas.fa-question-circle(style="color: red")
            button(disabled='disabled').e-btn.bg-brand.color-white.mr-3.disabled {{ $t('resources.importApiDefinition') }}
    .js-resources
      div(v-if="connection")
        div(v-if="loadingInformation && openApiDefinitionExists")
          div {{ $t('loadingTables') }}
          div(style="position: relative; left: 50%; transform: translateX(-50%); text-align: center; margin-top: 30px; font-size: 30px")
            i.fas.fa-spinner-third.fa-spin
        div(v-else)
          div(v-if="resources && resources.length >= 1")
            template(v-for="r in resources")
              template(v-if="r !== undefined")
                md-resources-item.mb-3(
                  :key="r"
                  :controller-key="r"
                  :controllerKey="r"
                  :additionalEntitiesToInclude="additionalEntitiesToInclude(r)"
                )

      div(v-if="openApiDefinitionExists || asyncApiDefinitionObjectExists" style="display: flex; justify-content: flex-end; gap: 10px")
        b-button(v-if="openApiDefinitionExists" variant="info" @click="downloadEnrichedOpenApi")
          div(style="display: flex; justify-content: flex-end")
            i(style="margin-right: 10px; margin-top: 4px").fas.fa-file-download
            div Previsualizar OpenAPI
        b-button(v-if="asyncApiDefinitionObjectExists" variant="info" @click="downloadEnrichedAsyncApi")
          div(style="display: flex; justify-content: flex-end")
            i(style="margin-right: 10px; margin-top: 4px").fas.fa-file-download
            div Previsualizar AsyncAPI
        b-button(v-if="openApiDefinitionExists || asyncApiDefinitionObjectExists" variant="success" @click="exportToApiQuality" :disabled="exporting")
          div(style="display: flex; justify-content: flex-end")
            i(v-if="!exporting" style="margin-right: 10px; margin-top: 4px").fas.fa-cloud-upload-alt
            i(v-else style="margin-right: 10px; margin-top: 4px").fas.fa-spinner.fa-spin
            div {{ exporting ? 'Exportando...' : 'Enviar a API Quality' }}
        //- Generar código (oculto temporalmente)
        //- b-button(variant="danger" @click="openModalByID(modalGenerateCode)").bg-brand
        //-   div(style="display: flex; justify-content: flex-end")
        //-     i(style="margin-right: 10px; margin-top: 4px").fas.fa-file-code
        //-     div Generar código
    
    md-modal(
      :modalId="nameIdModal"
      v-model="createResourceModalVisible"
      title="Crear Recurso desde Base de Datos")
      md-create-resource(
        :modalId="nameIdModal"
      )

    md-modal(
      :modalId="importApiModal"
      v-model="importApiModalVisible"
      title="Importar Definición del API")
      md-import-configuration(
        :modalId="importApiModal"
        @close="importApiModalVisible = false"
      )

    md-modal(:modalId="modalGenerateCode" v-model="generateCodeModalVisible" title="Generar Código")
      md-generate-code(
        :modalId="modalGenerateCode"
        :visible="generateCodeModalVisible"
        @close="generateCodeModalVisible = false"
      )

</template>

<script lang="ts">
/* eslint-disable */
import {
  defineComponent, computed, inject, ref, watch,
  getCurrentInstance,
} from 'vue';
import { useStore } from 'vuex';
import MdResourcesItem from '@/components/resources/MdResourcesItem.vue';
import MdCreateResource from '@/components/resources/MdCreateResource.vue';
import MdImportConfiguration from '@/components/resources/MdImportApiDefinition.vue';
import MdModal from '@/components/commons/MdModal.vue';
import { ConfigGenApiResponse } from '@/services/config-gen-api.service';
import MdAsyncApiVisualizer from './asyncapi/MdAsyncApiVisualizer.vue';
import MdGenerateCode from './resources/MdGenerateCode.vue';
import { openApiParserService } from '@/services/openapi';
import runImportPipeline from '@/services/openapi/import-pipeline';

export default defineComponent({
  name: 'MdResources',
  components: {
    MdResourcesItem,
    MdCreateResource,
    MdImportConfiguration,
    MdModal,
    MdAsyncApiVisualizer,
    MdGenerateCode,
  },
  setup() {
    const store = useStore();
    const $toast: any = inject('$toast');

    const nameIdModal = 'md-modal-create-resource';
    const importApiModal = 'md-modal-import-configuration';
    const modalGenerateCode = 'md-modal-generate-code';

    const createResourceModalVisible = ref(false);
    const importApiModalVisible = ref(false);
    const generateCodeModalVisible = ref(false);
    const connection = computed<boolean>(() => store.state.connectionStore.id || (store.state.applicationStore.archetype_has_database && store.state.connectionStore.id != null));
    const existsDefinitionFromIframeConfiguration = computed<boolean>(() => store.state.iframe_initial_configuration != null && store.state.iframe_initial_configuration.openapi_yaml_in_base64 != null);
    
    const loadingInformation = computed<boolean>(() => store.state.controllers.list === undefined || store.state.controllers.list.length === 0);
    let loading: boolean = false;
    let loadedControllers: any[] = [];
    const config = {
      headers: { 'x-datasource-id': store.state.connectionStore.id },
    };
    let loadedApiDefinition: boolean = false;
    let loadedIframeIntoBefore: boolean = false;
    const { proxy } = getCurrentInstance() as any;

    const continueWithImportedConfiguration = async (): Promise<void> => {
      loading = true;
      const iframeConfig = store.state.iframe_initial_configuration;
      const existsDefinitionFromIframe = iframeConfig != null
        && iframeConfig.openapi_yaml_in_base64 != null;

      if (!existsDefinitionFromIframe || loadedIframeIntoBefore) {
        loading = false;
        return;
      }

      loadedIframeIntoBefore = true;

      // Procesar OpenAPI con el parseo local (mismo flujo que importApiDefinition)
      if (iframeConfig.openapi_yaml_in_base64) {
        try {
          const fileText = atob(iframeConfig.openapi_yaml_in_base64);
          const controllers = openApiParserService.parseFile(fileText);

          const rawDoc = openApiParserService.getRawDocument();
          if (rawDoc?.info) {
            if (rawDoc.info.title) {
              store.commit('applicationStore/SET_NAME', rawDoc.info.title);
            }
            if (rawDoc.info.description) {
              store.commit('applicationStore/SET_DESCRIPTION', rawDoc.info.description);
            }
            if (rawDoc.info.version) {
              store.commit('applicationStore/SET_VERSION', rawDoc.info.version);
            }
          }

          const controllersWithSource = controllers.map((controller: any) => ({
            ...controller,
            source: 'swagger',
          }));

          loadedControllers = controllersWithSource.filter((controller: any) => controller !== undefined
            && controller.request_mapping !== undefined
            && controller.request_mapping !== '/status');

          store.state.api_definition = iframeConfig.openapi_yaml_in_base64;
          loading = false;
          loadedApiDefinition = true;
          $toast.success('Definición del api importada', 'Se ha cargado y procesado el fichero correctamente.');

          if (store.getters['applicationStore/archetypeHasDatabase'] && loadedApiDefinition) {
            await loadAllTables();
          } else {
            await store.dispatch('controllers/importControllers', loadedControllers);
          }
        } catch (err: any) {
          loading = false;
          const errorMsg = err?.message || 'Error al parsear el fichero OpenAPI del iframe';
          $toast.error('Error', errorMsg);
        }
      }

    };

    const loadAllTables = async (): Promise<void> => {
      try {
        const rawDoc = openApiParserService.getRawDocument();
        await runImportPipeline(store, loadedControllers, rawDoc);
        $toast.success('Tablas leídas satisfactoriamente', 'Tablas leídas');
      } catch (err: any) {
        loading = false;
        console.error(err);
        $toast.errorFromServer(err);
      }
    };

    const checkConnnection = () => {
      if (!connection.value) {
        const err: Error = {
          name: 'No se puede cargar el Swagger',
          message: 'Para importar un archivo swagger o crear un nuevo recurso necesitas tener una conexión activa.',
        };
        $toast.error(err);
        return false;
      }
      return true;
    };

    const openModal = () => {
      if (checkConnnection()) {
        createResourceModalVisible.value = true;
      }
    };

    const openModalByID = (modalIDToOpen: string) => {
      if (checkConnnection()) {
        if (modalIDToOpen === modalGenerateCode) generateCodeModalVisible.value = true;
      }
    };

    const openModalImportApi = () => {
      if (checkConnnection()) {
        importApiModalVisible.value = true;
      }
    };

    const resources = computed(() => store.state.controllers.list);

    const additionalEntitiesToInclude = (controllerKey:any): any => {
      // Se convierte de Set a Array la propiedad 'additional_entities' al cargar el componente
      const controller = store.state.controllers._[controllerKey];
      if (!controller) return [];
      const { additionalEntities } = controller;
      const entitiesToInclude : Array<string> = [];
      if (additionalEntities !== undefined) {
        // eslint-disable-next-line
        for (const additionalEntity of additionalEntities.values()) {
          entitiesToInclude.push(additionalEntity);
        }
      }
      return entitiesToInclude;
    };

    const getIfNameIsFilled = (): boolean => store.state.applicationStore.name !== undefined && store.state.applicationStore.name !== '' && store.state.applicationStore.name.length > 0;
    const getIfDescriptionIsFilled = (): boolean => store.state.applicationStore.description !== undefined && store.state.applicationStore.description !== '' && store.state.applicationStore.description.length > 0;
    const getIfGroupIsFilled = (): boolean => store.state.applicationStore.group !== undefined && store.state.applicationStore.group !== '' && store.state.applicationStore.group.length > 0;
    const getIfVersionIsFilled = (): boolean => store.state.applicationStore.version !== undefined && store.state.applicationStore.version !== '' && store.state.applicationStore.version.length > 0;

    const applicationDataFilled = computed(() => getIfNameIsFilled() && getIfDescriptionIsFilled() && getIfVersionIsFilled());

    const asyncApiDefinitionObjectExists = computed<boolean>(() => store.state.async_api_definition_object !== undefined 
           && store.state.async_api_definition_object !== null 
           && Object.keys(store.state.async_api_definition_object).length > 0);

    const openApiDefinitionExists = computed<boolean>(() => store.state.api_definition !== undefined && store.state.api_definition !== '');

    const hasNoConnectionWithDB = computed<boolean>(() => store.state.connectionStore.id === -1);

    const asyncAPIHasTables = computed<boolean>(() => store.state.async_api_definition_has_related_tables);

    const exporting = ref(false);

    const exportToApiQuality = () => {
      const yamlAction = openApiDefinitionExists.value ? 'getEnrichedOpenApiYaml' : 'getEnrichedAsyncApiYaml';
      const messageType = openApiDefinitionExists.value ? 'openapi-update' : 'asyncapi-update';

      exporting.value = true;

      store.dispatch(yamlAction)
        .then((yaml: string | null) => {
          if (!yaml) {
            throw new Error('No hay un documento cargado.');
          }
          const base64 = btoa(unescape(encodeURIComponent(yaml)));
          window.parent.postMessage({ type: messageType, content_in_base64: base64 }, '*');
          exporting.value = false;
          $toast.success('Definición enviada', 'Se ha enviado la definición enriquecida a la página padre.');
        })
        .catch((err: any) => {
          exporting.value = false;
          $toast.error({ name: 'Error al enviar', message: err.message || 'Error inesperado al enviar la definición.' });
        });
    };

    const downloadEnrichedOpenApi = () => {
      const yamlContent = store.dispatch('getEnrichedOpenApiYaml');
      yamlContent.then((yaml: string | null) => {
        if (!yaml) {
          $toast.error({ name: 'Error', message: 'No hay un documento OpenAPI cargado.' });
          return;
        }
        const blob = new Blob([yaml], { type: 'application/x-yaml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const appName = store.state.applicationStore.name || 'openapi';
        link.href = url;
        link.download = `${appName}-enriched.yaml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    };

    const downloadEnrichedAsyncApi = () => {
      const yamlContent = store.dispatch('getEnrichedAsyncApiYaml');
      yamlContent.then((yaml: string | null) => {
        if (!yaml) {
          $toast.error({ name: 'Error', message: 'No hay un documento AsyncAPI cargado.' });
          return;
        }
        const blob = new Blob([yaml], { type: 'application/x-yaml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const appName = store.state.applicationStore.name || 'asyncapi';
        link.href = url;
        link.download = `${appName}-asyncapi-enriched.yaml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    };

    const autoLoadingIframe = ref(false);

    // Auto-ejecutar parseo cuando hay OpenAPI del iframe y la conexión + datos están listos
    watch(
      [connection, applicationDataFilled, existsDefinitionFromIframeConfiguration],
      ([conn, _appFilled, hasIframeConfig]) => {
        if (conn && hasIframeConfig && !loadedIframeIntoBefore && !autoLoadingIframe.value) {
          autoLoadingIframe.value = true;
          continueWithImportedConfiguration().finally(() => {
            autoLoadingIframe.value = false;
          });
        }
      },
      { immediate: true },
    );

    return {
      nameIdModal,
      importApiModal,
      modalGenerateCode,
      createResourceModalVisible,
      importApiModalVisible,
      generateCodeModalVisible,
      connection,
      openModal,
      openModalByID,
      openModalImportApi,
      resources,
      additionalEntitiesToInclude,
      applicationDataFilled,
      asyncApiDefinitionObjectExists,
      openApiDefinitionExists,
      hasNoConnectionWithDB,
      asyncAPIHasTables,
      downloadEnrichedOpenApi,
      downloadEnrichedAsyncApi,
      exportToApiQuality,
      exporting,
      existsDefinitionFromIframeConfiguration,
      loadingInformation,
      autoLoadingIframe,
    };
  },
});
</script>
