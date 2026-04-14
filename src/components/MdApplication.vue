<template lang="pug">
  .c-application
    div.border.bg-white.p-4.mb-4
      h2.l-title.mb-3 {{ $t('application.title') }}
      b-row
        b-col(cols="4")
          label.small.mb-1(for='applicationNameInput') {{ $t('application.name') }}
          b-button(
                variant="link"
                v-b-tooltip.hover.bottomleft.html="$t('application.info.name')"
                tabindex="-1"
              )
                i.fas.fa-question-circle(style="color: #00bcd4")
          input#applicationNameInput.form-control.form-control-sm(
            type="text"
            :placeholder="$t('application.name')",
            v-model="name"
            )
        b-col(cols="5")
          label.small.mb-1(for='descriptionInput') {{ $t('application.description') }}
          b-button(
                variant="link"
                v-b-tooltip.hover.bottomleft.html="$t('application.info.description')"
                tabindex="-1"
              )
                i.fas.fa-question-circle(style="color: #00bcd4")
          input#descriptionInput.form-control.form-control-sm(
            type='text'
            :placeholder="$t('application.description')",
            v-model="description"
            )
        b-col(cols="3")
          label.small.mb-1(for='versionInput') {{ $t('application.version') }}
          b-button(
                variant="link"
                v-b-tooltip.hover.bottomleft.html="$t('application.info.version')"
                tabindex="-1"
              )
                i.fas.fa-question-circle(style="color: #00bcd4")
          input#versionInput.form-control.form-control-sm(
            type='text'
            :placeholder="$t('application.version')",
            v-model="version"
            )
      b-row.mt-3(v-if="isFromIframe && targetFramework === 'springboot'")
        b-col(cols="4")
          label.small.mb-1 {{ $t('application.targetFramework.groupId') }}
          input.form-control.form-control-sm(
            type="text"
            placeholder="ej: com.example"
            v-model="groupId"
          )
          small.text-muted {{ $t('application.targetFramework.groupIdHint') }}
        b-col(cols="4")
          label.small.mb-1 {{ $t('application.targetFramework.artifactId') }}
          input.form-control.form-control-sm(
            type="text"
            placeholder="ej: petstore"
            v-model="artifactId"
          )
          small.text-muted {{ $t('application.targetFramework.artifactIdHint') }}
        b-col(cols="4")
          label.small.mb-1 {{ $t('application.targetFramework.basePackage') }}
          input.form-control.form-control-sm(
            type="text"
            :value="groupId && artifactId ? groupId + '.' + artifactId : ''"
            disabled
          )
    div.border.bg-white.p-4.mb-4(v-if="!isFromIframe")
      h2.l-title.mb-3 {{ $t('application.targetFramework.title') }}
      b-row.mb-3
        b-col
          .d-flex.gap-3
            b-form-radio(v-model="targetFramework" value="python") {{ $t('application.targetFramework.python') }}
            b-form-radio(v-model="targetFramework" value="springboot") {{ $t('application.targetFramework.springboot') }}
      b-row(v-if="targetFramework === 'springboot'")
        b-col(cols="5")
          label.small.mb-1 {{ $t('application.targetFramework.groupId') }}
          input.form-control.form-control-sm(
            type="text"
            placeholder="ej: com.example"
            v-model="groupId"
          )
          small.text-muted {{ $t('application.targetFramework.groupIdHint') }}
        b-col(cols="4")
          label.small.mb-1 {{ $t('application.targetFramework.artifactId') }}
          input.form-control.form-control-sm(
            type="text"
            placeholder="ej: petstore"
            v-model="artifactId"
          )
          small.text-muted {{ $t('application.targetFramework.artifactIdHint') }}
        b-col(cols="3")
          label.small.mb-1 {{ $t('application.targetFramework.basePackage') }}
          input.form-control.form-control-sm(
            type="text"
            :value="groupId && artifactId ? groupId + '.' + artifactId : ''"
            disabled
          )
    //- MdStarters (oculto temporalmente)
    //- MdGenerationOptions (oculto temporalmente)
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';
// import MdGenerationOptions from './generation-options/MdGenerationOptions.vue';
// import MdStarters from './starters/MdStarters.vue';

export default defineComponent({
  components: {
    // MdStarters,
    // MdGenerationOptions,
  },
  setup() {
    const store = useStore();
    const artifactIdRegex = new RegExp('[a-zA-Z0-9]{3,4}_(rest|async)_.*');
    const modifiedArtifactId = ref(false);

    /**
     * Guardamos el nombre de la aplicación en el Store
     */
    const name = computed({
      get: (): string => store.state.applicationStore.name,
      set: (value: string) => {
        store.commit('applicationStore/SET_NAME', value);
      },
    });

    /**
     * Guardamos la descripción de la aplicación en el Store
     */
    const description = computed({
      get: (): string => store.state.applicationStore.description,
      set: (value: string) => {
        store.commit('applicationStore/SET_DESCRIPTION', value);
      },
    });

    /**
     * Guardamos el group de la aplicación en el Store
     */
    const group = computed({
      get: (): string => store.state.applicationStore.group,
      set: (value: string) => {
        store.commit('applicationStore/SET_GROUP', value);
      },
    });

    /**
     * Guardamos el artifact de la aplicación en el Store
     */
    const artifact = computed({
      get: (): string => store.state.applicationStore.artifact,
      set: (value: string) => {
        store.commit('applicationStore/SET_ARTIFACT', value);
      },
    });

    /**
     * Guardamos la versión de la aplicación en el Store
     */
    const version = computed({
      get: (): string => store.state.applicationStore.version,
      set: (value: string) => {
        store.commit('applicationStore/SET_VERSION', value);
      },
    });

    /**
     * Guardamos el package name de la aplicación en el Store
     */
    const packageName = computed({
      get: (): string => store.state.applicationStore.package_ame,
      set: (value: string) => {
        store.commit('applicationStore/SET_PACKAGE_NAME', value);
      },
    });

    const testsStarterIncluded = computed((): boolean => {
      return store.state.applicationStore.starters.length > 0 && store.state.applicationStore.starters.includes('japi-starter-test');
    });

    const formatApplicationArtifact = (artifact: string): string => {
      return artifact.split('_').join('.');
    };

    const checkArtifactIdFormat = (artifactId: string): boolean => {
      // Si el campo está vacío, no mostramos error
      if (!artifactId || artifactId.trim() === '') {
        return true;
      }
      // Si tiene valor, validamos el formato
      return artifactIdRegex.test(artifactId);
    };

    const fillPackageIfNotExists = () => {
      modifiedArtifactId.value = true;
      if ((group.value === undefined || group.value === null || group.value === '') && checkArtifactIdFormat(store.state.applicationStore.name)) {
        group.value = `org.madrid.${formatApplicationArtifact(store.state.applicationStore.name)}`;
        store.commit('applicationStore/SET_GROUP', group.value);
      }
    };

    const isFromIframe = computed((): boolean => store.state.iframe_initial_configuration != null
      && store.state.iframe_initial_configuration.openapi_yaml_in_base64 != null);

    const targetFramework = computed({
      get: (): string => store.state.applicationStore.targetFramework || 'python',
      set: (value: string) => {
        store.commit('applicationStore/SET_TARGET_FRAMEWORK', value);
      },
    });

    const groupId = computed({
      get: (): string => store.state.applicationStore.groupId || '',
      set: (value: string) => {
        store.commit('applicationStore/SET_GROUP_ID', value);
      },
    });

    const artifactId = computed({
      get: (): string => store.state.applicationStore.artifactId || '',
      set: (value: string) => {
        store.commit('applicationStore/SET_ARTIFACT_ID', value);
      },
    });

    return {
      name,
      description,
      group,
      artifact,
      version,
      packageName,
      testsStarterIncluded,
      fillPackageIfNotExists,
      checkArtifactIdFormat,
      isFromIframe,
      targetFramework,
      groupId,
      artifactId,
    };
  },
});
</script>
