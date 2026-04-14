import { App } from 'vue';

class CommonCheckings {

}

const commonCheckings = new CommonCheckings();

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $commonCheckings: CommonCheckings;
  }
}

const CommonCheckingsService = {
  install(app: App): void {
    // eslint-disable-next-line no-param-reassign
    app.config.globalProperties.$commonCheckings = commonCheckings;
    app.provide('$commonCheckings', commonCheckings);
  },
};

export default CommonCheckingsService;
