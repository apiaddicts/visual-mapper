<template lang="pug">
  .c-endpoint-details
    md-endpoint-details-parameters(
      :endpoint-key="endpointKey"
      :controllerSource="controllerSource"
      :baseEntity="baseEntity"
      :isPagedResource="isPagedResource"
      :foreignKeysAttributes="foreignKeysAttributes"
      )
    template(v-if="showBodyMappingSection")
      md-endpoint-details-body(
        :endpoint-key="endpointKey"
        :controllerSource="controllerSource"
        :includesGet="fullMapping.includes('/get')"
        :baseEntity="baseEntity"
        :entityAttributes="entityAttributes"
        :isPagedResource="isPagedResource"
        :baseTable="baseTable"
        :baseTableSchema="baseTableSchema"
        :foreignKeysAttributes="foreignKeysAttributes"
        :controllerKey="controllerKey"
        )
    template(v-if="showRequestMappingSection")
      md-endpoint-details-response(
        :endpoint-key="endpointKey"
        :mapping="mapping"
        :controllerSource="controllerSource"
        :baseEntity="baseEntity"
        :entityAttributes="entityAttributes"
        :isPagedResource="isPagedResource"
        :baseTable="baseTable"
        :baseTableSchema="baseTableSchema"
        :foreignKeysAttributes="foreignKeysAttributes"
        :controllerKey="controllerKey"
        )

</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import MdEndpointDetailsInfo from '@/components/endpoint/MdEndpointDetailsInfo.vue';
import MdEndpointDetailsBody from '@/components/endpoint/MdEndpointDetailsBody.vue';
import MdEndpointDetailsParameters from '@/components/endpoint/MdEndpointDetailsParameters.vue';
import MdEndpointDetailsResponse from '@/components/endpoint/MdEndpointDetailsResponse.vue';

export default defineComponent({
  name: 'MdEndpointDetails',
  components: {
    MdEndpointDetailsInfo,
    MdEndpointDetailsBody,
    MdEndpointDetailsParameters,
    MdEndpointDetailsResponse,
  },
  props: {
    endpointKey: { type: String, required: true },
    mapping: { type: String, default: '' },
    fullMapping: { type: String, default: '' },
    controllerSource: { type: String, default: '' },
    baseEntity: { type: String, default: '' },
    entityAttributes: { type: Array as () => any[], default: () => [] },
    isPagedResource: { type: [Boolean, Object], default: false },
    baseTable: { type: String, default: '' },
    baseTableSchema: { type: String, default: '' },
    foreignKeysAttributes: { type: Array as () => any[], default: () => [] },
    controllerKey: { type: String, default: '' },
  },
  setup(props) {
    const store = useStore();

    // Reemplazo de isSwagger
    const isSwagger = computed(() => props.controllerSource === 'swagger' || props.controllerSource === 'asyncapi');

    // Reemplazo de operation
    const operation = computed(() => {
      const endpoint = store.getters['endpoints/getEndpointByKey'](props.endpointKey);
      return endpoint?.operation || '';
    });

    // Reemplazo de showBodyMappingSection
    // SEND/RECEIVE de AsyncAPI tienen payload (equivalente a body)
    const showBodyMappingSection = computed(() => ['POST', 'PUT', 'PATCH', 'DELETE', 'SEND', 'RECEIVE'].includes(operation.value));

    // Reemplazo de showRequestMappingSection
    const showRequestMappingSection = computed(() => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'SEND', 'RECEIVE'].includes(operation.value));

    return {
      isSwagger,
      operation,
      showBodyMappingSection,
      showRequestMappingSection,
    };
  },
});
</script>
