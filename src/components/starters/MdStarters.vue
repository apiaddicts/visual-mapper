<template lang="pug">
    div.border.bg-white.p-4
        h2.l-title.mb-2 {{ $t('application.starters.title') }}
            b-button(
                    variant="link"
                    v-b-tooltip.hover.bottomleft.html="$t('application.starters.info')"
                    tabindex="-1"
                )
                    i.fas.fa-info-question(style="color: red")
        div
          div
            div
              | Opciones de configuración por defecto
              b-button(
                        variant="link"
                        v-b-tooltip.hover.bottomleft.html="$t('application.starters.default')"
                        tabindex="-1"
                    )
                        i.fas.fa-info-question(style="color: red")
            b-button(@click="setStartersForAPIREST").bg-brand.mr-3.mb-2 API REST
            b-button(@click="setStartersForAPIRESTWithoutDB").bg-brand.mr-3.mb-2 API REST sin base de datos
            b-button(@click="setStartersForAPIRESTWithKafkaWithDB").bg-brand.mr-3.mb-2 API REST y asíncrona
            b-button(@click="setStartersForAPIRESTWithKafkaWithoutDB").bg-brand.mr-3.mb-2 API REST y asíncrona sin base de datos
            b-button(@click="setStartersForAsyncAPI").bg-brand.mr-3.mb-2 API asíncrona
            b-button(@click="setStartersForAsyncAPIWithDB").bg-brand.mb-2 API asíncrona con base de datos
          div.mb-4
            b-button(@click="showModal").bg-brand.mt-4
              i(style="margin-right: 4px; margin-left: 4px").far.fa-edit
        div(v-if="includedStarters < 1").d-flex.border-top
            div(style="margin-top: 10px") {{$t('application.starters.non_included')}}
        div(v-else).d-flex
            div(id="starters-container" style="width: 100% !important")
              MdStartersItem(:id="starter.id" 
                             v-for="(starter, index) in startersObject" 
                             :title="starter.title" 
                             v-bind:key="index" 
                             :description="starter.description" 
                             :inModal="false"
                             :selected="starter.selected")
        MdStartersModal
                
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import mitt from 'mitt';
import MdStartersItem from './MdStartersItem.vue';
import MdStartersModal from './MdStartersModal.vue';
import startersList from './starters-list.js';

export const emitter = mitt();

export default defineComponent({
  components: {
    MdStartersModal,
    MdStartersItem,
  },
  setup(props, { emit }) {
    const store = useStore();
    const includedStarters = ref(0);
    const startersObject = ref(startersList);

    onMounted(() => {
      includedStarters.value = startersObject.value.filter((starter) => starter.selected === true).length;

      store.commit('applicationStore/SET_STARTERS_OBJECT', startersObject.value);

      emitter.on('starters-modal-selection', (event: any) => {
        includedStarters.value = startersObject.value.filter((starter) => starter.selected === true).length;

        let eventIndex = -1;
        for (let i = 0; i < startersObject.value.length; i += 1) {
          if (event.title === startersObject.value[i].title) {
            eventIndex = i;
            break;
          }
        }

        if (event.state === true) {
          if (eventIndex !== -1) {
            const modifiedStarter = startersObject.value[eventIndex];
            modifiedStarter.selected = true;
            startersObject.value[eventIndex] = modifiedStarter;
            store.commit('applicationStore/ADD_STARTER', event.title);
          }
        }
        else if (eventIndex !== -1) {
          const modifiedStarter = startersObject.value[eventIndex];
          modifiedStarter.selected = false;
          startersObject.value[eventIndex] = modifiedStarter;
          store.commit('applicationStore/REMOVE_STARTER', event.title);
        }

        store.commit('applicationStore/SET_STARTERS_OBJECT', startersObject.value);
      });
    });

    const showModal = () => {
      emit('starters-modal', true);
    };

    const setStartersForAsyncAPI = () => {
      const startersCopy = startersObject.value.slice();

      for (let i = 0; i < startersCopy.length; i += 1) {
        const starter = startersCopy[i];

        if (starter.title === 'japi-starter-kafka') {
          starter.selected = true;
        }
        else {
          starter.selected = false;
        }

        startersCopy[i] = starter;
      }

      startersObject.value.splice(0, startersObject.value.length, ...startersCopy);
      const selectedStarters = startersCopy.filter((value) => value.selected === true).map((value) => value.title);
      includedStarters.value = selectedStarters.length;

      store.commit('applicationStore/SET_STARTERS', selectedStarters);

      store.commit('applicationStore/SET_DB_USAGE', false);

      // Se elimina la información de la base de datos para evitar que pueda quedar en la store
      store.dispatch('connectionStore/clearData');
    };

    const setStartersForAsyncAPIWithDB = () => {
      const startersCopy = startersObject.value.slice();

      for (let i = 0; i < startersCopy.length; i += 1) {
        const starter = startersCopy[i];

        if (starter.title === 'japi-starter-hikari' || starter.title === 'japi-starter-seguridad' || starter.title === 'japi-starter-kafka') {
          starter.selected = true;
        }
        else {
          starter.selected = false;
        }

        startersCopy[i] = starter;
      }

      startersObject.value.splice(0, startersObject.value.length, ...startersCopy);
      const selectedStarters = startersCopy.filter((value) => value.selected === true).map((value) => value.title);
      includedStarters.value = selectedStarters.length;

      store.commit('applicationStore/SET_STARTERS', selectedStarters);

      store.commit('applicationStore/SET_DB_USAGE', true);
    };

    const setStartersForAPIREST = () => {
      const startersCopy = startersObject.value.slice();

      for (let i = 0; i < startersCopy.length; i += 1) {
        const starter = startersCopy[i];

        if (starter.title === 'japi-starter-hikari' || starter.title === 'japi-starter-seguridad' || starter.title === 'japi-starter-openapi' || starter.title === 'japi-starter-test') {
          starter.selected = true;
        }
        else {
          starter.selected = false;
        }

        startersCopy[i] = starter;
      }

      startersObject.value.splice(0, startersObject.value.length, ...startersCopy);
      const selectedStarters = startersCopy.filter((value) => value.selected === true).map((value) => value.title);
      includedStarters.value = selectedStarters.length;

      store.commit('applicationStore/SET_STARTERS', selectedStarters);

      store.commit('applicationStore/SET_DB_USAGE', true);
    };

    const setStartersForAPIRESTWithoutDB = () => {
      const startersCopy = startersObject.value.slice();

      for (let i = 0; i < startersCopy.length; i += 1) {
        const starter = startersCopy[i];

        if (starter.title === 'japi-starter-h2mem' || starter.title === 'japi-starter-seguridad' || starter.title === 'japi-starter-openapi' || starter.title === 'japi-starter-test') {
          starter.selected = true;
        }
        else {
          starter.selected = false;
        }

        startersCopy[i] = starter;
      }

      startersObject.value.splice(0, startersObject.value.length, ...startersCopy);
      const selectedStarters = startersCopy.filter((value) => value.selected === true).map((value) => value.title);
      includedStarters.value = selectedStarters.length;

      store.commit('applicationStore/SET_STARTERS', selectedStarters);

      store.commit('applicationStore/SET_DB_USAGE', false);

      // Se elimina la información de la base de datos para evitar que pueda quedar en la store
      store.dispatch('connectionStore/clearData');
    };

    const setStartersForAPIRESTWithKafkaWithDB = () => {
      const startersCopy = startersObject.value.slice();

      for (let i = 0; i < startersCopy.length; i += 1) {
        const starter = startersCopy[i];

        if (starter.title === 'japi-starter-hikari' || starter.title === 'japi-starter-seguridad' || starter.title === 'japi-starter-openapi' || starter.title === 'japi-starter-kafka' || starter.title === 'japi-starter-test') {
          starter.selected = true;
        }
        else {
          starter.selected = false;
        }

        startersCopy[i] = starter;
      }

      startersObject.value.splice(0, startersObject.value.length, ...startersCopy);
      const selectedStarters = startersCopy.filter((value) => value.selected === true).map((value) => value.title);
      includedStarters.value = selectedStarters.length;

      store.commit('applicationStore/SET_STARTERS', selectedStarters);

      store.commit('applicationStore/SET_DB_USAGE', true);
    };

    const setStartersForAPIRESTWithKafkaWithoutDB = () => {
      const startersCopy = startersObject.value.slice();

      for (let i = 0; i < startersCopy.length; i += 1) {
        const starter = startersCopy[i];

        if (starter.title === 'japi-starter-h2mem' || starter.title === 'japi-starter-seguridad' || starter.title === 'japi-starter-openapi' || starter.title === 'japi-starter-kafka' || starter.title === 'japi-starter-test') {
          starter.selected = true;
        }
        else {
          starter.selected = false;
        }

        startersCopy[i] = starter;
      }

      startersObject.value.splice(0, startersObject.value.length, ...startersCopy);
      const selectedStarters = startersCopy.filter((value) => value.selected === true).map((value) => value.title);
      includedStarters.value = selectedStarters.length;

      store.commit('applicationStore/SET_STARTERS', selectedStarters);

      store.commit('applicationStore/SET_DB_USAGE', false);

      // Se elimina la información de la base de datos para evitar que pueda quedar en la store
      store.dispatch('connectionStore/clearData');
    };

    return {
      includedStarters,
      startersObject,
      showModal,
      setStartersForAPIREST,
      setStartersForAPIRESTWithoutDB,
      setStartersForAPIRESTWithKafkaWithDB,
      setStartersForAPIRESTWithKafkaWithoutDB,
      setStartersForAsyncAPI,
      setStartersForAsyncAPIWithDB,
    };
  },
});
</script>
