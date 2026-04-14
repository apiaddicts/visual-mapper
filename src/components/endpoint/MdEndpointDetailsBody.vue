<template lang="pug">
  div
    md-endpoint-section(
      v-if="attributes && attributes.length > 0"
      title="Cuerpo de la petición"
      :entity="entity"
    ).mb-3
      .alert.alert-info(v-if="includesGet") Parámetros estándar del body: $filter
      md-endpoint-attributes-table(
        v-else
        :attribute-keys="attributes"
        :entity="entity"
        :operation="operation"
        :validationsEnabled="true"
        :controllerSource="controllerSource"
        :baseEntity="baseEntity"
        :entityAttributes="entityAttributes"
        :isPagedResource="isPagedResource"
        :isView="isView"
        :baseTable="baseTable"
        :baseTableSchema="baseTableSchema"
        :foreignKeysAttributes="foreignKeysAttributes"
        :controllerKey="controllerKey"
        :endpointKey="endpointKey"
        )
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import MdEndpointSection from '@/components/endpoint/MdEndpointSection.vue';
import MdEndpointAttributesTable from '@/components/endpoint/MdEndpointAttributesTable.vue';
import { EndpointStoreObject } from '@/store/endpoints/state';

export default defineComponent({
  name: 'MdEndpointDetailsBody',
  components: {
    MdEndpointSection,
    MdEndpointAttributesTable,
  },
  props: {
    endpointKey: { type: String, required: true },
    includesGet: { type: Boolean, default: false },
    baseEntity: { type: [Boolean, String], default: false },
    entityAttributes: { type: Array as () => any[], default: () => [] },
    isPagedResource: { type: [Boolean, Object], default: false },
    controllerSource: { type: String, default: '' },
    baseTable: { type: String, default: '' },
    baseTableSchema: { type: String, default: '' },
    foreignKeysAttributes: { type: Array as () => any[], default: () => [] },
    controllerKey: { type: String, default: '' },
  },
  setup(props) {
    const store = useStore();

    // Función auxiliar para obtener el endpoint del store
    const getEndpoint = (key: string): EndpointStoreObject | undefined => store.getters['endpoints/getEndpointByKey'](key);

    // Reemplazo de get attributes()
    const attributes = computed<string[]>(() => {
      const endpoint = getEndpoint(props.endpointKey);
      if (endpoint?.requestBody?.attributes) {
        return endpoint.requestBody.attributes;
      }
      return [];
    });

    // Reemplazo de get entity()
    const entity = computed(() => {
      const endpoint = getEndpoint(props.endpointKey);
      if (endpoint?.requestBody?.entity) {
        return endpoint.requestBody.entity.toLowerCase();
      }
      if (endpoint?.entity) {
        return endpoint.entity.toLowerCase();
      }
      return '';
    });

    // Reemplazo de get isView()
    const isView = computed(() => {
      const endpoint = getEndpoint(props.endpointKey);
      const entityName = endpoint?.requestBody?.entity || endpoint?.entity;
      
      if (entityName) {
        const entityKey = entityName.toLowerCase();
        return store.state.entities._[entityKey]?.isView || false;
      }
      return false;
    });

    // Reemplazo de get operation()
    const operation = computed(() => {
      const endpoint = getEndpoint(props.endpointKey);
      return endpoint?.operation || '';
    });

    return {
      attributes,
      entity,
      isView,
      operation,
    };
  },
});
</script>
