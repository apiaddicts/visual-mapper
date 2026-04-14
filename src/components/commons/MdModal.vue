<template lang="pug">
  b-modal(
    :id="modalId"
    v-model="show"
    :title="title"
    :size="size"
    :centered="centered"
    :scrollable="scrollable"
    :hide-footer="hideFooter"
    :no-close-on-backdrop="noCloseOnBackdrop"
    @hidden="onHidden"
  )
    slot
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'MdModal',
  props: {
    modalId: {
      type: String,
      required: true,
    },
    modelValue: { // Prop para v-model
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'lg',
    },
    centered: {
      type: Boolean,
      default: true,
    },
    scrollable: {
      type: Boolean,
      default: true,
    },
    hideFooter: {
      type: Boolean,
      default: true,
    },
    noCloseOnBackdrop: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['hidden', 'update:modelValue'], // Evento para v-model
  setup(props, { emit }) {
    const show = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });

    const onHidden = () => {
      // Asegurarse de que el v-model se actualice al cerrar el modal por otros medios (ej. tecla ESC)
      show.value = false;
      emit('hidden');
    };

    return {
      show,
      onHidden,
    };
  },
});
</script>
