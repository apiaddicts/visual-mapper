<template lang="pug">
.l-header
  .container-fluid
    .row.justify-content-center
      .col-md-12
        .d-flex.justify-content-between.align-items-center
          .color-white.font-weight-bold
            span {{ $t('header.title') }}
            template(v-if="!isProduction")
              b-badge.environment-badge(variant="warning") {{ environment }}
          img(src="@/assets/logo_opendataspace.svg" height="42")
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'MdHeader',
  setup() {
    const store = useStore();

    // Transformamos los "getters" de la clase en propiedades computadas
    const environment = computed(() => store.state.environment);

    const isProduction = computed(() => store.getters.isProduction);

    // Todo lo que el template necesite debe ser retornado aquí
    return {
      environment,
      isProduction,
    };
  },
});
</script>
