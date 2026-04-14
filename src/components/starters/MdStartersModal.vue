<template lang="pug">
    b-modal(v-model="visible" :centered="true" size="lg" title="Seleccione los starters de la aplicación" hide-footer)
        MdStartersItem(:id="starter.id"
                       v-for="(starter, index) in starters"
                       :title="starter.title"
                       v-bind:key="index"
                       :description="starter.description"
                       :inModal="true"
                       :selected="starter.selected")
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, onMounted, inject, getCurrentInstance } from 'vue';
import { useStore } from 'vuex';
import startersList from './starters-list.js';
import MdStartersItem from './MdStartersItem.vue';

export default defineComponent({
  name: 'MdStartersModal',
  components: {
    MdStartersItem,
  },
  setup() {
    const store = useStore();
    const visible = ref(false);
    const starters = ref<any[]>(startersList);
    const emitter: any = inject('emitter');

    onMounted(() => {
      for (const starterIndex in starters.value) {
        const starter = starters.value[starterIndex];
        if (starter.selected === true) {
          store.commit('applicationStore/ADD_STARTER', starter.title);
        }
      }

      if (emitter) {
        emitter.on('starters-modal', (event: boolean) => {
          visible.value = event;
        });

        emitter.on('starters-modal-selection', (event: any) => {
          if (event.state === true) {
            store.commit('applicationStore/ADD_STARTER', event.title);
          } else {
            store.commit('applicationStore/REMOVE_STARTER', event.title);
          }

          for (const starterIndex in starters.value) {
            if (starters.value[starterIndex].title === event.title) {
              starters.value[starterIndex].selected = event.state;
            }
          }
        });
      }
    });

    return {
      visible,
      starters,
    };
  },
});
</script>
