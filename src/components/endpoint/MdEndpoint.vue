<template lang="pug">
.c-endpoint.mb-2(
  :class="[`c-resource__item--${operation}`]"
)
  .c-resource__item(
    :class="classResourceItem"
    v-b-toggle="`${collapseId}`"
    @click="status = !status"
    )
    .d-flex.justify-content-between.align-items-center
      div
        span.c-resource__method {{ operation }}
        span.c-resource__endpoint {{ fullMapping }}
        span.c-resource__info {{ info }}
      div
        i(v-if="!status").fal.fa-chevron-down.mr-3.font-weight-bold.cursor-pointer
        i(v-else).fal.fa-chevron-up.mr-3.font-weight-bold.cursor-pointer
  b-collapse(:id="`${collapseId}`")
    md-endpoint-details(
      :endpoint-key="endpointKey"
      :fullMapping="fullMapping"
      :mapping="mapping"
      :controllerSource="controllerSource"
      :baseEntity="baseEntity"
      :entityAttributes="entityAttributes"
      :isPagedResource="isPagedResource"
      :controllerKey="controllerKey"
      :baseTable="baseTable"
      :baseTableSchema="baseTableSchema"
      :foreignKeysAttributes="foreignKeysAttributes"
      )
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';
import MdEndpointDetails from '@/components/endpoint/MdEndpointDetails.vue';

export default defineComponent({
  name: 'MdEndpoint',
  components: {
    MdEndpointDetails,
  },
  props: {
    endpointKey: { type: String, required: true },
    controllerSource: { type: String, required: true },
    controllerRequestMapping: { type: String, required: true },
    baseEntity: { type: String, default: '' },
    entityAttributes: { type: Array, default: () => [] },
    controllerKey: { type: String, required: true },
    baseTable: { type: String, default: '' },
    baseTableSchema: { type: String, default: '' },
    foreignKeysAttributes: { type: Array, required: true },
  },
  setup(props) {
    const store = useStore();
    
    // Estado (Data)
    const status = ref(false);
    const info = ref('');

    // Auxiliar para no repetir código de Vuex
    const endpointData = computed(() => store.getters['endpoints/getEndpointByKey'](props.endpointKey));

    // Computadas
    const operation = computed(() => endpointData.value?.operation || '');

    const mapping = computed(() => endpointData.value?.mapping || '');

    const fullMapping = computed(() => {
      const normalize = (val: string) => (val && val.endsWith('/') ? val.slice(0, -1) : val);

      if (props.controllerRequestMapping !== null && props.controllerRequestMapping.includes('{')) {
        if (mapping.value.includes('{')) {
          const numOfIdsOfMapping = (mapping.value.match(/{/g) || []).length;
          const numOfIdsOfBaseMapping = (props.controllerRequestMapping.match(/{/g) || []).length;

          if (numOfIdsOfMapping > numOfIdsOfBaseMapping || (mapping.value.includes('/get') && !props.controllerRequestMapping.includes('/get'))) {
            const controllerRequestMappingParts = props.controllerRequestMapping.split('/').filter((e) => e !== '');
            const mappingParts = mapping.value.split('/').filter((e: string) => e !== '');
            const notCoincidentParts = [];
            
            for (let i = 0; i < Math.min(controllerRequestMappingParts.length, mappingParts.length); i += 1) {
              if (controllerRequestMappingParts[i] !== mappingParts[i]) {
                notCoincidentParts.push(controllerRequestMappingParts[i]);
              } else if (controllerRequestMappingParts[i] !== '') {
                break;
              }
            }
            return normalize(`/${notCoincidentParts.concat(mappingParts).join('/')}`);
          }
        }
        return normalize(`${props.controllerRequestMapping}`);
      }
      return normalize(`${props.controllerRequestMapping}${mapping.value}`);
    });

    const classResourceItem = computed(() => {
      const classes = [`c-resource__item--${operation.value.toLowerCase()}`];
      if (status.value) classes.push('c-resource__item--opened');
      return classes;
    });

    const collapseId = computed(() => `collapse-${operation.value}-${fullMapping.value}`.toLowerCase());

    const isPagedResource = computed(() => {
      const endpoint = endpointData.value;
      if (endpoint && endpoint.responseData?.attributes?.length === 1) {
        const attributeKey = endpoint.responseData.attributes[0];
        const attr = store.state.endpointAttributes._[attributeKey];
        return attr?.type === 'Array' ? attr : false;
      }
      return false;
    });

    return {
      status,
      info,
      operation,
      mapping,
      fullMapping,
      classResourceItem,
      collapseId,
      isPagedResource,
    };
  },
});
</script>
