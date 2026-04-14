/* eslint-disable no-param-reassign */
import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios';
import ArchetypeDataValidationService from '@/services/archetype-data-validation-service';

const MadridDigitalLogicPlugin = {
  install(app: any) {
    app.use(BootstrapVue3);
    app.config.globalProperties.$axios = axios;
    app.use(ArchetypeDataValidationService);
  },
};

export default MadridDigitalLogicPlugin;
