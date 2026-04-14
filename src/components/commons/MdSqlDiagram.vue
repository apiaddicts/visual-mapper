<template lang="pug">
div
  div(v-if="!diagram" style="color: #6c757d; font-style: italic; padding: 20px; text-align: center")
    | No se pudo generar el diagrama. Verifica que el SQL sea válido.
  div(v-else)
    div(ref="diagramRef" style="overflow: auto; background: #fff; padding: 16px; border-radius: 4px")
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, onMounted, watch, nextTick } from 'vue';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

let diagramIdCounter = 0;

export default defineComponent({
  name: 'MdSqlDiagram',
  props: {
    diagram: { type: String, default: '' },
  },
  setup(props) {
    const diagramRef = ref<HTMLElement | null>(null);

    const renderDiagram = async () => {
      if (!props.diagram) return;
      await nextTick();
      if (!diagramRef.value) return;

      console.log('[MdSqlDiagram] Diagrama a renderizar:\n', props.diagram);

      try {
        diagramIdCounter += 1;
        const id = `mermaid-er-${diagramIdCounter}-${Date.now()}`;
        const { svg } = await mermaid.render(id, props.diagram);
        if (diagramRef.value) {
          diagramRef.value.innerHTML = svg;
        }
      } catch (e) {
        console.error('[MdSqlDiagram] Error de Mermaid:', e);
        if (diagramRef.value) {
          diagramRef.value.innerHTML = `<pre style="font-size:12px; color:#333; white-space: pre-wrap">${props.diagram}</pre>`;
        }
      }
    };

    onMounted(() => {
      // Esperar a que el modal termine su animación antes de renderizar
      setTimeout(() => renderDiagram(), 350);
    });

    watch(() => props.diagram, () => {
      renderDiagram();
    });

    return { diagramRef };
  },
});
</script>
