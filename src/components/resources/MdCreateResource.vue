<template lang="pug">
  .c-create-resource
    div(v-if="!accepted")
      div.bbdd-container
        div.bbdd-message
          p
            | Esta opción no debe ser utilizada sin autorización expresa de Arquitectura.

          p
            | Para generar un API primero se debe crear un swagger, validar el mismo con Gobierno API y luego generar un arquetipo a través de la opción importar swagger.

          p
            | Esta opción genera un API "Técnica" que tiene los mismos recursos exactamente que las tablas que se seleccionen con todos sus campos y sus mismos tipos de datos.

          p
            | ¿Está seguro que quiere continuar?
    .alert.alert-info.text-center.small(v-else-if="accepted && tableOptions.length < 1") {{ $t('loading') }}
    div(v-else)
      label.typo__label {{ $t('tables.title') }}
      multiselect(
        v-model="tables",
        :options="tableOptions",
        :multiple="true",
        :close-on-select="false",
        :clear-on-select="false",
        :preserve-search="true",
        :searchable="true",
        :max-height="260",
        :hide-selected="true",
        :placeholder="$t('tables.search')",
        open-direction="bottom",
        :select-label="'Pulse Enter para seleccionar'"
        label="name",
        track-by="name"
      )
        template(#nooptions)
          span {{ $t('emptyList') }}
      multiselect.mt-3(
        v-model="methods",
        :options="methodOptions",
        :multiple="true",
        :close-on-select="false",
        :clear-on-select="false",
        :searchable="false",
        :hide-selected="true",
        :placeholder="$t('tables.searchVerbs')",
        open-direction="bottom",
        :select-label="'Pulse Enter para seleccionar'"
        label="name",
        track-by="name",
        :preselect-first="true"
      )
        template(#tag="{ option, remove }")
          span.custom__tag(:class="`custom__tag--${option.color}`")
            span {{ option.name }}
            span.custom__remove(@click="remove(option)")
        template(#nooptions)
          span {{ $t('emptyList') }}
    .border-top.pt-3.text-right
      b-button(variant='default' size='sm' @click='closeModal')
        | Cancelar
      b-button(
        variant='success'
        size='sm'
        @click="generateSwagger"
        v-if="accepted && !generating"
        style="width: 150px"
        :disabled="!buttonGenerateEnabled || !tables.length")
        | {{buttonGenerateTitle}}

      b-button(
        variant='success'
        size='sm'
        v-else-if="accepted"
        :disabled="true"
        style="width: 150px")
        i.fas.fa-spinner-third.fa-spin

      b-button(
        variant='success'
        size='sm'
        @click="acceptCondition"
        style="width: 150px"
        v-else)
        | Leer tablas de BBDD
</template>
<script lang="ts">

import { defineComponent, ref, inject } from 'vue';
import Multiselect from '@vueform/multiselect';
import { AxiosError, AxiosResponse } from 'axios';
import { ConfigGenApiResponse } from '@/services/config-gen-api.service';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

interface TableOption {
  name: string
}

export default defineComponent({
  name: 'CreateResource',
  components: {
    Multiselect,
  },
  props: {
    modalId: { type: String, required: true },
  },
  setup(props) {
    const store = useStore();
    const { t } = useI18n();
    const $configGenApi: any = inject('$configGenApi');
    const $toast: any = inject('$toast');
    const $bvModal: any = inject('$bvModal');

    const config = {
      headers: { 'x-datasource-id': store.state.connectionStore.id },
    };

    const tables = ref([]);
    const methods = ref([]);
    const tableOptions = ref<TableOption[]>([]);
    const buttonGenerateEnabled = ref(true);
    const buttonGenerateTitle = ref('Generar');
    const generating = ref(false);
    const accepted = ref(false);

    const methodOptions: any = [
      { name: 'POSTGETAll', color: 'post' },
      { name: 'GETById', color: 'get' },
      { name: 'POST', color: 'post' },
      { name: 'PUT', color: 'put' },
      { name: 'DELETE', color: 'delete' },
    ];

    const closeModal = () => {
      $bvModal.hide(props.modalId);
    };

    const generateSwagger = () => {
      buttonGenerateEnabled.value = false;
      generating.value = true;
      const formattedTables = tables.value.map((x:any) => x.name);
    
      return $configGenApi
        .postResources({
          connection: store.getters['connectionStore/connectionData'],
          tables: formattedTables,
          methods: methods.value.map((x: any) => x.name),
        }, config)
        .then((response: AxiosResponse<ConfigGenApiResponse<any>>) => {
          const { data } = response.data;
          const { result } = response.data;
          generating.value = false;
          $toast.success('Tablas mapeadas exitosamente', result.info);
          return data;
        })
        .then((data: any) => Promise.all([
          store.dispatch('entities/importEntities', data.entities),
          store.dispatch('controllers/importControllers', data.controllers),
        ]))
        .then(() => closeModal())
        .catch((err: Error) => {
          buttonGenerateEnabled.value = true;
          const error = err;
          generating.value = false;
        
          const x: string = `errors.${err.message}`;
          const msg = String(t(x));
        
          if (msg && x !== msg) error.message = msg;
        
          $toast.error(err);

          closeModal();
        });
    };

    const formatResponse = (arr: any[]): TableOption[] => {
      const res: TableOption[] = [];
    
      arr.forEach((value) => {
        res.push({ name: value.table_name_with_prefix });
      });
    
      return res;
    };

    const acceptCondition = () => {
      accepted.value = true;
      generating.value = true;
      const connectionData = store.getters['connectionStore/connectionData'];

      return $configGenApi
        .postGetTablesList(connectionData, config)
        .then((response: AxiosResponse<ConfigGenApiResponse<any>>) => {
          generating.value = false;
          const { data } = response.data;
          const { result } = response.data;
          if (!result.status) {
            throw new Error(result.info);
          }
          tableOptions.value = formatResponse(data.table_names);
          $toast.success('Tablas listadas satisfactoriamente', 'Se han listado satisfactoriamente las tablas y vistas de la base de datos a la que se ha conectado.');
        })
        .catch((err: AxiosError) => {
          const error = err;
          generating.value = false;
          if ((err.code == null || err.code === undefined || err.code === 'ERR_NETWORK') && (err.message === 'Network Error' || err.name === 'Error de conexión')) {
            if (err.name !== 'Error de conexión') {
              error.name = 'Error de conexión';
              error.message = `${err.config === undefined || err.config.url === undefined ? '(Sin URL)' : err.config.url} con método ${err.config!.method !== undefined ? err.config!.method.toUpperCase() : '(Sin método HTTP)'} y error: ${err.message}. Compruebe su conexión a internet y la conectividad con ${process.env.VUE_APP_CONFIG_GEN_API_URL}/status`;
            }
            $toast.error(err);
          }
          else {
            $toast.errorFromServer(err); 
          }
          closeModal();
        })
        .catch((err: any) => {
          generating.value = false;
          $toast.error(err);
          closeModal();
        });
    };

    return {
      tables,
      methods,
      tableOptions,
      buttonGenerateEnabled,
      buttonGenerateTitle,
      generating,
      methodOptions,
      accepted,
      generateSwagger,
      closeModal,
      acceptCondition,
    };
  },
});
</script>
