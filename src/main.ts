import { createApp } from 'vue';
import BootstrapVue3, { vBTooltip, vBToggle } from 'bootstrap-vue-3';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import '@vueform/multiselect/themes/default.css';

import ToastService from '@/services/toast.service'; // eslint-disable-line import/no-named-as-default
import ConfigGenApiService from '@/services/config-gen-api.service';
import ProjectGenApiService from '@/services/project-gen-api.service';
import FilesService from '@/services/files.service'; // eslint-disable-line import/no-named-as-default
import JapiPluralUtilsService from '@/services/japi-plural-utils.service'; // eslint-disable-line import/no-named-as-default
import ArchetypeDataValidationService from '@/services/archetype-data-validation-service';
import DbExplorerApiPlugin from '@/services/db-explorer-api.service';
import store from './store';
import router from './router';
import i18n from './i18n';
import App from './App.vue';

const app = createApp(App);

app.use(store);
app.use(router);
app.use(i18n);
app.use(BootstrapVue3);

app.directive('b-tooltip', vBTooltip);
app.directive('b-toggle', vBToggle);

/* eslint-disable */
app.provide('$bvModal', {
  show: (id: string) => console.warn(`$bvModal.show('${id}') - usar v-model en su lugar`),
  hide: (id: string) => console.warn(`$bvModal.hide('${id}') - usar v-model en su lugar`),
});
/* eslint-enable */

app.use(ToastService);
app.use(FilesService);
app.use(JapiPluralUtilsService);
app.use(ConfigGenApiService);
app.use(ProjectGenApiService);
app.use(ArchetypeDataValidationService);
app.use(DbExplorerApiPlugin);

app.mount('#app');

export default app;
