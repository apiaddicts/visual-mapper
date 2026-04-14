import { RouteRecordRaw } from 'vue-router';

export default (children: Array<RouteRecordRaw>) => [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "bundle" */ '@/views/Main.vue'),
    children,
  },
];
