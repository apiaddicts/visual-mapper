<template lang="pug">
  .p-3.pt-0(
    v-if="parameterKeys && parameterKeys.length > 0"
  )
    div(v-if="!allNamesContainDollar")
      b-row.d-flex.align-items-center
        b-col
          .px-2.py-1.small.text-center
            span Nombre
        b-col.d-flex.align-items-center.justify-content-center
          .px-2.py-1.small.text-center
            span En
        b-col
          .px-2.py-1.small.text-center
            span Tipo
        b-col
          .px-2.py-1.small.text-center
            span Formato
        b-col
          .px-2.py-1.small.text-center
            span Default
        b-col
          .px-2.py-1.small.text-center
            span Valor máx.
        b-col
          .px-2.py-1.small.text-center
            span Valor mín.
      template(v-for="pk in parameterKeys" :key="pk")
        md-endpoint-parameter.mt-3(
          :parameter-key="pk"
          :foreignKeysAttributes="foreignKeysAttributes"
        )
    div(v-else)
      .row
        .alert.alert-info
          | Parámetros estándar de la URL: $init, $select, $exclude, $total, $expand, $limit

</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import MdEndpointParameter from '@/components/endpoint/MdEndpointParameter.vue';

export default defineComponent({
  name: 'MdEndpointAttributesTable',
  components: {
    MdEndpointParameter,
  },
  props: {
    parameterKeys: {
      type: Array as () => string[],
      default: () => [],
    },
    foreignKeysAttributes: {
      type: Array as () => any[],
      default: () => [],
    },
  },
  setup(props) {
    const store = useStore();

    const allNamesContainDollar = computed(() => {
      if (!props.parameterKeys || props.parameterKeys.length === 0) return false;
      return props.parameterKeys.every((key) => {
        const parameter = store.state.endpointParameters._[key];
        const name = parameter?.name;
        return name && name.charAt(0) === '$';
      });
    });

    return {
      allNamesContainDollar,
    };
  },
});
</script>
