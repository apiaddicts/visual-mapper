<template lang="pug">
div.anonymization-swap-lists
  h2.l-subtitle.font-weight-bold.mb-3 {{ $t('anonymizationConfig.title') }}
  p.text-muted.mb-3 {{ $t('anonymizationConfig.description') }}

  div(v-for="(values, listName) in swapLists" :key="listName" style="margin-bottom: 20px; padding: 15px; border: 1px solid #dee2e6; border-radius: 6px; background: #f8f9fa")
    div(style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px")
      h5(style="margin: 0; font-weight: 600") {{ listName }}
      b-button(variant="outline-danger" size="sm" @click="removeList(listName)")
        i.fas.fa-trash
        span(style="margin-left: 5px") {{ $t('anonymizationConfig.deleteList') }}

    div(style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px")
      span(v-for="(val, idx) in values" :key="idx" style="display: inline-flex; align-items: center; background: #e9ecef; border-radius: 4px; padding: 3px 8px; font-size: 13px")
        span {{ val }}
        i.fas.fa-times(style="margin-left: 6px; cursor: pointer; color: #dc3545; font-size: 11px" @click="removeValue(listName, idx)")

    div(style="display: flex; gap: 8px")
      b-form-input(
        v-model="newValueInputs[listName]"
        :placeholder="$t('anonymizationConfig.newValuePlaceholder')"
        size="sm"
        @keyup.enter="addValue(listName)"
        style="max-width: 300px"
      )
      b-button(variant="outline-primary" size="sm" @click="addValue(listName)" :disabled="!newValueInputs[listName]?.trim()")
        i.fas.fa-plus
        span(style="margin-left: 5px") {{ $t('anonymizationConfig.addValue') }}

  div(style="margin-top: 15px; padding: 15px; border: 2px dashed #dee2e6; border-radius: 6px")
    div(style="display: flex; gap: 8px; align-items: center")
      b-form-input(
        v-model="newListName"
        :placeholder="$t('anonymizationConfig.newListPlaceholder')"
        size="sm"
        @keyup.enter="addList"
        style="max-width: 300px"
      )
      b-button(variant="primary" size="sm" @click="addList" :disabled="!newListName.trim() || listNameExists")
        i.fas.fa-plus
        span(style="margin-left: 5px") {{ $t('anonymizationConfig.addList') }}
    div(v-if="listNameExists" style="color: #dc3545; font-size: 12px; margin-top: 4px")
      | {{ $t('anonymizationConfig.listExists') }}
</template>

<script lang="ts">
import {
  defineComponent, ref, computed, reactive,
} from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'MdAnonymizationSwapLists',
  setup() {
    const store = useStore();
    const newListName = ref('');
    const newValueInputs = reactive<Record<string, string>>({});

    const swapLists = computed(() => store.state.applicationStore.anonymizationConfig?.swapLists || {});

    const listNameExists = computed(() => {
      const name = newListName.value.trim();
      return name !== '' && swapLists.value[name] !== undefined;
    });

    const addList = () => {
      const name = newListName.value.trim();
      if (!name || listNameExists.value) return;
      store.commit('applicationStore/ADD_SWAP_LIST', { name, values: [] });
      newListName.value = '';
    };

    const removeList = (listName: string) => {
      store.commit('applicationStore/REMOVE_SWAP_LIST', listName);
    };

    const addValue = (listName: string) => {
      const val = (newValueInputs[listName] || '').trim();
      if (!val) return;
      const currentValues = [...(swapLists.value[listName] || [])];
      currentValues.push(val);
      store.commit('applicationStore/UPDATE_SWAP_LIST_VALUES', { name: listName, values: currentValues });
      newValueInputs[listName] = '';
    };

    const removeValue = (listName: string, index: number) => {
      const currentValues = [...(swapLists.value[listName] || [])];
      currentValues.splice(index, 1);
      store.commit('applicationStore/UPDATE_SWAP_LIST_VALUES', { name: listName, values: currentValues });
    };

    return {
      swapLists,
      newListName,
      newValueInputs,
      listNameExists,
      addList,
      removeList,
      addValue,
      removeValue,
    };
  },
});
</script>
