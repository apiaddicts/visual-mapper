<template lang="pug">
  .c-endpoint--parameter
    b-row.d-flex.align-items-center(v-if="!haveDollarInName")
      b-col
        b-form-input(size="sm" :value="name" readonly)
      b-col
        b-form-input(size="sm" :value="parameterIn" readonly)
      b-col
        b-form-input(size="sm" :value="type" readonly)
      b-col
        b-form-input(size="sm" :value="format" readonly)
      b-col
        b-form-input(size="sm" :value="defaultValue" readonly)
      b-col
        b-form-input(size="sm" :value="minValue" readonly)
      b-col
        b-form-input(size="sm" :value="maxValue" readonly)
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'MdEndpointParameter',
  props: {
    parameterKey: { type: String, required: true },
  },
  setup(props) {
    const store = useStore();

    const parameter = computed(() => store.state.endpointParameters._[props.parameterKey]);

    const name = computed(() => parameter.value?.name);
    const parameterIn = computed(() => parameter.value?.in);
    const type = computed(() => parameter.value?.type);
    const format = computed(() => parameter.value?.format);
    const defaultValue = computed(() => parameter.value?.defaultValue);
    const minValue = computed(() => parameter.value?.minValue);
    const maxValue = computed(() => parameter.value?.maxValue);

    const haveDollarInName = computed(() => name.value?.charAt(0) === '$');

    return {
      name,
      parameterIn,
      type,
      format,
      defaultValue,
      minValue,
      maxValue,
      haveDollarInName,
    };
  },
});
</script>
