<template lang="pug">
div
  .p-dashboard
    .container-fluid
      .row
        .col-md-2(v-if="!collapsed()")
          ul.p-dashboard__menu
            li(
              :class="{ active: itemActive === '.js-application' }"
              @click="scrollTo('.js-application')"
              ) {{ $t('menu.application') }}
            li(
              :class="{ active: itemActive === '.js-connection' }"
              @click="scrollTo('.js-connection')"
              ) {{ $t('menu.connection') }}
            li(v-if="openApiDefinitionExists"
              :class="{ active: itemActive === '.js-resources' }"
              @click="scrollTo('.js-resources')"
              ) {{ $t('menu.resources') }}
            ol.p-dashboard__submenu
              template(v-for="controller in controllers" :key="controller")
                li(v-if="controller !== 'StatusController' && controller !== 'FilesController' && controller !== 'FilesFileIdController' && controller !== 'UserInfoController' && controller !== 'UsersInfoMeController'")
                  span(
                    @click="scrollTo(`.js-controller-${controllerName(controller)}`)")
                      | {{controllerName(controller)}}
            li(v-if="asyncApiDefinitionObjectExists"
              :class="{ active: itemActive === '.js-asyncapi' }"
              @click="scrollTo('.js-asyncapi')"
              ) {{  $t('menu.asyncapi') }}

        .col-md-10(v-if="!collapsed()")
          md-application.mt-2.mb-4.js-application
          md-connection.mb-4.js-connection
          div(v-if="existsTablesWithoutPK").alert.alert-warning
            div(style="display: flex")
              i.fas.fa-exclamation-triangle.mt-2.mr-2
              div.mt-1.ml-2 {{ tablesWithoutPK != null && totalOfTables != null ? getNumberOftablesLabel($t('dashboard.tablesWithoutPKLabel'), tablesWithoutPK.length) : $t('dashboard.tablesWithoutPKLabelWithoutNumberOfTables') }}
            div(v-for="tableWithoutPK in tablesWithoutPK")
              div(style="margin-left: 4rem !important; margin-top: 1rem !important;").bold {{`${tableWithoutPK.owner} - ${tableWithoutPK.table}`}}
          md-resources.mb-4.js-resources
        .col-md-12(v-else)
          md-application.mt-2.mb-4.js-application
          md-connection.mb-4.js-connection
          div(v-if="existsTablesWithoutPK").alert.alert-warning
            div(style="display: flex")
              i.fas.fa-exclamation-triangle.mt-2.mr-2
              div.mt-1.ml-2 {{ tablesWithoutPK != null && totalOfTables != null ? getNumberOftablesLabel($t('dashboard.tablesWithoutPKLabel'), tablesWithoutPK.length) : $t('dashboard.tablesWithoutPKLabelWithoutNumberOfTables') }}
            div(v-for="tableWithoutPK in tablesWithoutPK")
              div(style="margin-left: 4rem !important; margin-top: 1rem !important;").bold {{`${tableWithoutPK.owner} - ${tableWithoutPK.table}`}}
          md-resources.mb-4.js-resources
</template>

<script lang="ts">
/* eslint-disable max-len */

import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';
import VueScrollTo from 'vue-scrollto';

import MdApplication from '@/components/MdApplication.vue';
import MdConnection from '@/components/MdConnection.vue';
import MdResources from '@/components/MdResources.vue';
import MdModal from '@/components/commons/MdModal.vue';

export default defineComponent({
  name: 'AppDashboard',
  components: {
    MdApplication,
    MdConnection,
    MdResources,
    MdModal,
  },
  setup() {
    const store = useStore();
    const itemActive = ref('.js-application');

    const scrollTo = (point: string) => {
      const options = {
        offset: -115,
        onStart: () => {
          itemActive.value = point;
        },
      };
      VueScrollTo.scrollTo(point, 1000, options);
    };

    const controllers = computed(() => store.state.controllers.list);

    const controllerName = (controller: string): string => store.state.controllers._[controller].name;

    const collapsed = (): boolean => store.state.applicationStore.collapsed === true;

    const tablesWithoutPK = computed(() => store.getters['entities/getTablesWithoutPK']);

    const existsTablesWithoutPK = computed(() => tablesWithoutPK.value.length > 0);

    const totalOfTables = computed(() => store.getters['entities/getTotalOfTables']);

    const getNumberOftablesLabel = (textToReplace: string, numberOfTablesWithoutPK: number): string => {
      if (totalOfTables.value != null) {
        return textToReplace.replace('%replace1%', `${numberOfTablesWithoutPK}`).replace('%replace2%', `${totalOfTables.value}`);
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this.$t('dashboard.tablesWithoutPKLabelWithoutNumberOfTables') as string;
    };

    const asyncApiDefinitionObjectExists = computed(() => store.state.async_api_definition_object !== undefined 
           && store.state.async_api_definition_object !== null 
           && Object.keys(store.state.async_api_definition_object).length > 0);

    const openApiDefinitionExists = computed(() => store.state.api_definition !== undefined && store.state.api_definition !== '');

    return {
      itemActive,
      scrollTo,
      controllers,
      controllerName,
      collapsed,
      existsTablesWithoutPK,
      tablesWithoutPK,
      totalOfTables,
      getNumberOftablesLabel,
      asyncApiDefinitionObjectExists,
      openApiDefinitionExists,
    };
  },
});
</script>
