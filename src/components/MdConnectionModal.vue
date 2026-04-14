<template lang="pug">
    b-modal(v-model="visible" :centered="true" size="lg" title="Aviso" cancel-title="Cancelar" ok-title="Continuar" ok-variant="danger" @ok="emitOk")
        | Ha seleccionado la carga de todos los esquemas o añadir esquema adicional. 
        | Estas opciones solo se deben usar con autorización de Arquitectura. Por favor, abra un mantis para consultar si es adecuado para el caso concreto de uso.
        | Tenga también en cuenta, que los prefijos de las tablas a buscar, limitarán los resultados de la búsqueda a tablas con esos prefijos. 
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, getCurrentInstance, onMounted } from 'vue';

export default defineComponent({
  name: 'MdConnectionModal',
  emits: ['ok'],
  setup(props, { emit }) {
    const visible = ref(false);
    const instance = getCurrentInstance();

    onMounted(() => {
      // Listen to parent component events
      if (instance?.parent) {
        const parent = instance.parent as any;
        parent.exposed = parent.exposed || {};

        // Create a method that parent can call
        parent.exposed.showConnectionModal = (event: boolean) => {
          visible.value = event;
        };
      }
    });

    const emitOk = (event: any) => {
      emit('ok', event);
    };

    return {
      visible,
      emitOk,
    };
  },
});
</script>
