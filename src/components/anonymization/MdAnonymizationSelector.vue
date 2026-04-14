<template lang="pug">
div.anon-selector(ref="selectorRef")
  //- Botón que muestra el valor actual
  div.anon-trigger(@click="toggleMenu" :class="{ 'anon-trigger--open': menuOpen }")
    span.anon-trigger__text {{ displayText }}
    i.fas.fa-chevron-down.anon-trigger__icon

  //- Menú principal
  div.anon-menu(v-if="menuOpen")
    div.anon-menu__item(@click="selectValue('')")
      span {{ $t('endpointAttribute.anonymizationNone') }}
    div.anon-menu__item(@click="selectValue('mask')")
      span mask
    div.anon-menu__item(@click="selectValue('suppression')")
      span suppression
    div.anon-menu__item(@click="selectValue('pseudonymize')")
      span pseudonymize
    //- Swap con submenu
    div.anon-menu__item.anon-menu__item--has-sub(@mouseenter="swapSubOpen = true" @mouseleave="swapSubOpen = false")
      span swap
      i.fas.fa-chevron-right(style="font-size: 10px; margin-left: auto")
      //- Submenu de swap
      div.anon-submenu(v-if="swapSubOpen")
        //- Editar lista existente
        div(v-if="editingExistingList" style="padding: 6px 10px; min-width: 200px")
          div(style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px")
            i.fas.fa-arrow-left(style="cursor:pointer; color:#6c757d; font-size:11px" @click.stop="editingExistingList = false")
            span(style="font-size: 12px; font-weight: 600") swap:{{ editingListName }}
          div(style="display: flex; gap: 4px")
            input.anon-input(
              v-model="newValueForList"
              :placeholder="$t('anonymizationConfig.newValuePlaceholder')"
              @keyup.enter="addValueToExistingList"
              @click.stop=""
            )
            button.anon-btn(@click.stop="addValueToExistingList" :disabled="!newValueForList.trim()")
              i.fas.fa-plus
          div(style="display: flex; flex-wrap: wrap; gap: 3px; margin-top: 6px")
            span.anon-tag(v-for="(val, idx) in editingListValues" :key="idx")
              | {{ val }}
              i.fas.fa-times.anon-tag__remove(@click.stop="removeValueFromExistingList(idx)")
        template(v-else)
          template(v-if="customSwapListNames.length > 0")
            div.anon-menu__item(v-for="name in customSwapListNames" :key="name")
              span(style="flex: 1" @click.stop="selectValue('swap:' + name)") swap:{{ name }}
              i.fas.fa-pen(style="font-size:10px; color:#6c757d; padding: 2px 4px" @click.stop="startEditingExisting(name)")
            div.anon-submenu__divider
          //- Crear nueva lista
          div(v-if="!creatingList")
            div.anon-menu__item.anon-menu__item--create(@click.stop="creatingList = true")
              i.fas.fa-plus(style="margin-right: 6px; font-size: 11px")
              span {{ $t('anonymizationConfig.createNewList') }}
          div(v-else style="padding: 6px 10px")
            div(style="display: flex; gap: 4px")
              input.anon-input(
                v-model="newListName"
                :placeholder="$t('anonymizationConfig.newListPlaceholder')"
                @keyup.enter="createList"
                @click.stop=""
                ref="newListInput"
              )
              button.anon-btn(@click.stop="createList" :disabled="!newListName.trim() || listNameExists")
                i.fas.fa-check
            div(v-if="listNameExists" style="color: #dc3545; font-size: 11px; margin-top: 2px")
              | {{ $t('anonymizationConfig.listExists') }}
            div(v-if="newListCreated" style="margin-top: 6px")
              div(style="font-size: 11px; color: #6c757d; margin-bottom: 3px") {{ $t('anonymizationConfig.addValuesTo') }} "{{ lastCreatedListName }}":
              div(style="display: flex; gap: 4px")
                input.anon-input(
                  v-model="newValueForList"
                  :placeholder="$t('anonymizationConfig.newValuePlaceholder')"
                  @keyup.enter="addValueToList"
                  @click.stop=""
                )
                button.anon-btn(@click.stop="addValueToList" :disabled="!newValueForList.trim()")
                  i.fas.fa-plus
              div(style="display: flex; flex-wrap: wrap; gap: 3px; margin-top: 4px")
                span.anon-tag(v-for="(val, idx) in lastCreatedListValues" :key="idx")
                  | {{ val }}
                  i.fas.fa-times.anon-tag__remove(@click.stop="removeValueFromList(idx)")
</template>

<script lang="ts">
import {
  defineComponent, ref, computed, watch, onMounted, onBeforeUnmount, nextTick,
} from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'MdAnonymizationSelector',
  props: {
    modelValue: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const store = useStore();
    const selectorRef = ref<HTMLElement | null>(null);
    const newListInput = ref<HTMLInputElement | null>(null);
    const menuOpen = ref(false);
    const swapSubOpen = ref(false);
    const creatingList = ref(false);
    const newListName = ref('');
    const newValueForList = ref('');
    const newListCreated = ref(false);
    const lastCreatedListName = ref('');
    const editingExistingList = ref(false);
    const editingListName = ref('');

    const customSwapListNames = computed(() => {
      const swapLists = store.state.applicationStore.anonymizationConfig?.swapLists;
      return swapLists ? Object.keys(swapLists) : [];
    });

    const lastCreatedListValues = computed(() => {
      if (!lastCreatedListName.value) return [];
      return store.state.applicationStore.anonymizationConfig?.swapLists?.[lastCreatedListName.value] || [];
    });

    const editingListValues = computed(() => {
      if (!editingListName.value) return [];
      return store.state.applicationStore.anonymizationConfig?.swapLists?.[editingListName.value] || [];
    });

    const listNameExists = computed(() => {
      const name = newListName.value.trim();
      return name !== '' && customSwapListNames.value.includes(name);
    });

    const displayText = computed(() => {
      if (!props.modelValue) return '—';
      return props.modelValue;
    });

    const resetSubState = () => {
      swapSubOpen.value = false;
      creatingList.value = false;
      newListCreated.value = false;
      editingExistingList.value = false;
      editingListName.value = '';
    };

    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value;
      if (!menuOpen.value) resetSubState();
    };

    const selectValue = (value: string) => {
      emit('update:modelValue', value);
      menuOpen.value = false;
      resetSubState();
    };

    const createList = () => {
      const name = newListName.value.trim();
      if (!name || listNameExists.value) return;
      store.commit('applicationStore/ADD_SWAP_LIST', { name, values: [] });
      lastCreatedListName.value = name;
      newListCreated.value = true;
      newListName.value = '';
    };

    const addValueToList = () => {
      const val = newValueForList.value.trim();
      if (!val || !lastCreatedListName.value) return;
      const currentValues = [...(lastCreatedListValues.value || [])];
      currentValues.push(val);
      store.commit('applicationStore/UPDATE_SWAP_LIST_VALUES', {
        name: lastCreatedListName.value,
        values: currentValues,
      });
      newValueForList.value = '';
    };

    const startEditingExisting = (name: string) => {
      editingListName.value = name;
      editingExistingList.value = true;
      newValueForList.value = '';
    };

    const addValueToExistingList = () => {
      const val = newValueForList.value.trim();
      if (!val || !editingListName.value) return;
      const currentValues = [...(editingListValues.value || [])];
      currentValues.push(val);
      store.commit('applicationStore/UPDATE_SWAP_LIST_VALUES', {
        name: editingListName.value,
        values: currentValues,
      });
      newValueForList.value = '';
    };

    const removeValueFromExistingList = (index: number) => {
      const currentValues = [...(editingListValues.value || [])];
      currentValues.splice(index, 1);
      store.commit('applicationStore/UPDATE_SWAP_LIST_VALUES', {
        name: editingListName.value,
        values: currentValues,
      });
    };

    const removeValueFromList = (index: number) => {
      const currentValues = [...(lastCreatedListValues.value || [])];
      currentValues.splice(index, 1);
      store.commit('applicationStore/UPDATE_SWAP_LIST_VALUES', {
        name: lastCreatedListName.value,
        values: currentValues,
      });
    };

    // Cerrar menu al clickar fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
        menuOpen.value = false;
        swapSubOpen.value = false;
        creatingList.value = false;
        newListCreated.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    watch(creatingList, (val) => {
      if (val) {
        nextTick(() => {
          newListInput.value?.focus();
        });
      }
    });

    return {
      selectorRef,
      newListInput,
      menuOpen,
      swapSubOpen,
      creatingList,
      newListName,
      newValueForList,
      newListCreated,
      lastCreatedListName,
      lastCreatedListValues,
      editingExistingList,
      editingListName,
      editingListValues,
      customSwapListNames,
      listNameExists,
      displayText,
      toggleMenu,
      selectValue,
      createList,
      addValueToList,
      removeValueFromList,
      startEditingExisting,
      addValueToExistingList,
      removeValueFromExistingList,
    };
  },
});
</script>

<style scoped>
.anon-selector {
  position: relative;
  display: inline-block;
  width: 100%;
}

.anon-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  min-height: 31px;
}

.anon-trigger:hover {
  border-color: #80bdff;
}

.anon-trigger--open {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.anon-trigger__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.anon-trigger__icon {
  font-size: 10px;
  margin-left: 6px;
  color: #6c757d;
}

.anon-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1050;
  min-width: 160px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
  padding: 4px 0;
  margin-top: 2px;
}

.anon-menu__item {
  display: flex;
  align-items: center;
  padding: 5px 12px;
  cursor: pointer;
  font-size: 13px;
  position: relative;
  white-space: nowrap;
}

.anon-menu__item:hover {
  background: #f0f0f0;
}

.anon-menu__item--has-sub {
  padding-right: 24px;
}

.anon-menu__item--create {
  color: #007bff;
  font-style: italic;
}

.anon-submenu {
  position: absolute;
  right: 100%;
  top: -4px;
  min-width: 180px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
  padding: 4px 0;
  z-index: 1051;
}

.anon-submenu__section-title {
  padding: 4px 12px 2px;
  font-size: 11px;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
}

.anon-submenu__divider {
  height: 1px;
  background: #dee2e6;
  margin: 4px 0;
}

.anon-input {
  border: 1px solid #ced4da;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 12px;
  width: 120px;
  outline: none;
}

.anon-input:focus {
  border-color: #80bdff;
}

.anon-btn {
  border: 1px solid #007bff;
  background: #007bff;
  color: #fff;
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
}

.anon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.anon-tag {
  display: inline-flex;
  align-items: center;
  background: #e9ecef;
  border-radius: 3px;
  padding: 1px 6px;
  font-size: 11px;
}

.anon-tag__remove {
  margin-left: 4px;
  cursor: pointer;
  color: #dc3545;
  font-size: 9px;
}
</style>
