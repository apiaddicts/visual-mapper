<template lang="pug">
  div
    md-endpoint-section(
      :title="attributes && attributes.length > 0 ? $t('endpointAttribute.responseHeader') : $t('endpointAttribute.responseFileHeader')"
      :entity="entity"
    )
      md-endpoint-attributes-table(
        v-if="attributes && attributes.length > 0"
        :attribute-keys="attributes"
        :entity="entity"
        :operation="operation"
        :mapping="mapping"
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
      div(v-else).alert.alert-info {{ $t('endpointAttribute.responseFile') }}
    div(style="padding-top: 20px")
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import MdEndpointSection from '@/components/endpoint/MdEndpointSection.vue';
import MdEndpointAttributesTable from '@/components/endpoint/MdEndpointAttributesTable.vue';
import { EndpointStoreObject } from '@/store/endpoints/state';

export default defineComponent({
  name: 'MdEndpointDetailsResponse',
  components: {
    MdEndpointSection,
    MdEndpointAttributesTable,
  },
  props: {
    endpointKey: { type: String, required: true },
    mapping: { type: String, default: '' },
    controllerSource: { type: String, default: '' },
    baseEntity: { type: String, default: '' },
    entityAttributes: { type: Array as () => any[], default: () => [] },
    isPagedResource: { type: Boolean, default: false },
    baseTable: { type: String, default: '' },
    baseTableSchema: { type: String, default: '' },
    foreignKeysAttributes: { type: Array as () => any[], default: () => [] },
    controllerKey: { type: String, default: '' },
  },
  setup(props) {
    const store = useStore();

    // Reemplazo de Getter: attributes
    const attributes = computed<string[]>(() => store.getters['endpoints/getEndpointResponseDataAttributesByEndpointKey'](props.endpointKey));

    // Reemplazo de Getter: entity
    const entity = computed(() => {
      const endpoint = store.state.endpoints._[props.endpointKey];
      if (endpoint?.responseData?.entity || endpoint?.entity) {
        return (endpoint.responseData?.entity || endpoint.entity).toLowerCase();
      }
      return '';
    });

    // Reemplazo de Getter: isView (con Optional Chaining para evitar errores de undefined)
    const isView = computed(() => {
      const endpoint: EndpointStoreObject | undefined = store.getters['endpoints/getEndpointByKey'](props.endpointKey);

      if (endpoint?.entity) {
        return store.state.entities._[endpoint.entity.toLowerCase()]?.is_view || false;
      }
      if (endpoint?.requestBody?.entity) {
        return store.state.entities._[endpoint.requestBody.entity.toLowerCase()]?.is_view || false;
      }
      if (endpoint?.responseData?.entity) {
        return store.state.entities._[endpoint.responseData.entity.toLowerCase()]?.is_view || false;
      }
      return false;
    });

    // Reemplazo de Getter: operation
    const operation = computed(() => store.getters['endpoints/getEndpointOperationByEndpointKey'](props.endpointKey));

    return {
      attributes,
      entity,
      isView,
      operation,
    };
  },
});
</script>
