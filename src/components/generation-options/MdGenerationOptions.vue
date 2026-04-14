<template lang="pug">
div(v-if="openApiDefinitionExists || kafkaStarterIncluded")
  div.border.bg-white
      h1.l-title.mb-3(v-if="openApiDefinitionExists" style="padding-left: 1.5rem !important; padding-right: 1.5rem !important; padding-top: 1.5rem !important;") {{ $t('application.generationOptions.title') }}
      .d-flex
      .form-group.mb-0
          div(v-if="openApiDefinitionExists" :style="asyncApiDefinitionObjectExists ? 'padding-left: 1.5rem !important; padding-right: 1.5rem !important;' : 'padding-left: 1.5rem !important; padding-right: 1.5rem !important; padding-bottom: 1.5rem !important;'")
            b-container(fluid style="margin-top: 10px")
              b-row
                b-col(cols="4")
                  label {{ $t('application.generationOptions.tests') }}
                  b-button(
                    variant="link"
                    v-b-tooltip.hover.bottomleft.html="$t('application.generationOptions.testsInfo')"
                    style="padding-bottom: 0; padding-top: 0"
                    tabindex="-1"
                  )
                    i.fas.fa-question-circle(style="color: red")
                  b-form-checkbox(
                      switch
                      size="lg"
                      v-model='testGeneration'
                      name="check-test"
                      :disabled="!testsStarterIncluded"
                  ) 
                    label.small {{ testGeneration ? 'Activa' : 'No activa' }}
                b-col(cols="4")
                  label {{ $t('application.generationOptions.files') }}
                  b-button(
                    variant="link"
                    v-b-tooltip.hover.bottomleft.html="$t('application.generationOptions.filesInfo')"
                    style="padding-bottom: 0; padding-top: 0"
                    tabindex="-1"
                  )
                    i.fas.fa-question-circle(style="color: red")
                  b-form-checkbox(
                      switch
                      size="lg"
                      v-model='filesGeneration'
                      name="check-test"
                      :disabled="!testsStarterIncluded"
                  ) 
                    label.small {{ filesGeneration ? 'Activa' : 'No activa' }}
          div(v-if="kafkaStarterIncluded && asyncApiDefinitionObjectExists" :style="openApiDefinitionExists ? 'padding-left: 1.5rem !important; padding-right: 1.5rem !important; padding-bottom: 1.5rem !important;' : 'padding-left: 1.5rem !important; padding-right: 1.5rem !important; padding-bottom: 1.5rem !important; padding-top: 1.5rem !important;'")
            hr(v-if="openApiDefinitionExists")
            h2.l-title.mb-1 {{ $t('application.kafka_credentials.title') }}
            p(style="margin-bottom: 0; margin-top: 10px; padding-left: 15px") Al seleccionar el starter de Kafka, implica que querrá conectarse contra una intancia de Apacha Kafka. 
            p(style="margin-bottom: 0; padding-left: 15px") Puede incluir aquí las credenciales de cada entorno si lo desea, para que se generen encriptadas en el fichero properties correspondiente.
            p(style="margin-bottom: 30px; padding-left: 15px") También puede no incluirlas, o no incluir cualquier valor, lo que implicará que se generen apuntando a variables de entorno.
            
            div
              div.d-flex.form-group(v-if="serverExists('local')")
                b-col
                  label.small(for='kafka_loc_user') Usuario local 
                  b-form-input(v-model="kafkaLocUser")#kafka_loc_user
                b-col
                  label.small(for='kafka_loc_password') Contraseña local 
                  b-form-input(v-model="kafkaLocPassword" type="password" readonly="readonly" style="background-color: #fff" onfocus="this.removeAttribute('readonly');")#kafka_loc_password
                b-col(cols="1" align-self="end" style="padding-bottom: 11px")
                  b-button(
                    variant="link"
                    style="padding-bottom: 0; padding-top: 0"
                    tabindex="-1"
                    @click="clearKafkaLocInputs"
                  )
                    i.fas.fa-trash(style="color: red")
              div.d-flex.form-group(v-if="serverExists('desarrollo')")
                b-col
                  label.small(for='kafka_dev_user') Usuario de desarrollo 
                  b-form-input(v-model="kafkaDevUser")#kafka_dev_user
                b-col
                  label.small(for='kafka_dev_password') Contraseña de desarrollo 
                  b-form-input(v-model="kafkaDevPassword" type="password" readonly="readonly" style="background-color: #fff" onfocus="this.removeAttribute('readonly');")#kafka_dev_password
                b-col(cols="1" align-self="end" style="padding-bottom: 11px")
                  b-button(
                    variant="link"
                    style="padding-bottom: 0; padding-top: 0"
                    tabindex="-1"
                    @click="clearKafkaDevInputs"
                  )
                    i.fas.fa-trash(style="color: red")
              div.d-flex.form-group(v-if="serverExists('validacion')")
                b-col
                  label.small(for='kafka_val_user') Usuario de validación 
                  b-form-input(v-model="kafkaValUser")#kafka_val_user
                b-col
                  label.small(for='kafka_val_password') Contraseña de validación 
                  b-form-input(v-model="kafkaValPassword" type="password" readonly="readonly" style="background-color: #fff" onfocus="this.removeAttribute('readonly');")#kafka_val_password
                b-col(cols="1" align-self="end" style="padding-bottom: 11px")
                  b-button(
                    variant="link"
                    style="padding-bottom: 0; padding-top: 0"
                    tabindex="-1"
                    @click="clearKafkaValInputs"
                  )
                    i.fas.fa-trash(style="color: red")
              div.d-flex.form-group(v-if="serverExists('formacion')")
                b-col
                  label.small(for='kafka_for_user') Usuario de formación 
                  b-form-input(v-model="kafkaForUser")#kafka_for_user
                b-col
                  label.small(for='kafka_for_password') Contraseña de formación 
                  b-form-input(v-model="kafkaForPassword" type="password" readonly="readonly" style="background-color: #fff" onfocus="this.removeAttribute('readonly');")#kafka_for_password
                b-col(cols="1" align-self="end" style="padding-bottom: 11px")
                  b-button(
                    variant="link"
                    style="padding-bottom: 0; padding-top: 0"
                    tabindex="-1"
                    @click="clearKafkaForInputs"
                  )
                    i.fas.fa-trash(style="color: red")
              div.d-flex.form-group(v-if="serverExists('preproduccion')")
                b-col
                  label.small(for='kafka_pre_user') Usuario de preproducción 
                  b-form-input(v-model="kafkaPreUser")#kafka_pre_user
                b-col
                  label.small(for='kafka_pre_password') Contraseña de preproducción 
                  b-form-input(v-model="kafkaPrePassword" type="password" readonly="readonly" style="background-color: #fff" onfocus="this.removeAttribute('readonly');")#kafka_pre_password
                b-col(cols="1" align-self="end" style="padding-bottom: 11px")
                  b-button(
                    variant="link"
                    style="padding-bottom: 0; padding-top: 0"
                    tabindex="-1"
                    @click="clearKafkaPreInputs"
                  )
                    i.fas.fa-trash(style="color: red")
              div.d-flex.form-group(v-if="serverExists('produccion')")
                b-col
                  label.small(for='kafka_pro_user') Usuario de producción 
                  b-form-input(v-model="kafkaProUser")#kafka_pro_user
                b-col
                  label.small(for='kafka_pro_password') Contraseña de producción 
                  b-form-input(v-model="kafkaProPassword" type="password" readonly="readonly" style="background-color: #fff" onfocus="this.removeAttribute('readonly');")#kafka_pro_password
                b-col(cols="1" align-self="end" style="padding-bottom: 11px")
                  b-button(
                    variant="link"
                    style="padding-bottom: 0; padding-top: 0"
                    tabindex="-1"
                    @click="clearKafkaProInputs"
                  )
                    i.fas.fa-trash(style="color: red")
</template>
<script lang="ts">
import {
  defineComponent, computed, ref, watch, 
} from 'vue'; // Añadimos watch
import { useStore } from 'vuex';

export default defineComponent({
  name: 'MdGenerationOptions',
  setup() {
    const store = useStore();
    const anyKafkaInputInluded = ref(false);

    // --- MÉTODOS AUXILIARES ---
    const getIfStarterExists = (starterName: string) => {
      const starters = store.state.applicationStore?.starters || [];
      return starters.length > 0 && starters.includes(starterName);
    };

    const clearInputs = (suffix: string) => {
      store.commit(`applicationStore/SET_KAFKA_USER_${suffix}`, undefined);
      store.commit(`applicationStore/SET_KAFKA_PASSWORD_${suffix}`, undefined);
    };

    // --- PROPIEDADES COMPUTADAS ---
    const testsStarterIncluded = computed(() => getIfStarterExists('japi-starter-test'));
    const anyRestStarterIncluded = computed(() => getIfStarterExists('japi-starter-openapi') || getIfStarterExists('japi-starter-swagger'));

    // Limpiamos la computed: ahora solo retorna el booleano
    const kafkaStarterIncluded = computed(() => getIfStarterExists('japi-starter-kafka'));

    watch(kafkaStarterIncluded, (exists) => {
      if (!exists && anyKafkaInputInluded.value) {
        ['LOC', 'DEV', 'VAL', 'FOR', 'PRE', 'PRO'].forEach((s) => clearInputs(s));
        anyKafkaInputInluded.value = false;
      }
    });

    const openApiDefinitionExists = computed(() => store.state.api_definition !== undefined && store.state.api_definition !== '');

    const asyncApiDefinitionObjectExists = computed(() => {
      const obj = store.state.async_api_definition_object;
      return obj !== undefined && obj !== null && Object.keys(obj).length > 0;
    });

    const serverExists = (server: string) => {
      const servers = store.state.async_api_servers || [];
      return servers.includes(server);
    };

    // --- COMPUTADAS CON GET/SET (PARA V-MODEL) ---
    const createKafkaComputed = (stateProp: string, mutationSuffix: string) => computed({
      get: () => store.state.applicationStore[stateProp],
      set: (value: string) => {
        // Marcamos que hay inputs incluidos para que el watch sepa cuando limpiar
        if (value !== '' && value !== undefined) anyKafkaInputInluded.value = true;
        store.commit(`applicationStore/SET_KAFKA_${mutationSuffix}`, value === '' ? undefined : value);
      },
    });

    const testGeneration = computed({
      get: () => store.state.applicationStore.tests_generation,
      set: (value: boolean) => store.commit('applicationStore/SET_TESTS_GENERATION', value),
    });

    const filesGeneration = computed({
      get: () => store.state.applicationStore.files_generation,
      set: (value: boolean) => store.commit('applicationStore/SET_FILES_GENERATION', value),
    });

    return {
      anyKafkaInputInluded,
      testsStarterIncluded,
      anyRestStarterIncluded,
      kafkaStarterIncluded,
      openApiDefinitionExists,
      asyncApiDefinitionObjectExists,
      serverExists,
      clearKafkaLocInputs: () => clearInputs('LOC'),
      clearKafkaDevInputs: () => clearInputs('DEV'),
      clearKafkaValInputs: () => clearInputs('VAL'),
      clearKafkaForInputs: () => clearInputs('FOR'),
      clearKafkaPreInputs: () => clearInputs('PRE'),
      clearKafkaProInputs: () => clearInputs('PRO'),
      testGeneration,
      filesGeneration,
      kafkaLocUser: createKafkaComputed('kafka_loc_user', 'USER_LOC'),
      kafkaLocPassword: createKafkaComputed('kafka_loc_password', 'PASSWORD_LOC'),
      kafkaDevUser: createKafkaComputed('kafka_dev_user', 'USER_DEV'),
      kafkaDevPassword: createKafkaComputed('kafka_dev_password', 'PASSWORD_DEV'),
      kafkaValUser: createKafkaComputed('kafka_val_user', 'USER_VAL'),
      kafkaValPassword: createKafkaComputed('kafka_val_password', 'PASSWORD_VAL'),
      kafkaForUser: createKafkaComputed('kafka_for_user', 'USER_FOR'),
      kafkaForPassword: createKafkaComputed('kafka_for_password', 'PASSWORD_FOR'),
      kafkaPreUser: createKafkaComputed('kafka_pre_user', 'USER_PRE'),
      kafkaPrePassword: createKafkaComputed('kafka_pre_password', 'PASSWORD_PRE'),
      kafkaProUser: createKafkaComputed('kafka_pro_user', 'USER_PRO'),
      kafkaProPassword: createKafkaComputed('kafka_pro_password', 'PASSWORD_PRO'),
    };
  },
});
</script>
