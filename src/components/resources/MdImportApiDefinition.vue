<template lang="pug">
div
  div(v-if="!continueWithAsyncAPIWithDatabase")
    .c-import-config
      // Importación del Swagger/OpenApi
      .dropbox(v-if="!apiToGenerateIsAsyncAPI")
        input#file-openapi.input-file(
          type='file'
          @change='uploadOpenApiFile'
          accept='.yaml,.yml,.json'
          :disabled="loadedApiDefinition || apiToGenerateIsAsyncAPI")
        .text(v-if="!apiDefinitionFile")
          | Arrastre el fichero de definición del API aquí
          br
          |  o haga click para buscar
        .border(v-else)
          span {{ formatLongFileName(apiDefinitionFile.name) }}
      // Importación del AsyncAPI
      .dropbox.mb-3
        input#file-asyncapi.input-file(
          type='file'
          @change='uploadAPIDefinitionFile'
          accept='.yaml,.yml'
          :disabled="loadedApiDefinition")
        .text(v-if="!asyncApiDefinitionFile")
          | Arrastre el fichero de definición AsyncAPI aquí
          br
          |  o haga click para buscar
        .border(v-else)
          span {{ formatLongFileName(asyncApiDefinitionFile.name) }}
      div(v-if="notIncludedKafkaStarterWithAsyncAPI").include-starter-kafka-container
        b-button(variant='link' size='sm' @click='includeKafkaStarter').include-starter-kafka-button Se ha cargado el fichero AsyncAPI, pero no se ha incluído el starter de Kafka. Pulse aquí si quiere incluirlo
      div(v-if="notIncludedOpenApiStarterWithOpenAPI").include-starter-kafka-container
        b-button(variant='link' size='sm' @click='includeOpenapiStarter').include-starter-kafka-button Se ha cargado el fichero OpenAPI, pero no se ha incluído el starter de OpenApi. Pulse aquí si quiere incluirlo
      div.feedback-container.border-top
        p(style="margin: 1rem") {{ feedbackContainerText }}
      .border-top.pt-3.text-right
        b-button(variant='default' size='sm' @click='cancelModal')
          | Cancelar
        b-button#ImportDefinition(
          variant='success'
          size='sm'
          v-if="!loading"
          @click='importApiDefinition'
          style="width: 160px"
          :disabled="(!apiDefinitionFileContent && !asyncApiDefinitionFile) || loading || loadingAllTables"
          )
          | {{ getContinueButtonText }}
        b-button(
          variant='success'
          size='sm'
          v-else
          style="width: 160px"
          :disabled="true"
          )
          i.fas.fa-spinner-third.fa-spin
</template>

<script lang="ts">
import {
  defineComponent, ref, computed, inject,
} from 'vue';
import { AxiosError } from 'axios';
import Multiselect from '@vueform/multiselect';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { openApiParserService } from '@/services/openapi';
import runImportPipeline from '@/services/openapi/import-pipeline';
import { asyncApiParserService } from '@/services/asyncapi';
import MdAsyncApiVisualizer from '../asyncapi/MdAsyncApiVisualizer.vue';

export default defineComponent({
  name: 'MdImportApiDefinition',
  components: {
    Multiselect,
    MdAsyncApiVisualizer,
  },
  props: {
    modalId: { type: String, required: true },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const store = useStore();
    const { t } = useI18n();
    const $toast: any = inject('$toast');

    // Puntero a la información de los ficheros subidos
    const apiDefinitionFile = ref<any>(null);

    const asyncApiDefinitionFile = ref<any>(null);

    const apiDefinitionFileContent = ref<any>(null);

    const apiDefinitionFileTextContent = ref<string>('');

    const asyncApiDefinitionFileContent = ref<any>(null);

    const asyncApiDefinitionFileObject = ref<any>(null);

    const asyncApiDefinitionFileTextContent = ref<string>('');

    const asyncApiLoadedControllers = ref<any[]>([]);

    const loading = ref(false);

    const loadedApiDefinition = ref(false);

    const loadingAllTables = ref(false);

    const feedbackContainerText = ref('');

    const starterKafka = 'japi-starter-kafka';

    const starterOpenapi = 'japi-starter-openapi';

    const notIncludedKafkaStarterWithAsyncAPI = ref(false);

    const notIncludedOpenApiStarterWithOpenAPI = ref(false);

    const continueWithAsyncAPIWithDatabase = ref(false);

    const appName = computed((): string => store.getters['applicationStore/getName']);

    const formatLongFileName = (file: string): string => {
      const maxFileNameSizeToShow = 80;
      if (file !== null && file.length >= maxFileNameSizeToShow) {
        return `${file.substring(0, maxFileNameSizeToShow)}...`;
      }

      return file;
    };

    const apiToGenerateIsAsyncAPI = computed(() => appName.value.includes('_async_') && !appName.value.includes('_rest_'));

    const resetForm = (): void => {
      // Limpiar variables
      apiDefinitionFile.value = null;
      apiDefinitionFileContent.value = null;
      apiDefinitionFileTextContent.value = '';
      asyncApiDefinitionFile.value = null;
      asyncApiDefinitionFileContent.value = null;
      asyncApiDefinitionFileObject.value = null;
      asyncApiDefinitionFileTextContent.value = '';
      asyncApiLoadedControllers.value = [];
      loading.value = false;
      loadedApiDefinition.value = false;
      loadingAllTables.value = false;
      feedbackContainerText.value = '';
      notIncludedKafkaStarterWithAsyncAPI.value = false;
      notIncludedOpenApiStarterWithOpenAPI.value = false;
      continueWithAsyncAPIWithDatabase.value = false;

      // Limpiar inputs de archivo HTML
      const openApiInput = document.getElementById('file-openapi') as HTMLInputElement;
      const asyncApiInput = document.getElementById('file-asyncapi') as HTMLInputElement;
      if (openApiInput) openApiInput.value = '';
      if (asyncApiInput) asyncApiInput.value = '';
    };

    const closeModal = (): void => {
      resetForm();
      emit('close');
    };

    const databaseConnectionExists = (): boolean => store.getters['applicationStore/archetypeHasDatabase'] as boolean;

    const uploadOpenApiFile = (ev: any): void => {
      [apiDefinitionFile.value] = ev.target.files;

      const binaryReader = new FileReader();
      binaryReader.readAsBinaryString(apiDefinitionFile.value);
      binaryReader.onload = () => {
        apiDefinitionFileContent.value = String(btoa(String(binaryReader.result)));
        store.commit('SET_API_DEFINITION', apiDefinitionFileContent.value);
        notIncludedOpenApiStarterWithOpenAPI.value = !store.state.applicationStore.starters.includes(starterOpenapi);
      };

      const textReader = new FileReader();
      textReader.readAsText(apiDefinitionFile.value);
      textReader.onload = () => {
        apiDefinitionFileTextContent.value = String(textReader.result);
      };
    };

    const uploadAPIDefinitionFile = (ev: any): void => {
      [asyncApiDefinitionFile.value] = ev.target.files;

      // Leer como base64
      const binaryReader = new FileReader();
      binaryReader.readAsBinaryString(asyncApiDefinitionFile.value);
      binaryReader.onload = () => {
        asyncApiDefinitionFileContent.value = String(btoa(String(binaryReader.result)));
      };

      // Leer como texto para parseo local
      const textReader = new FileReader();
      textReader.readAsText(asyncApiDefinitionFile.value);
      textReader.onload = () => {
        try {
          const fileText = String(textReader.result);
          asyncApiDefinitionFileTextContent.value = fileText;

          loading.value = true;
          feedbackContainerText.value = 'Leyendo fichero AsyncAPI y cargando entidades relacionadas...';

          // Parser local
          const controllers = asyncApiParserService.parseFile(fileText);
          const rawDoc = asyncApiParserService.getRawDocument();

          asyncApiDefinitionFileObject.value = rawDoc;

          // Extraer info
          if (rawDoc?.info) {
            if (rawDoc.info.title) store.commit('applicationStore/SET_NAME', rawDoc.info.title);
            if (rawDoc.info.description) store.commit('applicationStore/SET_DESCRIPTION', String(rawDoc.info.description).trim());
            if (rawDoc.info.version) store.commit('applicationStore/SET_VERSION', rawDoc.info.version);
          }

          // Extraer servers
          const servers = rawDoc?.servers ? Object.keys(rawDoc.servers) : [];
          store.commit('SET_ASYNC_API_SERVERS', servers);

          // Guardar controllers para importar después
          const controllersWithSource = controllers.map((c: any) => ({ ...c, source: 'asyncapi' }));
          asyncApiLoadedControllers.value = controllersWithSource;

          loading.value = false;
          feedbackContainerText.value = 'Cargada la definición';
          notIncludedKafkaStarterWithAsyncAPI.value = !store.state.applicationStore.starters.includes(starterKafka);

          store.commit('SET_ASYNC_API_DEFINITION_OBJECT', rawDoc);
        } catch (err: any) {
          loading.value = false;
          feedbackContainerText.value = '';
          // eslint-disable-next-line no-console
          console.error(err);
          const errorMsg = err?.message || 'Error al parsear el fichero AsyncAPI';
          $toast.Error('Error', errorMsg);
        }
      };
    };

    const cancelModal = (): void => {
      store.commit('SET_API_DEFINITION', undefined);
      store.commit('SET_ASYNC_API_DEFINITION_OBJECT', null);
      closeModal();
    };

    const loadAllTables = async (controllersToLoad: any[], rawDoc?: any): Promise<void> => {
      loadingAllTables.value = true;
      feedbackContainerText.value = 'Establecida la conexión, cargando las tablas...';
      try {
        await runImportPipeline(store, controllersToLoad, rawDoc);
        loadingAllTables.value = false;
        $toast.success('Tablas leídas satisfactoriamente', 'Tablas leídas');
        closeModal();
      } catch (err: any) {
        loading.value = false;
        const error = { ...err };
        const x: string = `errors.${err.message}`;
        const msg = String(t(x));
        // eslint-disable-next-line no-console
        console.error(err);
        if (msg && x !== msg) error.message = msg;
        $toast.errorFromServer(error);
        closeModal();
      }
    };

    const importApiDefinition = async (): Promise<void> => {
      loading.value = true;
      const loadedControllers: any[] = [];

      if (apiDefinitionFileContent.value !== null && apiDefinitionFileContent.value !== '') {
        try {
          const fileText = apiDefinitionFileTextContent.value || atob(apiDefinitionFileContent.value);
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
          if (rawDoc?.['x-anonymization-config']) {
            const importedConfig = rawDoc['x-anonymization-config'];
            const cleanConfig: any = {};
            if (importedConfig.swapLists) {
              cleanConfig.swapLists = importedConfig.swapLists;
            }
            if (Object.keys(cleanConfig).length > 0) {
              store.commit('applicationStore/SET_ANONYMIZATION_CONFIG', cleanConfig);
            }
          }

          const controllersWithSource = controllers.map((controller: any) => ({
            ...controller,
            source: 'swagger',
          }));

          const filteredControllers = controllersWithSource.filter((controller: any) => {
            if (controller !== undefined && controller.request_mapping !== undefined && controller.request_mapping !== '/status') return true;
            return false;
          });
          loadedControllers.push(...filteredControllers);

          loading.value = false;
          loadedApiDefinition.value = true;
          $toast.success('Definición del api importada', 'Se ha cargado y procesado el fichero correctamente, obteniendo así los controladores definidos en el mismo.');
        } catch (err: any) {
          loading.value = false;
          const errorMsg = err?.message || 'Error al parsear el fichero OpenAPI';
          $toast.Error('Error', errorMsg);
          closeModal();
        }

        if (databaseConnectionExists() && loadedApiDefinition.value) {
          const rawDoc = openApiParserService.getRawDocument();
          await loadAllTables(loadedControllers, rawDoc);
        }
        else if (loadedApiDefinition.value) {
          loading.value = false;
          loadingAllTables.value = false;
          await store.dispatch('controllers/importControllers', loadedControllers);
          await store.dispatch('endpointAttributes/propagateAllImportedMappings');
          closeModal();
        }
      }
      else if (asyncApiDefinitionFileContent.value !== null && asyncApiDefinitionFileContent.value !== '') {
        store.commit('SET_ASYNC_API_DEFINITION', asyncApiDefinitionFileContent.value);
        store.commit('SET_ASYNC_API_DEFINITION_OBJECT', asyncApiDefinitionFileObject.value);

        const controllersToLoad = asyncApiLoadedControllers.value;

        if (controllersToLoad.length > 0) {
          loadedApiDefinition.value = true;
          $toast.success('Definición AsyncAPI importada', 'Se ha cargado y procesado el fichero correctamente.');

          if (databaseConnectionExists()) {
            await loadAllTables(controllersToLoad);
          } else {
            loading.value = false;
            loadingAllTables.value = false;
            await store.dispatch('controllers/importControllers', controllersToLoad);
            await store.dispatch('endpointAttributes/propagateAllImportedMappings');
            closeModal();
          }
        } else {
          loading.value = false;
          $toast.Error('Error', 'No se encontraron operaciones en el fichero AsyncAPI');
          closeModal();
        }
      }
      else {
        loading.value = false;
        closeModal();
      }
    };

    const includeKafkaStarter = (): void => {
      if (!store.state.applicationStore.starters.includes(starterKafka)) {
        const selectedStarters = store.state.applicationStore.starters.slice();
        selectedStarters.push(starterKafka);

        const { startersObject } = store.state.applicationStore;

        for (let i = 0; i < startersObject.length; i += 1) {
          if (startersObject[i].title === starterKafka) {
            startersObject[i].selected = true;
            break;
          }
        }

        store.commit('applicationStore/SET_STARTERS', selectedStarters);
        store.commit('applicationStore/SET_STARTERS_OBJECT', startersObject);

        notIncludedKafkaStarterWithAsyncAPI.value = false;
      }
    };

    const includeOpenapiStarter = (): void => {
      if (!store.state.applicationStore.starters.includes(starterOpenapi)) {
        const selectedStarters = store.state.applicationStore.starters.slice();
        selectedStarters.push(starterOpenapi);

        const { startersObject } = store.state.applicationStore;

        for (let i = 0; i < startersObject.length; i += 1) {
          if (startersObject[i].title === starterOpenapi) {
            startersObject[i].selected = true;
            break;
          }
        }

        store.commit('applicationStore/SET_STARTERS', selectedStarters);
        store.commit('applicationStore/SET_STARTERS_OBJECT', startersObject);

        notIncludedOpenApiStarterWithOpenAPI.value = false;
      }
    };

    const loadedAsyncAPIAndNotLoadedOpenAPI = (): boolean => asyncApiDefinitionFileContent.value !== null && asyncApiDefinitionFileContent.value.length > 0 && (apiDefinitionFileContent.value === null || apiDefinitionFileContent.value.length === 0);

    const getContinueButtonText = computed((): string => {
      if (loadedAsyncAPIAndNotLoadedOpenAPI() && !continueWithAsyncAPIWithDatabase.value) {
        return 'Continuar con AsyncAPI';
      }
      if (loadedAsyncAPIAndNotLoadedOpenAPI()) {
        return 'Generar con AsyncAPI';
      }
    
      return 'Continuar';
    });

    return {
      apiDefinitionFile,
      asyncApiDefinitionFile,
      apiDefinitionFileContent,
      asyncApiDefinitionFileContent,
      asyncApiDefinitionFileObject,
      asyncApiDefinitionFileTextContent,
      asyncApiLoadedControllers,
      loading,
      loadedApiDefinition,
      loadingAllTables,
      feedbackContainerText,
      notIncludedKafkaStarterWithAsyncAPI,
      notIncludedOpenApiStarterWithOpenAPI,
      continueWithAsyncAPIWithDatabase,
      uploadOpenApiFile,
      uploadAPIDefinitionFile,
      importApiDefinition,
      cancelModal,
      closeModal,
      getContinueButtonText,
      formatLongFileName,
      apiToGenerateIsAsyncAPI,
      includeKafkaStarter,
      includeOpenapiStarter,
    };
  },
});
</script>
