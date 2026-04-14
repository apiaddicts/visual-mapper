import { Store } from 'vuex';
import { RootState } from './store/state';
import ToastService from './services/toast.service';
import ConfigGenApiService from './services/config-gen-api.service';
import ProjectGenApiService from './services/project-gen-api.service';
import FilesService from './services/files.service';
import JapiPluralUtilsService from './services/japi-plural-utils.service';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<RootState>;
    $toast: typeof ToastService;
    $configGenApi: typeof ConfigGenApiService;
    $projectGenApi: typeof ProjectGenApiService;
    $filesService: typeof FilesService;
    $japiPluralUtilsService: typeof JapiPluralUtilsService;
    $bvModal: any;
    $i18n: any;
  }
}
