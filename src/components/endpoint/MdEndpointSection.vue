<template lang="pug">
  div
    div
      .c-endpoint-section
        .bg-white.p-2.mb-3.small.font-weight-bold {{ title }}
        .p-1
          slot
    div(v-if="parameters != null && parameters.length > 0")
      div
        //.px-4.py-2.small.font-weight-bold Parámetros del recurso
        b-row.d-flex.align-items-center.mt-2.px-4
          //div.alert.alert-info En el caso de tener un identificador en la url (por ejemplo, {aplicacion} o {id}), definido en el Swagger, este deberá mapearse con un campo de la entidad si el identificador no es {id}. En caso contrario, se tomará la clave primaria que dicha entidad tenga, si está conformada por una columna y tiene, por tanto, un único valor
          b-col(cols="3")
            .px-2.py-1.small.text-center
              span Nombre y tipo en la entidad
          b-col(cols="1")
          b-col(cols="3")
            .px-2.py-1.small.text-center
              span Nombre y tipo en el swagger
          b-col(cols="1")
            .px-2.py-1.small.text-center
              span Formato
          b-col(cols="3")
            .px-2.py-1.small.text-center
              span {{ $t('endpointAttributesTable.validations') }}
        template(v-for="(parameter, index) in parameters")
          b-row.d-flex.align-items-start.mt-2.px-4
            b-col.d-flex.align-items-center.justify-content-center(cols="3")
              multiselect(
                v-if="parameter.type !== null && parameter.in === 'path'"
                :id="`entityMapping-${index}`"
                placeholder="No mapeado"
                v-model='parameter.entity_mapping'
                :options="formattedEntityAttributes"
                valueProp="name"
                label="displayLabel"
                :object="true"
                :searchable="true"
              ).px-2
                template(#nooptions)
                  span {{ $t('emptyList') }}
              div(v-else).alert.alert-info Al no ser un parámetro path, no se puede mapear contra la entidad, pero sí usarse en filtros  
              div(v-if="parameter.required" style="color: red; font-size: 26px") *
              div(v-else style="font-size: 38px") &nbsp; 
            b-col.d-flex.align-items-center.justify-content-center(cols="1")
              // Botón de borrado del atributo
              b-button(v-if="parameter.type !== null && parameter.in === 'path'" variant="link" @click="cleanObjectMultiSelect(parameter, index)" tabindex="-1")
                i.fas.fa-trash.pb-1(style="color: red")
            b-col.d-flex.align-items-center.justify-content-center(cols="3")
              b-form-input(
                    :model-value="parameterNameAndType(parameter)"
                    size="sm"
                    :disabled="true")
            b-col.d-flex.align-items-center.justify-content-center(cols="1")
              b-form-input(
                    :model-value="parameter.in"
                    size="sm"
                    :disabled="true")
            b-col.align-items-center.justify-content-center(cols="3")
              md-validation(
                    :validationsEnabled="true"
                    :attributeKey="parameter.parameterID"
                    :type="'parameter'")
        .p-3
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import Multiselect from '@vueform/multiselect';
import MdValidation from '@/components/endpoint/MdValidation.vue';

export default defineComponent({
  name: 'MdEndpointSection',
  components: { Multiselect, MdValidation },
  props: {
    title: { type: String, required: true },
    parameters: { type: Array, default: () => [] },
    entity: { type: String, default: '' },
    endpointKey: { type: String, default: '' },
    foreignKeysAttributes: { type: Array, default: () => [] },
  },
  setup(props) {
    const store = useStore();

    const entityAttributes = computed<Array<any>>(() => {
      if (!props.entity || !store.state.entities._[props.entity.toLowerCase()]) {
        return [];
      }
      const { attributes } = store.state.entities._[props.entity.toLowerCase()];
      const attributesData = attributes.map((attribute: any) => ({ name: attribute.name, type: attribute.type }));
      const foreignKeysAttributesData = props.foreignKeysAttributes.map((attribute: any) => ({ name: attribute.name, type: attribute.type }));
      return attributesData.concat(foreignKeysAttributesData);
    });

    // Opciones formateadas con displayLabel para el multiselect
    const formattedEntityAttributes = computed<Array<any>>(() => entityAttributes.value.map((attr: any) => ({
      ...attr,
      displayLabel: `${attr.name} : ${attr.type}`,
    })));

    const parameterNameAndType = (parameter: any): string => `${parameter.name} : ${parameter.type}`;

    const cleanObjectMultiSelect = (parameter: any) => {
      const param = parameter;
      param.entity_mapping = undefined;
    };

    return {
      entityAttributes,
      formattedEntityAttributes,
      parameterNameAndType,
      cleanObjectMultiSelect,
    };
  },
});
</script>
