<template lang="pug">
  md-endpoint-section(
    v-if="(parameters && parameters.length > 0) || controllerSource === 'database'"
    title="Parámetros del recurso"
    :parameters="customParameters"
    :entity="entity"
    :endpointKey="endpointKey"
    :foreignKeysAttributes="foreignKeysAttributes"
  )
    //.alert.alert-info.my-0(v-if="controllerSource === 'database'")
      | Cabecera estándar x-trace-id
    //md-endpoint-parameters-table(
      :parameter-keys="parameters"
      :operation="operation"
      :foreignKeysAttributes="foreignKeysAttributes"
    //)
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import MdEndpointSection from '@/components/endpoint/MdEndpointSection.vue';
import MdEndpointParametersTable from '@/components/endpoint/MdEndpointParametersTable.vue';

export default defineComponent({
  name: 'MdEndpointDetailsParameters',
  components: {
    MdEndpointSection,
    MdEndpointParametersTable,
  },
  props: {
    endpointKey: {
      type: String,
      required: true,
    },
    controllerSource: {
      type: String,
      default: '',
    },
    foreignKeysAttributes: {
      type: Array as () => any[],
      default: () => [],
    },
  },
  setup(props) {
    const store = useStore();

    // Reemplazo de get parameters()
    const parameters = computed<string[]>(() => store.state.endpoints._[props.endpointKey]?.parameters || []);

    // Reemplazo de get customParameters()
    const customParameters = computed(() => {
      const endpointParams = store.state.endpoints._[props.endpointKey]?.parameters || [];
      const parametersData: any[] = [];

      endpointParams.forEach((parameterID: string) => {
        const parameterData = store.state.endpointParameters._[parameterID];
        if (parameterData) {
          // Añadimos el parameterID directamente al objeto del store (igual que Vue 2)
          // para que el v-model y el reset operen sobre el mismo objeto
          parameterData.parameterID = parameterID;
          parametersData.push(parameterData);
        }
      });

      // Filtramos parámetros nulos y aquellos que contienen '$'
      return parametersData.filter(
        (p: any) => p != null && p.name != null && !p.name.includes('$'),
      );
    });

    // Reemplazo de get operation()
    const operation = computed(() => store.state.endpoints._[props.endpointKey]?.operation || '');

    // Reemplazo de get entity()
    const entity = computed(() => {
      const endpoint = store.state.endpoints._[props.endpointKey];
      if (!endpoint) return '';
      
      const entityName = endpoint.entity || endpoint.requestBody?.entity;
      return entityName ? entityName.toLowerCase() : '';
    });

    return {
      parameters,
      customParameters,
      operation,
      entity,
    };
  },
});
</script>
