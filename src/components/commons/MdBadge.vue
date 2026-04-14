<template lang="pug">
    b-badge(:id="uuid" :variant="variant" style="margin-right: 5px") {{text}}
        b-button(@click="removeElement" :variant="variant" style="font-size: 12px; padding: 4px !important; margin-left: 8px" :disabled="isConnected")
            i.fas.fa-times
</template>
<script lang="ts">
/* eslint-disable */
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'MdBadge',
  props: {
    text: {
      type: String,
      required: true,
    },
    uuid: {
      type: String,
      required: true,
    },
    variant: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    onRemove: {
      type: Function,
      required: false,
    },
  },
  emits: ['remove'],
  setup(props, { emit }) {
    const store = useStore();

    const isConnected = computed(() => store.state.connectionStore.is_connected);

    const removeElement = () => {
      // Call the onRemove callback if provided
      if (props.onRemove) {
        props.onRemove(props.text);
      }

      // Emit event for parent
      emit('remove', props.text);

      // Remove the element from the DOM
      const element = document.getElementById(props.uuid);

      if (element != null && element.parentNode != null) {
        element.parentNode.removeChild(element);
      }
    };

    return {
      isConnected,
      removeElement,
    };
  },
});
</script>
