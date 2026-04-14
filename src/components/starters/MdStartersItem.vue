<template lang="pug">
  div
    div(v-if="!inModal && selected" @click.stop="").border
      div.d-flex
        i(v-if="!collapsed" style="width: 3% !important;margin-left: 20px;margin-top: 5px" @click="toggleCollapse").fas.fa-angle-down.clickable.button-position
        i(v-if="collapsed" style="width: 3% !important;margin-left: 20px;margin-top: 5px" @click="toggleCollapse").fas.fa-angle-up.clickable.button-position
        p(style="width: 94% !important").ml-3.mt-3.mb-1.starter-item-title {{title}}
        div(style="width: 3% !important")
          i(style="color: #D10002" @click="changeSelectionState").fas.fa-times-circle.clickable.button-position
      div
        b-collapse(style="width: 100% !important" v-model="collapsed" :id="`collapse-${title}`")
          div(style="border-top: 1px solid grey").collapsed-box-margins
          p.collapsed-box-margins.selected-item-description-font-style {{description}}
    div(v-if="!selected && inModal" @click="changeSelectionState").border.starter-item
      div.d-flex
        h1.ml-3.mt-3.mb-1.starter-item-title {{title}}
      p.ml-3.whitespace {{description}}
    div(v-if="selected && inModal" @click="changeSelectionState").border.starter-item-selected
      h1.ml-3.mt-3.mb-1.starter-item-title {{title}}
      p.ml-3.whitespace {{description}}
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { emitter } from './MdStarters.vue';

export default defineComponent({
  name: 'MdStartersItem',
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    inModal: {
      type: Boolean,
      required: true,
    },
    selected: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const collapsed = ref(false);

    const toggleCollapse = () => {
      collapsed.value = !collapsed.value;
    };

    const changeSelectionState = () => {
      emitter.emit('starters-modal-selection', {
        title: props.title,
        state: !props.selected,
      });
    };

    return {
      collapsed,
      toggleCollapse,
      changeSelectionState,
    };
  },
});
</script>
<style scoped>
  .starter-item-title {
    font-size: 22px;
    margin-bottom: 16px !important;
  }

  .clickable:hover {
    cursor: pointer;
  }

  .starter-item:hover {
    background-color: #D10002;
    color: white
  }

  .starter-item-selected {
    background-color: #D10002;
    color: white
  }

  .button-position {
    padding-top: 20px;
    padding-left: 0px;
  }

  .collapsed-box-margins {
    margin-left: 50px;
    margin-right: 50px;
    margin-bottom: 10px;
    margin-top: 10px;
  }

  .selected-item-description-font-style {
    font-size: 14px
  }

  .whitespace {
    white-space: pre-wrap
  }
</style>
