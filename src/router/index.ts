import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';

import addHooks from './hooks';

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default addHooks(router);
