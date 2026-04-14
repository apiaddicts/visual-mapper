<template lang="pug">
  .pt-0.d-flex.flex-column(
    :class="{ 'p-3': header, 'px-3': !header }"
  )
    div
      div(v-if="isView").alert.alert-warning 
        div {{ $t('endpointAttribute.viewNote') }}
      b-row
        b-col(cols="3")
          .px-2.py-1.color-white.small.text-center(:class="[ `c-endpoint--${operation}` ]")
            span {{ $t('endpointAttributesTable.entity') }} {{ isSwagger ? baseEntity : entity }}
        b-col(cols="1")
        b-col
          .px-2.py-1.color-white.small.text-center(:class="[ `c-endpoint--${operation}` ]")
            span {{ $t('endpointAttributesTable.api_controller') }}

      b-row.d-flex.align-items-center
        b-col(cols="1" v-if="isView")
          .px-2.py-1.small.text-center
            span {{ $t('endpointAttributesTable.primaryKey') }}
        b-col(cols="3")
          .px-2.py-1.small.text-center
            span {{ $t('endpointAttributesTable.name') }} : {{ $t('endpointAttributesTable.type') }}
        b-col.d-flex.align-items-center.justify-content-center(cols="1")
          .px-2.py-1.small.text-center
            span {{ (this.controllerSource !== 'swagger' && this.controllerSource !== 'asyncapi') ? $t('endpointAttributesTable.active') : ''}}
        b-col(cols="2")
          .px-2.py-1.small.text-center
            span {{ $t('endpointAttributesTable.name') }}
        b-col(cols="2")
          .px-2.py-1.small.text-center
            span {{ $t('endpointAttributesTable.type') + (isSwagger ? $t('endpointAttributesTable.swaggerType') : '')}}
        b-col(cols="2")
          .px-2.py-1.small.text-center
            span {{ $t('endpointAttributesTable.validations') }}
        b-col(v-if="controllerSource !== 'asyncapi'" cols="1")
          .px-2.py-1.small.text-center
            span {{ $t('endpointAttributesTable.anonymization') }}
    
    template(v-for="ak in attributeKeys")
      md-endpoint-attribute.mt-3(
        v-if="attributeKeys.length == 1"
        :attribute-key="ak"
        :entity="entity"
        :operation="operation"
        :mapping="mapping"
        :validationsEnabled="validationsEnabled"
        :controllerSource="controllerSource"
        :baseEntity="baseEntity"
        :entityAttributes="entityAttributes"
        :isPagedResource="isPagedResource"
        :isFirstChild="true"
        :isView="isView"
        :baseTable="baseTable"
        :baseTableSchema="baseTableSchema"
        :disabled="false"
        :foreignKeysAttributes="foreignKeysAttributes"
        :controllerKey="controllerKey"
        :endpointKey="endpointKey"
      )
      md-endpoint-attribute.mt-3(
        v-else
        :attribute-key="ak"
        :entity="entity"
        :operation="operation"
        :mapping="mapping"
        :validationsEnabled="validationsEnabled"
        :controllerSource="controllerSource"
        :baseEntity="baseEntity"
        :entityAttributes="entityAttributes"
        :isPagedResource="isPagedResource"
        :isFirstChild="false"
        :isView="isView"
        :baseTable="baseTable"
        :baseTableSchema="baseTableSchema"
        :disabled="false"
        :foreignKeysAttributes="foreignKeysAttributes"
        :controllerKey="controllerKey"
        :endpointKey="endpointKey"
      )
</template>
<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import MdEndpointAttribute from '@/components/endpoint/MdEndpointAttribute.vue';

export default defineComponent({
  name: 'MdEndpointAttributesTable',
  components: {
    MdEndpointAttribute,
  },
  props: {
    header: { type: Boolean, default: false },
    attributeKeys: { type: Array as () => string[], default: () => [] },
    entity: { type: String, default: '' },
    operation: { type: String, default: '' },
    controllerSource: { type: String, default: '' },
    baseEntity: { type: String, default: '' },
    entityAttributes: { type: Array as () => any[], default: () => [] },
    mapping: { type: String, default: '' },
    isPagedResource: { type: Boolean, default: false },
    isView: { type: Boolean, default: false },
    baseTable: { type: String, default: '' },
    baseTableSchema: { type: String, default: '' },
    foreignKeysAttributes: { type: Array as () => any[], default: () => [] },
    controllerKey: { type: String, default: '' },
    endpointKey: { type: String, default: '' },
  },
  setup(props) {
    // Inicialización de data como ref
    const validationsEnabled = ref(false);

    // Propiedad computada
    const isSwagger = computed(() => props.controllerSource === 'swagger' || props.controllerSource === 'asyncapi');

    return {
      validationsEnabled,
      isSwagger,
    };
  },
});
</script>
