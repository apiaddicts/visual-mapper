<template lang="pug">
  div
    md-header
    md-subheader
    .site-content
      router-view
    md-footer
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MdHeader from '@/components/layout/MdHeader.vue';
import MdFooter from '@/components/layout/MdFooter.vue';
import MdSubheader from '@/components/layout/MdSubheader.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    MdHeader,
    MdSubheader,
    MdFooter,
  },
});
</script>
