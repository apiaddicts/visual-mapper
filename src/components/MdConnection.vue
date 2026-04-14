<template lang="pug">
  .c-connection
    div.border.bg-white.p-4
      .d-flex.justify-content-between.align-items-center
        h2.m-0.l-title {{ $t('connection.title') }}

        .d-flex.align-items-center(v-if="isConnected")
          button.btn.bg-brand.color-white.border(style="margin-right: 30px; padding: 8px" @click="editConnection")
            i(style="margin-right: 4px; margin-left: 4px").far.fa-edit
          div(@click="isOpen = !isOpen").d-flex.align-items-center.cursor-pointer
            i.fal.fa-angle-up.text-muted(v-if="isOpen")
            i.fal.fa-angle-down.text-muted(v-if="!isOpen")
            span.mr-2.small.text-muted.ml-2(v-if="isOpen") {{ $t('connection.hide') }}
            span.mr-2.small.text-muted.ml-2(v-else) {{ $t('connection.show') }}
          i.far.fa-check-circle.color-ok.fa-2x
      div.mt-3(v-if="!noUseDatabase" v-show="!isConnected || isOpen")
        //- Selector de modo: Conectar o Crear BD
        .d-flex.align-items-center.mb-4(v-if="!isConnected")
          .btn-group
            button.btn(:class="connectionMode === 'connect' ? 'bg-brand color-white' : 'btn-outline-secondary'" @click="connectionMode = 'connect'" style="padding: 8px 20px") {{ $t('connection.modeConnect') }}
            button.btn(:class="connectionMode === 'create' ? 'bg-brand color-white' : 'btn-outline-secondary'" @click="connectionMode = 'create'" style="padding: 8px 20px") {{ $t('connection.modeCreate') }}
        hr.mt-0.mb-4(v-if="!isConnected")
        //- Modo CONECTAR: formulario completo
        div(v-if="connectionMode === 'connect'")
          div.mb-2
            div(style="font-size: 14px; font-style: italic") {{ $t('connection.requiredFields') }}
          b-row.mb-3
            b-col(cols="2")
              label.small.mb-1(for='DbTypeSelect') {{ '* ' + $t('connection.dbType') }}
              b-form-select#DbTypeSelect.form-select-sm(
                v-model="dbType"
                :options="dbTypeOptions"
                :disabled="isConnected"
              )
            b-col(cols="3")
              label.small.mb-1(for='HostInput') {{ '* ' + $t('connection.host') }}
              input#HostInput.form-control.form-control-sm(
                type='text'
                :placeholder="$t('connection.host')"
                v-model='host'
                :disabled="isConnected"
              )
            b-col(cols="1")
              label.small.mb-1(for='PortInput') {{ '* ' + $t('connection.port') }}
              input#PortInput.form-control.form-control-sm(
                type='text'
                :placeholder="$t('connection.port')"
                v-model='port'
                :disabled="isConnected"
              )
            b-col(cols="3")
              label.small.mb-1(for='DatabaseInput') {{ '* ' + $t('connection.database') }}
              input#DatabaseInput.form-control.form-control-sm(
                type='text'
                :placeholder="$t('connection.database')"
                v-model='database'
                :disabled="isConnected"
              )
            b-col(cols="3")
              label.small.mb-1(for='SchemaInput') {{ '* ' + $t('connection.schema') }}
              input#SchemaInput.form-control.form-control-sm(
                type='text'
                placeholder='public'
                v-model='schema'
                :disabled="isConnected"
              )
          b-row.mb-3
            b-col(cols="3")
              label.small.mb-1(for='DBAUserInput') {{ '* ' + $t('connection.user') }}
              input#DBAUserInput.form-control.form-control-sm(
                type='text'
                :placeholder="$t('connection.user')"
                v-model='username'
                :disabled="isConnected"
              )
            b-col(cols="3")
              label.small.mb-1(for='DBAPassInput') {{ '* ' + $t('connection.pass') }}
              input#DBAPassInput.form-control.form-control-sm(
                type='password'
                :placeholder="$t('connection.pass')"
                v-model='password'
                :disabled="isConnected"
                readonly="readonly"
                style="background-color: #fff"
                onfocus="this.removeAttribute('readonly');"
              )
          .text-right
            div(v-if="!isConnected")
              button#DBConnectButton.e-btn.bg-brand.border-0.color-white(
                v-if="!connecting"
                @click="connect"
                style="width: 120px"
                :disabled="hasConnectionData === false || !buttonConnectionEnabled")
                | {{ buttonConnectionTitle }}
              button.e-btn.bg-brand.border-0.color-white(
                v-else
                style="width: 120px"
                :disabled="true")
                i.fas.fa-spinner-third.fa-spin
        //- Modo CREAR: solo tipo, nombre y archivo SQL
        div(v-if="connectionMode === 'create'")
          div.mb-2
            div(style="font-size: 14px; font-style: italic") {{ $t('connection.createDbInfo') }}
          //- Modal diagrama Mermaid
          md-modal(:modalId="'md-modal-sql-diagram'" v-model="showDiagramModal" title="Diagrama ER del SQL")
            md-sql-diagram(:diagram="mermaidDiagram")
          //- Modal generar SQL desde OpenAPI
          md-modal(:modalId="'md-modal-generate-sql'" v-model="showGenerateSqlModal" title="Generar SQL desde OpenAPI")
            md-generate-sql(@use-sql="onUseSql")
          b-row.mb-2
            b-col
              button.e-btn.btn-outline-secondary.border(@click="showGenerateSqlModal = true" style="white-space: nowrap")
                i.fas.fa-file-code.mr-1
                | Generar SQL desde OpenAPI
          b-row.align-items-end.mb-3
            b-col(cols="2")
              label.small.mb-1(for='CreateDbTypeSelect') {{ '* ' + $t('connection.dbType') }}
              b-form-select#CreateDbTypeSelect.form-control.form-control-sm(
                v-model="createDbType"
                :options="createDbTypeOptions"
                :disabled="isConnected"
              )
            //- b-col(cols="3")
            //-   label.small.mb-1(for='CreateDbNameInput') {{ '* ' + $t('connection.createDbName') }}
            //-   input#CreateDbNameInput.form-control.form-control-sm(
            //-     type='text'
            //-     :placeholder="$t('connection.createDbNamePlaceholder')"
            //-     v-model='createDbName'
            //-     :disabled="isConnected"
            //-   )
            b-col(cols="4")
              label.small.mb-1(for='SqlFileInput') {{ '* ' + $t('connection.createDbFile') }}
              div.border.border-success.rounded.px-2.py-1.text-success.small(v-if="sqlFile && sqlFile.name === 'generated-schema.sql'")
                i.fas.fa-check-circle.mr-1
                | {{ sqlFile.name }}
                span.ml-2.text-muted.small {{ $t('connection.sqlAutoGenerated') }}
              input#SqlFileInput.form-control(
                v-else
                type='file'
                accept=".sql"
                @change="onSqlFileSelected"
                :disabled="isConnected"
                style="width: 100%; height: 0px; padding: 10"
              )
            b-col(cols="3").d-flex.align-items-center.gap-2
              button.e-btn.btn-outline-secondary.border(
                v-if="mermaidDiagram"
                @click="showDiagramModal = true"
                style="white-space: nowrap")
                i.fas.fa-project-diagram.mr-1
                | Ver diagrama
              button.e-btn.bg-brand.border-0.color-white(
                v-if="!connecting"
                @click="createDb"
                style="white-space: nowrap"
                :disabled="!sqlFile || !buttonConnectionEnabled")
                | {{ $t('connection.createDbButton') }}
              button.e-btn.bg-brand.border-0.color-white(
                v-else
                :disabled="true")
                i.fas.fa-spinner-third.fa-spin
      //- Oculto temporalmente: sección "Continuar sin base de datos"
      //- div(v-else)
      //-   div(v-if="isOpen" :style="'white-space: pre-line'").mt-4
      //-     div {{ $t('connection.noDatabaseInfo') }}
      //-     div(v-if="!isConnected").row.col-md-10.mt-4
      //-       b-button(variant="danger" @click="skipDBConnection" :disabled="usesDatabase").bg-brand Continuar sin base de datos
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { DATABASE_TYPES, DatabaseType } from '@/services/db-explorer-api.service';
import MdModal from '@/components/commons/MdModal.vue';
import MdSqlDiagram from '@/components/commons/MdSqlDiagram.vue';
import MdGenerateSql from '@/components/resources/MdGenerateSql.vue';
import { sqlToMermaid } from '@/services/sql-to-mermaid.service';

const VueScrollTo = require('vue-scrollto');

const DEFAULT_PORTS: Record<string, string> = {
  POSTGRES: '5432',
  ORACLE: '1521',
  MYSQL: '3306',
  SQLSERVER: '1433',
  MARIADB: '3306',
};

const DEFAULT_SCHEMAS: Record<string, string> = {
  POSTGRES: 'public',
  ORACLE: '',
  MYSQL: '',
  SQLSERVER: 'dbo',
  MARIADB: '',
};

export default defineComponent({
  name: 'MdConnection',
  components: { MdModal, MdSqlDiagram, MdGenerateSql },
  emits: ['connection-modal'],
  setup(props, { emit }) {
    const store = useStore();
    const { t } = useI18n();
    const $toast: any = inject('$toast');

    const isOpen = ref(true);
    const buttonConnectionEnabled = ref(true);
    const connecting = ref(false);
    const buttonConnectionTitle = computed(() => t('connection.connect'));
    const connectionMode = ref<'connect' | 'create'>('connect');

    // Estado para modo "Crear BD"
    const createDbType = ref<DatabaseType>('POSTGRES');
    const createDbName = ref('');
    const sqlFile = ref<File | null>(null);
    const mermaidDiagram = ref('');
    const showDiagramModal = ref(false);
    const showGenerateSqlModal = ref(false);

    const dbTypeOptions = DATABASE_TYPES.map((dt) => ({
      value: dt.value,
      text: dt.label,
    }));

    const createDbTypeOptions = [
      { value: 'POSTGRES', text: 'PostgreSQL' },
      { value: 'MYSQL', text: 'MySQL' },
    ];

    // Computed properties
    const noUseDatabase = computed({
      get: () => store.state.applicationStore.archetype_has_database === false,
      set: (dbConnectionNewState: boolean) => {
        store.commit('applicationStore/SET_DB_USAGE', !dbConnectionNewState);
        store.dispatch('connectionStore/clearData');
      },
    });

    const dbType = computed({
      get: () => store.state.connectionStore.type,
      set: (value: DatabaseType) => {
        store.commit('connectionStore/SET_TYPE', value);
        store.commit('connectionStore/SET_PORT', DEFAULT_PORTS[value] || '5432');
        store.commit('connectionStore/SET_SCHEMA', DEFAULT_SCHEMAS[value] || '');
      },
    });

    const host = computed({
      get: () => store.state.connectionStore.host,
      set: (value: string) => store.commit('connectionStore/SET_HOST', value),
    });

    const port = computed({
      get: () => store.state.connectionStore.port,
      set: (value: string) => store.commit('connectionStore/SET_PORT', value),
    });

    const schema = computed({
      get: () => store.state.connectionStore.schema,
      set: (value: string) => store.commit('connectionStore/SET_SCHEMA', value),
    });

    const database = computed({
      get: () => store.state.connectionStore.database,
      set: (value: string) => store.commit('connectionStore/SET_DATABASE', value),
    });

    const username = computed({
      get: () => store.state.connectionStore.username,
      set: (value: string) => store.commit('connectionStore/SET_USERNAME', value),
    });

    const password = computed({
      get: () => store.state.connectionStore.password,
      set: (value: string) => store.commit('connectionStore/SET_PASSWORD', value),
    });

    const isConnected = computed(() => store.state.connectionStore.is_connected);
    const hasConnectionData = computed(() => store.getters['connectionStore/hasConnectionData']);
    const connectionData = computed(() => store.getters['connectionStore/connectionData']);
    const usesDatabase = computed(() => store.state.applicationStore.archetype_has_database);

    // Methods
    const handleError = (err: Error) => {
      buttonConnectionEnabled.value = true;
      connecting.value = false;
      const x: string = `errors.${err.message}`;
      const msg = String(t(x));
      if (msg && x !== msg) err.message = msg;
      $toast.error(err);
    };

    const handleSuccess = (data: any) => {
      buttonConnectionEnabled.value = true;
      connecting.value = false;

      $toast.success(
        t('connection.successTitle'),
        t('connection.successMessage', { id: data.id }),
      );
      VueScrollTo.scrollTo('.js-connection', 1000, { offset: -115 });

      // Cargar tablas automaticamente despues de conectar
      store.dispatch('connectionStore/fetchTables')
        .then((result: any) => {
          // La respuesta puede ser { tables: [{name: "..."}] } o un array directo
          const rawTables = result.tables || result;
          const schemaPrefix = store.state.connectionStore.schema || 'public';
          const tableNames = Array.isArray(rawTables)
            ? rawTables.map((tbl: any) => {
              const tblName = typeof tbl === 'string' ? tbl : tbl.name;
              return `${schemaPrefix}.${tblName}`;
            })
            : [];
          store.commit('entities/SET_TABLES', tableNames);
        })
        .catch((err: any) => {
          $toast.error({
            name: t('connection.errorLoadingTables'),
            message: err.message || t('connection.errorLoadingTablesMessage'),
          });
        });
    };

    const connect = (): void => {
      buttonConnectionEnabled.value = false;
      connecting.value = true;

      store.dispatch('connectionStore/fetch')
        .then((data: any) => {
          handleSuccess(data);
        })
        .catch((err: any) => {
          buttonConnectionEnabled.value = true;
          connecting.value = false;

          if (err.name === 'Error de conexion') {
            handleError(err);
          } else {
            $toast.errorFromServer(err);
          }
        });
    };

    const editConnection = () => {
      buttonConnectionEnabled.value = true;
      connecting.value = false;

      const connData = { ...store.state.connectionStore };
      connData.is_connected = false;
      connData.is_open = false;

      store.state.connectionStore = connData;
    };

    const skipDBConnection = () => {
      store.commit('connectionStore/SET_ID', -1);
      store.commit('connectionStore/SET_ISCONNECTED', true);

      const connData = { ...store.state.connectionStore };
      connData.id = -1;
      connData.is_connected = true;
      connData.is_open = true;

      store.state.connectionStore = connData;
    };

    const onSqlFileSelected = (event: Event) => {
      const input = event.target as HTMLInputElement;
      sqlFile.value = input.files && input.files.length > 0 ? input.files[0] : null;

      if (sqlFile.value) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          mermaidDiagram.value = sqlToMermaid(content);
        };
        reader.readAsText(sqlFile.value);
      } else {
        mermaidDiagram.value = '';
      }
    };

    const createDb = (): void => {
      if (!sqlFile.value) return;
      buttonConnectionEnabled.value = false;
      connecting.value = true;

      store.dispatch('connectionStore/createDatabase', {
        type: createDbType.value,
        database: createDbName.value,
        file: sqlFile.value,
      })
        .then((data: any) => {
          handleSuccess(data);
          if (data?.id) {
            window.parent.postMessage({ type: 'connection-created', connection_id: data.id }, '*');
          }
        })
        .catch((err: any) => {
          buttonConnectionEnabled.value = true;
          connecting.value = false;
          $toast.error({
            name: t('connection.errorCreateDb'),
            message: err.response?.data?.message || err.message || 'Error inesperado al crear la base de datos.',
          });
        });
    };

    const onUseSql = (sqlContent: string) => {
      const file = new File([sqlContent], 'generated-schema.sql', { type: 'text/plain' });
      sqlFile.value = file;
      mermaidDiagram.value = sqlToMermaid(sqlContent);
      showGenerateSqlModal.value = false;
    };

    const editSwitch = () => {
      // No-op, el computed setter de noUseDatabase ya maneja la logica
    };

    return {
      isOpen,
      buttonConnectionEnabled,
      connecting,
      buttonConnectionTitle,
      connectionMode,
      dbTypeOptions,
      createDbTypeOptions,
      createDbType,
      createDbName,
      sqlFile,
      noUseDatabase,
      dbType,
      host,
      port,
      schema,
      database,
      username,
      password,
      isConnected,
      hasConnectionData,
      connectionData,
      usesDatabase,
      connect,
      createDb,
      onSqlFileSelected,
      mermaidDiagram,
      showDiagramModal,
      showGenerateSqlModal,
      onUseSql,
      editConnection,
      skipDBConnection,
      editSwitch,
    };
  },
});
</script>
