<template lang="pug">
  .md-generate-sql
    .form-group.mb-3
      div(v-if="autoLoaded" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #e8f5e9; border-radius: 4px; border: 1px solid #a5d6a7")
        i.fas.fa-check-circle(style="color: #388e3c")
        span(style="font-size: 13px; color: #2e7d32") {{ $t('generateSql.autoLoaded') }}
      div(v-else)
        label.form-label {{ $t('generateSql.fileLabel') }}
        input.form-control(
          type="file"
          accept=".yaml,.yml,.json"
          ref="fileInput"
          @change="onFileChange"
        )
        small.text-muted.d-block.mt-1 {{ $t('generateSql.fileHint') }}

    .row.mb-3
      .col-6
        .form-group
          label.form-label {{ $t('generateSql.tablePrefix') }}
          input.form-control(
            v-model="tablePrefix"
            placeholder="ej: app_"
          )
          small.text-muted
            | {{ $t('generateSql.tablePrefixResult') }}
            strong {{ tablePrefix || '' }}pet
            | ,
            strong {{ tablePrefix || '' }}owner
      .col-6
        .form-group
          label.form-label {{ $t('generateSql.relationsPrefix') }}
          input.form-control(
            v-model="relationsPrefix"
            placeholder="ej: app_rel_"
          )
          small.text-muted
            | {{ $t('generateSql.relationsPrefixHint') }}
            br
            | {{ $t('generateSql.relationsPrefixResult') }}
            strong {{ relationsPrefix || '' }}pet_tag

    .form-group.mb-3
      label.form-label {{ $t('generateSql.dbSchema') }}
        small.text-muted.ml-1 {{ $t('generateSql.dbSchemaHint') }}
      input.form-control(
        v-model="dbSchema"
        :placeholder="$t('generateSql.dbSchemaPlaceholder')"
      )

    .mb-3(v-if="previewSql")
      label.form-label {{ $t('generateSql.preview') }}
      pre.sql-preview {{ previewSql }}

    .d-flex.justify-content-end.gap-2.mt-3
      b-button(variant="secondary" @click="generatePreview" :disabled="!fileLoaded")
        i.fas.fa-eye.mr-2
        span {{ $t('generateSql.previewBtn') }}
      b-button(variant="primary" @click="downloadSql" :disabled="!fileLoaded")
        i.fas.fa-download.mr-2
        span {{ $t('generateSql.downloadBtn') }}
      b-button(variant="success" @click="useSql" :disabled="!fileLoaded")
        i.fas.fa-database.mr-2
        span {{ $t('generateSql.useBtn') }}

    div(v-if="errorMsg" style="color: red; margin-top: 10px")
      small {{ errorMsg }}
</template>

<script lang="ts">
import {
  defineComponent, ref, onMounted, getCurrentInstance,
} from 'vue';
import generateSql, { parseOpenApiContent } from '@/services/openapi/sql-generator';
import { openApiParserService } from '@/services/openapi';
import type { SqlConfig } from '@/services/openapi/sql-generator';

export default defineComponent({
  name: 'MdGenerateSql',
  emits: ['use-sql'],

  setup(props, { emit }) {
    const { proxy } = getCurrentInstance() as any;
    const fileInput = ref<HTMLInputElement | null>(null);
    const tablePrefix = ref('');
    const relationsPrefix = ref('');
    const dbSchema = ref('');
    const fileLoaded = ref(false);
    const previewSql = ref('');
    const errorMsg = ref('');
    const autoLoaded = ref(false);

    let parsedDoc: any = null;

    onMounted(() => {
      const existing = openApiParserService.getRawDocument();
      if (existing) {
        parsedDoc = existing;
        fileLoaded.value = true;
        autoLoaded.value = true;
      }
    });

    const onFileChange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      errorMsg.value = '';
      previewSql.value = '';
      fileLoaded.value = false;
      parsedDoc = null;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = String(e.target?.result || '');
          parsedDoc = parseOpenApiContent(content);
          fileLoaded.value = true;
          autoLoaded.value = false;
        } catch (err: any) {
          errorMsg.value = proxy.$t('generateSql.parseError', { msg: err.message });
        }
      };
      reader.readAsText(file);
    };

    const buildConfig = (): SqlConfig => ({
      tablePrefix: tablePrefix.value,
      relationsPrefix: relationsPrefix.value,
      dbSchema: dbSchema.value,
    });

    const generatePreview = () => {
      if (!parsedDoc) return;
      try {
        const sql = generateSql(parsedDoc, buildConfig());
        previewSql.value = sql || `-- ${proxy.$t('generateSql.noSchemas')}`;
        errorMsg.value = '';
      } catch (err: any) {
        errorMsg.value = proxy.$t('generateSql.generateError', { msg: err.message });
      }
    };

    const useSql = () => {
      if (!parsedDoc) return;
      try {
        const sql = generateSql(parsedDoc, buildConfig());
        if (!sql) {
          errorMsg.value = proxy.$t('generateSql.noSchemas');
          return;
        }
        emit('use-sql', sql);
        errorMsg.value = '';
      } catch (err: any) {
        errorMsg.value = proxy.$t('generateSql.generateError', { msg: err.message });
      }
    };

    const downloadSql = () => {
      if (!parsedDoc) return;
      try {
        const sql = generateSql(parsedDoc, buildConfig());
        if (!sql) {
          errorMsg.value = proxy.$t('generateSql.noSchemas');
          return;
        }
        const docTitle = parsedDoc?.info?.title || 'schema';
        const filename = `${docTitle.replace(/\s+/g, '-').toLowerCase()}-schema.sql`;
        proxy.$filesService.downloadBlob(new Blob([sql], { type: 'text/plain' }), filename);
        errorMsg.value = '';
      } catch (err: any) {
        errorMsg.value = proxy.$t('generateSql.generateError', { msg: err.message });
      }
    };

    return {
      fileInput,
      tablePrefix,
      relationsPrefix,
      dbSchema,
      fileLoaded,
      previewSql,
      errorMsg,
      autoLoaded,
      onFileChange,
      generatePreview,
      downloadSql,
      useSql,
    };
  },
});
</script>

<style scoped>
.sql-preview {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
