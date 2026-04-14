<template lang="pug">
  div
    div.d-flex.align-items-center
      multiselect(
        v-model="validationType",
        :options="validationsTypes",
        :disabled="!validationsEnabled"
        :class="{ 'd-none': !validationsEnabled }"
        @select="dispatchAction"
        placeholder="Seleccionar..."
        label="name"
        valueProp="value"
        :object="true"
        :searchable="true"
        :canClear="false"
      )
        template(#nooptions)
          span {{ $t('emptyList') }}
      multiselect(
        v-model="allowedValuesMultiselect",
        placeholder="Añadir validación"
        label="value"
        valueProp="value"
        :options="allowedValuesMultiselect"
        :mode="'tags'"
        :createTag="true"
        :searchable="true"
        @tag="addAllowedValue"
        v-if="validationType && validationType.value === 'allowedValues'"
      )
        template(#nooptions)
          span {{ $t('emptyList') }}
      b-form-input.ml-3(
        size="sm"
        placeholder="Validación a incluir"
        :readonly="!validationsEnabled || !valueInputEnabled"
        :class="{ 'd-none': !validationsEnabled || !valueInputEnabled }"
        v-model='validationValue'
        v-else
        )
      i.fal.fa-plus-circle.ml-2.cursor-pointer(
        @click="addValidation"
        v-if="validationsEnabled")
    div.mt-2(v-if="validationsEnabled")
      .c-validations
        span.c-validations__item-editable(
          v-for="(validation, index) in validations"
          :key="index"
          @click="removeValidation(index)")
          | {{parseValidation(validation.name || validation.type)}}{{validation.value !== undefined ? ' - ' : ''}}{{validation.value}}
    div.mt-2(v-else="validationsEnabled")
      .c-validations
        span.c-validations__item(
          v-for="(validation, index) in validations"
          :key="index")
          | {{parseValidation(validation.name || validation.type)}}{{validation.value !== undefined ? ' - ' : ''}}{{validation.value}}
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';
import Multiselect from '@vueform/multiselect';
import { Validation, AllowedValues } from '../../store/endpoint-attributes/state';
import { KeyValue } from '../../models/KeyValue';

interface ValidationParsing {
    name: string,
    value: string
}

export default defineComponent({
  name: 'MdValidation',
  components: {
    Multiselect,
  },
  props: {
    attributeKey: { type: String, required: true },
    type: { type: String, required: true },
    validationsEnabled: { type: Boolean, required: true },
  },
  setup(props) {
    const store = useStore();

    const validationType = ref<any>(null);
    const validationValue = ref<any>('');
    const validationsArr = ref<Array<Validation>>([]);
    const valueInputEnabled = ref(true);
    const allowedValuesMultiselect = ref<Array<AllowedValues>>([]);

    const validationsTypes: Array<ValidationParsing> = [
      {name: 'Valores permitidos', value: 'allowedValues'},
      {name: 'No nulo', value: 'NotNull'},
      {name: 'Longitud mínima', value: 'MinLength'},
      {name: 'Longitud máxima', value: 'MaxLength'},
      {name: 'Valor mínimo', value: 'MinValue'},
      {name: 'Valor máximo', value: 'MaxValue'},
      {name: 'Valor por defecto', value: 'DefaultValue'},
      {name: 'Expresión regular', value: 'RegExp'},
    ];

    const validations = computed(() => {
      if (props.type !== null && props.type === 'parameter') {
        return store.state.endpointParameters._[props.attributeKey]?.validations || [];
      }

      return store.state.endpointAttributes._[props.attributeKey]?.validations || [];
    });

    const parseValidation = (validationToCheck: string): string => {
      for (let i = 0; i < validationsTypes.length; i++) {
        let validationWithType: ValidationParsing = validationsTypes[i];

        if (validationWithType !== undefined && validationWithType.value === validationToCheck) {
          return validationWithType.name;
        }
      }

      return validationToCheck;
    };

    const getParameter = () => {
      return store.state.endpointParameters._[props.attributeKey];
    };

    const addValidation = () => {
      let validationAdded = false;
      validationsArr.value = validations.value;

      validationsArr.value.forEach((val: any, key: any) => {
        if (val.type === validationType.value) {
          validationsArr.value[key].value = validationValue.value;
          validationAdded = true;
        }
      });

      if (!validationAdded && validationType.value) {
        if (validationType.value.value === 'allowedValues') {
          validationsArr.value.push({
            name: validationType.value.name,
            type: validationType.value.value,
            values: allowedValuesMultiselect.value,
          });
        }
        else {
          validationsArr.value.push({
            name: validationType.value.name,
            type: validationType.value.value,
            value: validationValue.value,
          });
        }
      }

      const validationsKeyValue: KeyValue<Array<Validation>> = {
        key: props.attributeKey,
        value: validationsArr.value,
      };

      // Reset fields validation
      validationType.value = null;
      validationValue.value = '';
      valueInputEnabled.value = true;
      allowedValuesMultiselect.value = [];

      if (props.type === 'parameter') {
        let parameter = getParameter();

        parameter.validations = validationsArr.value;

        store.commit('endpointParameters/UPDATE', {
          key: props.attributeKey,
          value: parameter
        });
      }
      else {
        store.commit('endpointAttributes/SET_VALIDATIONS', validationsKeyValue);
      }
    };

    const removeValidation = (key: number) => {
      validationsArr.value = validations.value;
      validationsArr.value.splice(key, 1);

      if (props.type !== null && props.type === 'parameter') {
        let parameter = getParameter();
        parameter.validations = validationsArr.value;

        store.commit('endpointParameters/UPDATE', {
          key: props.attributeKey,
          value: parameter
        });
      }
      else {
        const validationsKeyValue: KeyValue<Array<Validation>> = {
          key: props.attributeKey,
          value: validationsArr.value,
        };
        store.commit('endpointAttributes/SET_VALIDATIONS', validationsKeyValue);
      }
    };

    const dispatchAction = (actionName: any) => {
      switch (actionName.value) {
        case 'NotNull':
          valueInputEnabled.value = false;
          validationValue.value = true;
          break;
        default:
          valueInputEnabled.value = true;
          validationValue.value = '';
          break;
      }
    };

    const addAllowedValue = (value: string) => {
      const newAllowedValue = {
        value,
      };
      allowedValuesMultiselect.value.push(newAllowedValue);
    };

    return {
      validationType,
      validationValue,
      validationsTypes,
      validationsArr,
      valueInputEnabled,
      allowedValuesMultiselect,
      validations,
      parseValidation,
      addValidation,
      removeValidation,
      dispatchAction,
      addAllowedValue,
    };
  },
});
</script>
