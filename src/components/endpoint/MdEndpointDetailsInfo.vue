<template lang="pug">
  md-endpoint-section(title="Información" :entity="entity")
    .form-group.d-flex.align-items-center
      label.small.mr-3.mb-0(for='formGroupExampleInput' style="min-width: 100px") Descripción
      input#formGroupExampleInput.form-control(type='text' placeholder='Example input')
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
    endpointKey: { type: String, required: true },
    controllerSource: { type: String, default: '' },
    foreignKeysAttributes: { type: Array as () => any[], default: () => [] },
  },
  setup(props) {
    const store = useStore();

    // Getter: parameters
    const parameters = computed<string[]>(() => store.state.endpoints._[props.endpointKey]?.parameters || []);

    // Getter: customParameters (Lógica de filtrado y mapeo)
    const customParameters = computed(() => {
      const parameterIds = store.state.endpoints._[props.endpointKey]?.parameters || [];
      const parametersData: any[] = [];

      parameterIds.forEach((parameterID: string) => {
        const parameterData = store.state.endpointParameters._[parameterID];
        if (parameterData) {
          // Clonamos para no mutar directamente el estado si es reactivo
          const dataCopy = { ...parameterData, parameterID };
          parametersData.push(dataCopy);
        }
      });
      
      return parametersData.filter(
        (param: any) => param != null && param.name != null && !param.name.includes('$'),
      );
    });

    // Getter: operation
    const operation = computed(() => store.state.endpoints._[props.endpointKey]?.operation || '');

    // Getter: entity
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
