import { Router } from 'vue-router';
import langHook from '@/router/hooks/lang.router.hook';
// import authHook from '@/router/hooks/auth.hook';

/**
 * En Vue 3, el router usa el tipo 'Router'. 
 * Eliminamos 'RouterOptions' y 'VueRouter' que eran de la v2/v3-beta.
 */
export default (router: Router): Router => {
  router.beforeEach(langHook);
  // router.beforeEach(authHook);
  return router;
};
