<template lang="pug">
div
  div(v-if="loadingTablesInformation")
    div {{ $t('loadingTables') }}
    div(style="position: relative; left: 50%; transform: translateX(-50%); text-align: center; margin-top: 30px; font-size: 30px")
      i.fas.fa-spinner-third.fa-spin
  div(v-else)
    div(v-if="nonLoadedTables.length > 0").alert.alert-danger
      div {{ $t('asyncApiVisualizer.nonExistingTables1') }}
      div {{ $t('asyncApiVisualizer.nonExistingTables2') }}
      ul(v-for="table in nonLoadedTables" style="margin-top: 10px")
        li {{ table }}
    div.async-api-data-container
      div(v-for="channel in getChannelsFromAsyncAPIObject()" style="margin-bottom: 30px")
        h2.l-subtitle.font-weight-bold.mb-0 {{ channel.key }}
        
        div(v-if="channel.publisher != null").mb-2
          div.c-resource__item.c-resource__item--send
            div.d-flex.align-items-center
              span.c-resource__method send
              span.c-resource__endpoint {{ channel.publisher.operationId }}
              span.c-resource__info(v-if="channel.publisher['x-scs-function-name']")  · {{ channel.publisher['x-scs-function-name'] }}
          div.margin-bottom-10.mt-2(v-if="databaseConnectionInitialized") {{ $t('asyncApiVisualizer.relatedTables') }}
          multiselect(v-if="databaseConnectionInitialized"
                  :options="tables"
                  v-model="channel.publisher['x-related-tables']"
                  :multiple="true"
                  :close-on-select="false"
                  placeholder="Incluir tabla adicional"
                  deselect-label="Pulse para eliminar"
                  select-label="Clique o pulse enter"
                  style="margin-top: 5px; margin-bottom: 15px"
                )
                template
                  span(slot="noOptions") {{ $t('emptyList') }}

        div(v-if="channel.subscriber != null").mb-2
          div.c-resource__item.c-resource__item--receive
            div.d-flex.align-items-center
              span.c-resource__method receive
              span.c-resource__endpoint {{ channel.subscriber.operationId }}
              span.c-resource__info(v-if="channel.subscriber['x-scs-function-name']")  · {{ channel.subscriber['x-scs-function-name'] }}
          div.margin-bottom-10.mt-2(v-if="databaseConnectionInitialized") {{ $t('asyncApiVisualizer.relatedTables') }}
          multiselect(v-if="databaseConnectionInitialized"
                  :options="tables"
                  v-model="channel.subscriber['x-related-tables']"
                  :multiple="true"
                  :close-on-select="false"
                  placeholder="Incluir tabla adicional"
                  deselect-label="Pulse para eliminar"
                  select-label="Clique o pulse enter"
                  selected-label="Tabla seleccionada"
                  style="margin-top: 5px; margin-bottom: 15px"
                )
                template
                  span(slot="noOptions") {{ $t('emptyList') }}

    div(v-if="databaseConnectionInitialized")
      div.async-api-channel-key {{ $t('asyncApiVisualizer.additionalTables1') }} 
      div.margin-bottom-10 {{ $t('asyncApiVisualizer.additionalTables2') }} 
      multiselect(:options="tables" 
                  v-model="extraTables"
                  :multiple="true"
                  :close-on-select="false"
                  @select="extraTablesOnChange"
                  @delete="extraTablesOnChange"
                  placeholder="Incluir tabla adicional" 
                  deselect-label="Pulse para eliminar"
                  select-label="Clique o pulse enter"
                  selected-label="Tabla seleccionada").margin-bottom-20
                  template
                    span(slot="noOptions") {{ $t('emptyList') }}
</template>

<script lang="ts">
import {
  defineComponent, ref, computed, onMounted,
} from 'vue';
import { useStore } from 'vuex';
import Multiselect from '@vueform/multiselect';

export default defineComponent({
  name: 'MdAsyncApiVisualizer',
  components: {
    Multiselect,
  },
  setup() {
    const store = useStore();

    const tables = ref<string[]>([]);
    const extraTables = ref<string[]>(store.state.async_api_extra_tables !== undefined ? store.state.async_api_extra_tables : []);
    const nonLoadedTables = ref<string[]>([]);
    const loadingTablesInformation = ref(true);

    const databaseConnectionInitialized = computed(() => store.state.connectionStore.id !== -1);

    const getAsyncAPIObjectFromStore = () => store.state.async_api_definition_object;

    const getChannelsFromAsyncAPIObject = (): any[] => {
      const asyncAPIObject = getAsyncAPIObjectFromStore();
      const channelObjects: any[] = [];

      if (asyncAPIObject === null || asyncAPIObject.channels === null) return channelObjects;

      // Detectar si es AsyncAPI v3 (tiene 'operations' a nivel raíz)
      const isV3 = asyncAPIObject.operations !== undefined && asyncAPIObject.operations !== null;

      if (isV3) {
        // AsyncAPI v3: agrupar operaciones por channel
        const channelOps: Record<string, { sends: any[]; receives: any[] }> = {};

        Object.entries(asyncAPIObject.operations || {}).forEach(([opKey, operation]: [string, any]) => {
          const channelRef = operation.channel?.$ref;
          if (!channelRef) return;
          const channelKeyMatch = channelRef.match(/^#\/channels\/(.+)$/);
          if (!channelKeyMatch) return;
          const channelKey = channelKeyMatch[1];

          if (!channelOps[channelKey]) {
            channelOps[channelKey] = { sends: [], receives: [] };
          }

          const opInfo = { operationId: opKey, ...operation };
          if (operation.action === 'send') {
            channelOps[channelKey].sends.push(opInfo);
          } else {
            channelOps[channelKey].receives.push(opInfo);
          }
        });

        Object.entries(asyncAPIObject.channels).forEach(([channelKey, channel]: [string, any]) => {
          const ops = channelOps[channelKey] || { sends: [], receives: [] };
          const objectToInclude: any = {
            key: channelKey,
            address: channel.address,
            publisher: ops.sends.length > 0 ? { operationId: ops.sends.map((s: any) => s.operationId).join(', '), ...ops.sends[0] } : null,
            subscriber: ops.receives.length > 0 ? { operationId: ops.receives.map((r: any) => r.operationId).join(', '), ...ops.receives[0] } : null,
          };
          channelObjects.push(objectToInclude);
        });
      } else {
        // AsyncAPI v2: publish/subscribe en el channel directamente
        Object.entries(asyncAPIObject.channels).forEach((entry: any) => {
          const key = entry[0];
          const objectToInclude = {
            key,
            publisher: entry[1].publish,
            subscriber: entry[1].subscribe,
          };
          channelObjects.push(objectToInclude);
        });
      }

      return channelObjects;
    };

    onMounted(() => {
      tables.value = [];

      if (databaseConnectionInitialized.value) {
        store.dispatch('connectionStore/fetchTables')
          .then((result: any) => {
            const rawTables = Array.isArray(result) ? result : (result.tables || []);
            rawTables.forEach((table: any) => {
              const tableName = typeof table === 'string' ? table : table.name;
              tables.value.push(tableName);
            });

            const channelObjects: any[] = getChannelsFromAsyncAPIObject();
            const nonExistingTables: Set<string> = new Set();

            for (let i = 0; i < channelObjects.length; i += 1) {
              const channelObject = channelObjects[i];

              if (channelObject.publisher != null && channelObject.publisher['x-related-tables'] != null && channelObject.publisher['x-related-tables'].length > 0) {
                const relatedTables = channelObject.publisher['x-related-tables'];
                const tablesToMaintain: string[] = [];

                relatedTables.forEach((relatedTable: string) => {
                  if (!tables.value.includes(relatedTable)) {
                    nonExistingTables.add(relatedTable);
                  } else {
                    tablesToMaintain.push(relatedTable);
                  }
                });

                channelObject.publisher['x-related-tables'] = tablesToMaintain;
              }

              if (channelObject.subscriber != null && channelObject.subscriber['x-related-tables'] != null && channelObject.subscriber['x-related-tables'].length > 0) {
                const relatedTables = channelObject.subscriber['x-related-tables'];
                const tablesToMaintain: string[] = [];

                relatedTables.forEach((relatedTable: string) => {
                  if (!tables.value.includes(relatedTable)) {
                    nonExistingTables.add(relatedTable);
                  } else {
                    tablesToMaintain.push(relatedTable);
                  }
                });

                channelObject.subscriber['x-related-tables'] = tablesToMaintain;
              }
            }

            nonExistingTables.forEach((entry: string) => nonLoadedTables.value.push(entry));

            loadingTablesInformation.value = false;
          })
          .catch(() => {
            loadingTablesInformation.value = false;
          });
      } else {
        loadingTablesInformation.value = false;
      }
    });

    const extraTablesOnChange = () => {
      store.state.async_api_extra_tables = extraTables.value;
    };

    return {
      tables,
      extraTables,
      nonLoadedTables,
      loadingTablesInformation,
      databaseConnectionInitialized,
      getChannelsFromAsyncAPIObject,
      extraTablesOnChange,
    };
  },
});
</script>
