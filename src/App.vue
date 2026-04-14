<template lang="pug">
.app
  router-view
  teleport(to="body")
    .toast-container(style="position: fixed; bottom: 0; left: 0; z-index: 9999; padding: 1rem;")
      .toast(
        v-for="(toast, index) in toasts"
        :key="toast.id || index"
        :class="['toast', 'show', `bg-${toast.variant}`, 'text-white']"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      )
        .toast-header(:class="`bg-${toast.variant} text-white`")
          strong.me-auto {{ toast.title }}
          button.btn-close.btn-close-white(
            type="button"
            @click="removeToast(toast)"
            aria-label="Close"
          )
        .toast-body(v-if="toast.body" style="white-space: pre-wrap; max-height: 400px; overflow-y: auto")
          | {{ toast.body }}
</template>

<script lang="ts">
import {
  defineComponent, onMounted, onUnmounted, ref,
} from 'vue';
import { toastEmitter } from '@/services/toast.service';

let toastId = 0;
interface ToastOptions {
  title?: string;
  body: string;
  variant?: string;
  noAutoHide: boolean;
  delay: number;
  id: number;
}

export default defineComponent({
  name: 'App',
  setup() {
    const toasts = ref<ToastOptions[]>([]);

    const removeToast = (toast: ToastOptions) => {
      const index = toasts.value.indexOf(toast);
      if (index > -1) {
        toasts.value.splice(index, 1);
      }
    };

    const handleShowToast = (options: any) => {
      const newToast: ToastOptions = {
        id: toastId,
        title: options.title,
        body: options.body,
        variant: options.variant || 'info',
        noAutoHide: options.value === 0,
        delay: options.value !== 0 ? options.value : 5000,
      };

      toastId += 1;
      toasts.value.push(newToast);

      if (!newToast.noAutoHide) {
        setTimeout(() => {
          removeToast(newToast);
        }, newToast.delay);
      }
    };

    onMounted(() => {
      toastEmitter.on('show-toast', handleShowToast);
    });

    onUnmounted(() => {
      toastEmitter.off('show-toast', handleShowToast);
    });

    return {
      toasts,
      removeToast,
    };
  },
});
</script>

<style lang="scss">
  // No borrar
</style>
