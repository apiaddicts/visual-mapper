<template lang="pug">
  .c-endpoint-attribute(v-if="!isDisabledByReadWriteOnly" :class="{ 'c-endpoint-attribute--order2': relationType }")
    // 1 - Caso en el que el primer elemento es un Object (tiene uno o más atributos)
    div(v-if="(endpointAttributes && endpointAttributes != null && endpointAttributes.length > 0) && (relationType || (isSwagger && typeOriginal === 'Object'))" :class="`c-endpoint__subentity--${operation}`")
      b-row.d-flex.align-items-center
        b-col(cols="3").d-flex.align-items-center
          i.far.fa-table.mr-2(title="Entidad relacionada")
          // 1 - Caso Base de datos -> Select autorellenado y desactivado
          multiselect(:placeholder="$t('endpointAttribute.notMapped')"
                      v-if="!isSwagger"
                      v-model="relatedEntity"
                      :options="isSwagger ? tables.map(table => { return {name: table}}) : entities"
                      valueProp="name"
                      label="name"
                      :object="true"
                      disabled
                      :class="{'multiselect_expandido': true}"
                      :tabindex="disabled ? -1 : 0")
            template(#singlelabel="{ value }")
              span.option__name(v-if="!isSwagger") {{ capitalize(value.name) }}
              span.option__name(v-else) {{ value.name }}
            template(#option="{ option }")
              span.option__name(v-if="!isSwagger") {{ capitalize(option.name) }}
              span.option__name(v-else) {{ option.name }}
            template(#nooptions)
              span {{ $t('emptyList') }}
          // 2 - Caso Swagger -> Select vacío y por rellenar
          multiselect(v-else
                      :modelValue="childValue"
                      :placeholder="$t('endpointAttribute.notMapped')"
                      :options="parentAttributes"
                      valueProp="name"
                      label="name"
                      :object="true"
                      @select="fetchChildEntity"
                      @clear="clearChildEntity"
                      :disabled="(isPagedResource && isFirstChild) || hasNotDatabase ? true : false"
                      :searchable="false"
                      :class="{'multiselect_expandido': true, 'multiselect--disabled': disabled}"
                      :tabindex="disabled ? -1 : 0")
            template(#singlelabel="{ value }")
              span.option__name(style="padding-right: 140px") {{ value.name }} : {{ value.type }} : {{ value.db_schema }}.{{ value.table }}
            template(#option="{ option }")
              span.option__name {{ option.name }} : {{ option.type }} : {{ option.db_schema }}.{{ option.table }}
            template(#nooptions)
              span {{ $t('emptyList') }}
        // Checkbox que indica si está activo o no el atributo
        b-col.d-flex.align-items-center.justify-content-center(cols="1")
          b-form-checkbox(v-if="!isSwagger" v-model="active" :disabled="isDisabledByReadWriteOnly")
          // Botón de borrado del atributo
          b-button(variant="link" v-if="isSwagger && !isDisabledByReadWriteOnly" @click="cleanObjectMultiSelect" tabindex="-1")
            i.fas.fa-trash(style="color: red")
          span(v-if="isDisabledByReadWriteOnly")
            i.fa.fa-eye-slash(v-if="readOnlyAttr" style="color: #999; font-size: 0.8em;" v-b-tooltip.hover="$t('endpointAttribute.readOnlyTooltip')")
            i.fa.fa-eye-slash(v-if="writeOnlyAttr" style="color: #999; font-size: 0.8em;" v-b-tooltip.hover="$t('endpointAttribute.writeOnlyTooltip')")
        // Nombre del atributo
        b-col(cols="2")
          b-form-input.text-center(v-model="name" size="sm" :disabled="isSwagger")
      hr.mt-2.mb-1
      // En caso de ser un listado, muestra el texto indicándolo
      div.d-flex.flex-column(v-if="typeOriginal==='Array'")
        .alert.alert-info {{ $t('endpointAttribute.objectList') }}
      // Además, llama recursivamente a este objeto, con los endpointAttributes
      //b-row.d-flex.align-items-center(v-if="relatedEntity")
      b-row.d-flex.align-items-center(v-if="endpointAttributes != null && endpointAttributes.length != null && endpointAttributes.length >= 0")
        b-col.d-flex.flex-column
          md-endpoint-attribute.mt-1(v-for="(eak, index) in endpointAttributes"
                                     :key="index"
                                     :entity="relatedEntity"
                                     :operation="operation"
                                     :attribute-key="eak"
                                     :controllerSource="controllerSource"
                                     :baseEntity="baseEntity"
                                     :entityAttributes="entityAttributes"
                                     :childEntity="childValue"
                                     :childAvailable="!loading"
                                     :isPagedResource="isPagedResource"
                                     :isView="isView"
                                     :originalRelation="relationType"
                                     :baseTable="baseTable"
                                     :baseTableSchema="baseTableSchema"
                                     :disabled="!isMapped"
                                     :isFirstChild="false"
                                     :foreignKeysAttributes="foreignKeysAttributes"
                                     :controllerKey="controllerKey"
                                     :endpointKey="endpointKey")
      b-row(v-else)
        b-col
          .alert.alert-info.mt-2 {{ $t('endpointAttribute.selectDbEntity') }}
    // 2 - Caso en el que el primer elemento es un Array
    template(v-else)
      div.d-flex.flex-column(v-if="typeOriginal==='Array'")
        div(v-if="endpointAttributes && endpointAttributes.length > 0" :class="`c-endpoint__subentity--${operation}`")
          b-row.d-flex.align-items-center.mt-2
            i.far.fa-table.ml-3(title="Entidad relacionada")
            b-col.d-flex.align-items-center.justify-content-center(cols="3")
              multiselect(v-if="isSwagger"
                          :placeholder="$t('endpointAttribute.notMapped')"
                          v-model="entityMapping"
                          :options="childEntity ? childEntityAttributes : (entityAttributes != null ? entityAttributes : [])"
                          valueProp="name"
                          label="name"
                          :object="true"
                          :disabled="hasNotDatabase"
                          :class="{'multiselect_expandido': true, 'multiselect--disabled': disabled}")
                template(#singlelabel="{ value }")
                  span.option__name {{ value.name }}
                  span.option__type(v-if="value.name")  : {{ value.type }}
                template(#option="{ option }")
                  span.option__name {{ option.name }}
                  span.option__type   : {{ option.type }}
                template(#nooptions)
                  span {{ $t('endpointAttribute.noEntitiesLoaded') }}
              multiselect(v-else
                          :placeholder="$t('endpointAttribute.notMapped')"
                          v-model="entityMapping"
                          :options="childEntity ? childEntityAttributes : (entityAttributes != null ? entityAttributes : [])"
                          valueProp="name"
                          label="name"
                          :object="true"
                          :class="{'multiselect_expandido': true, 'multiselect--disabled': disabled}")
                template(#singlelabel="{ value }")
                  span.option__name {{ value.name }}
                  span.option__type(v-if="value.name")  : {{ value.type }}
                template(#option="{ option }")
                  span.option__name {{ option.name }}
                  span.option__type   : {{ option.type }}
                template(#nooptions)
                  span {{ $t('emptyList') }}
            // Checkbox que activa o desactiva el atributo
            b-col.d-flex.align-items-center.justify-content-center(cols="1")
              b-form-checkbox(v-if="!isSwagger" v-model="active")
            // Campo que muestra el nombre del atributo, en este caso el atributo base en un listado
            b-col.d-flex.align-items-center.justify-content-center(cols="2")
              b-form-input.text-center(v-model="name" size="sm" :disabled="isSwagger")
          hr.mt-2.mb-1
          div.alert.alert-info {{ $t('endpointAttribute.objectList') }}
          template(v-for="(eak, index) in endpointAttributes" :key="index")
            md-endpoint-attribute.mt-1(:entity="relatedEntity"
                                       :attribute-key="eak"
                                       :operation="operation"
                                       :controllerSource="controllerSource"
                                       :baseEntity="baseEntity"
                                       :entityAttributes="entityAttributes"
                                       :isPagedResource="isPagedResource"
                                       :isView="isView"
                                       :originalRelation="relationType"
                                       :baseTable="baseTable"
                                       :baseTableSchema="baseTableSchema"
                                       :disabled="!isMapped"
                                       :isFirstChild="false"
                                       :foreignKeysAttributes="foreignKeysAttributes"
                                       :controllerKey="controllerKey"
                                       :endpointKey="endpointKey")
        div(v-else)
          .alert.alert-info {{ $t('endpointAttribute.simpleObjectList') }}
            b-row.d-flex.align-items-center.mt-2
              b-col.d-flex.align-items-center.justify-content-center(cols="3")
                multiselect(v-if="isSwagger"
                            :placeholder="$t('endpointAttribute.notMapped')"
                            v-model="entityMapping"
                            :options="childEntity ? childEntityAttributes : (entityAttributes != null ? entityAttributes : [])"
                            valueProp="name"
                            label="name"
                            :object="true"
                            disabled
                            :class="{'multiselect_expandido': true, 'multiselect--disabled': disabled}")
                  template(#singlelabel="{ value }")
                    span.option__name {{ value.name }}
                    span.option__type(v-if="value.name")  : {{ value.type }}
                  template(#option="{ option }")
                    span.option__name {{ option.name }}
                    span.option__type   : {{ option.type }}
                  template(#nooptions)
                    span {{ $t('emptyList') }}
              b-col.d-flex.align-items-center.justify-content-center(cols="1")
                b-form-checkbox(v-if="!isSwagger" v-model="active")
                b-button(variant="link" v-if="isSwagger" @click="cleanMultiSelect" tabindex="-1")
                  i.fas.fa-trash(style="color: red")
              // Nombre del atributo
              b-col.d-flex.align-items-center.justify-content-center(cols="2")
                b-form-input.text-center(v-model="name" size="sm" :disabled="isSwagger")
              b-col.d-flex.align-items-center.justify-content-center.ml-3(cols="2")
                // Al ser Swagger, el campo del tipo queda desactivado, puesto que se define en el documento
                b-form-input.text-center(v-if="isSwagger"
                             v-model="attributeSwaggerType"
                             size="sm"
                             :disabled="true")
      div(v-else :class="typeOriginal==='Object' ? `c-endpoint__subentity--${operation}` : ''")
        b-row.d-flex.align-items-center
          i.far.fa-table.ml-3(v-if="typeOriginal==='Object'" title="Entidad relacionada")
          b-col.d-flex.align-items-center.justify-content-center(v-if="isView" cols="1")
            b-form-checkbox(v-if="entityMapping == undefined || entityMapping.length == 0" :disabled="entityMapping == undefined || entityMapping.length == 0")
            b-form-checkbox(v-else :disabled="entityMapping == undefined || entityMapping.length == 0" v-model="primaryKey" v-on:change="editPrimaryKey")
          b-col(cols="3" v-if="childEntity ? childAvailable : true")
            .d-flex.align-items-center
              multiselect(:placeholder="$t('endpointAttribute.notMapped')"
                          v-model="entityMapping"
                          :options="childEntity ? childEntityAttributes : (entityAttributes != null ? entityAttributes : [])"
                          valueProp="name"
                          label="name"
                          :object="true"
                          :searchable="true"
                          :disabled="!isSwagger || hasNotDatabase || isLockedBySchema"
                          @select="restartPrimaryKeyIfView"
                          :class="{'multiselect_expandido': true, 'multiselect--disabled': disabled || isLockedBySchema, 'multiselect--locked': isLockedBySchema}"
                          :tabindex="disabled || isLockedBySchema ? -1 : 0")
                template(#singlelabel="{ value }")
                  .multiselect-single-label
                    span.multiselect-single-label-text {{ value.name }} : {{ value.type }}
                template(#option="{ option }")
                  span {{ option.name }} : {{ option.type }}
                template(#nooptions)
                  span {{ $t('emptyList') }}
              i.fas.fa-lock.ml-1(v-if="isLockedBySchema" style="color: #999; font-size: 0.8em;" v-b-tooltip.hover="$t('endpointAttribute.lockedByEndpoint')")
          b-col(cols="3" v-else)
            multiselect(:loading="true" :options="[]")
              template(#nooptions)
                span {{ $t('emptyList') }}
          b-col.d-flex.align-items-center.justify-content-center(cols="1")
            div(v-if="!isSwagger")
              b-form-checkbox(v-model="active" 
                              disabled 
                              v-if="typeOriginal === 'Blob' && disabledBlob")
              b-form-checkbox(v-model="active" 
                              v-else 
                              tabindex="-1")
            // Indica si el campo mapeado tiene un 'resolved_entity'
            b-button(variant="link"
                     v-if="entityMappingHasResolvedEntity != null"
                     v-b-tooltip.hover.bottomleft.html="entityMappingHasResolvedEntityText"
                     tabindex="-1")
              i.fas.fa-info-circle(style="color: blue")
            // Botón de borrado del atributo
            b-button(variant="link" v-if="isSwagger && !isLockedBySchema" @click="cleanMultiSelect" tabindex="-1")
              i.fas.fa-trash(style="color: red")
          // Campo del nombre del atributo
          b-col.d-flex.align-items-center.justify-content-center(cols="2")
            div(v-show="active")
              b-form-input.text-center(v-model="name" size="sm" :disabled="isSwagger")
          b-col.d-flex.align-items-center.justify-content-center(cols="2")
            div(v-show="active")
              b-form-input.text-center(v-if="isSwagger"
                           v-model="attributeSwaggerType"
                           size="sm"
                           :disabled="true")
              multiselect(v-else
                          v-model="type"
                          :options="typesData"
                          :disabled="typeOriginal === 'Object' || type === 'Array'"
                          :class="{'multiselect_expandido': true, 'multiselect--disabled': disabled}")
                template(#nooptions)
                  span {{ $t('emptyList') }}
          b-col.d-flex.align-items-center.justify-content-center(cols="2")
            div(v-show="active")
              md-validation(:validationsEnabled="validationsEnabled"
                            :attributeKey="attributeKey"
                            :type="'attribute'")
          b-col.d-flex.align-items-center.justify-content-center(v-if="controllerSource !== 'asyncapi'" cols="1")
            div(v-show="active")
              md-anonymization-selector(v-model="anonymization")
        div.d-flex.flex-column(v-if="typeOriginal==='Object'")
          div(v-if="endpointAttributes && endpointAttributes.length > 0")
            hr.mt-2.mb-2
            template(v-for="(eak, index) in endpointAttributes" :key="index")
              md-endpoint-attribute.mt-1(:entity="relatedEntity"
                                         :attribute-key="eak"
                                         :operation="operation"
                                         :controllerSource="controllerSource"
                                         :baseEntity="baseEntity"
                                         :entityAttributes="entityAttributes"
                                         :isPagedResource="isPagedResource"
                                         :isView="isView"
                                         :originalRelation="relationType"
                                         :baseTable="baseTable"
                                         :baseTableSchema="baseTableSchema"
                                         :disabled="!isMapped"
                                         :isFirstChild="false"
                                         :foreignKeysAttributes="foreignKeysAttributes"
                                         :controllerKey="controllerKey"
                                         :endpointKey="endpointKey")
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  watch,
  onMounted,
  inject,
  nextTick,
} from 'vue';
import Multiselect from '@vueform/multiselect';
import { nanoid } from 'nanoid';
import MdValidation from '@/components/endpoint/MdValidation.vue';
import MdAnonymizationSelector from '@/components/anonymization/MdAnonymizationSelector.vue';
import { EndpointAttributeStoreObject } from '@/store/endpoint-attributes/state';
import { KeyValue } from '@/models/KeyValue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'MdEndpointAttribute',
  components: {
    Multiselect,
    MdValidation,
    MdAnonymizationSelector,
  },
  props: {
    attributeKey: { type: String, required: true },
    entity: { type: String, required: true },
    operation: { type: String, required: true },
    mapping: { type: String, required: true },
    validationsEnabled: { type: Boolean, required: true },
    controllerSource: { type: String, required: true },
    baseEntity: { type: String, required: true },
    entityAttributes: { type: Array, default: () => [] },
    childEntity: { type: Object, default: null },
    childAvailable: { type: String, default: '' },
    isPagedResource: { type: [Boolean, Object], default: false },
    isFirstChild: { type: Boolean, default: false },
    isView: { type: Boolean, default: false },
    originalRelation: { type: String, default: '' },
    baseTable: { type: String, default: '' },
    baseTableSchema: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    foreignKeysAttributes: { type: Array, default: () => [] },
    controllerKey: { type: String, default: '' },
    endpointKey: { type: String, default: '' },
  },
  setup(props) {
    const store = useStore();
    const { t } = useI18n();
    const $toast: any = inject('$toast');

    const capitalize = (value: string) => {
      if (!value) return '';
      return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const typesData: Array<string> = [
      'Boolean', 'Date', 'DateTime', 'Double', 'Float', 'Integer', 'LocalDate', 'LocalDateTime', 'Long', 'String', 'ZonedDateTime',
    ];

    const config = {
      headers: { 'x-datasource-id': store.state.connectionStore.id },
    };

    const childValue = ref<any>(null);
    const loading = ref(false);
    const baseEntityHasChanged = ref(false);

    const typeOriginal = computed(() => store.state.endpointAttributes._[props.attributeKey].type);
    const entityMappingType = computed<any>(() => store.state.endpointAttributes._[props.attributeKey].entity_mapping.type);
    const entityMappingTypeOfArray = computed<any>(() => store.state.endpointAttributes._[props.attributeKey].type_of_array);

    const isSwagger = computed(() => (props.controllerSource === 'swagger' || props.controllerSource === 'asyncapi' || props.controllerSource === undefined));
    const tables = computed(() => store.state.entities.tables);
    const entities = computed<Array<any>>(() => store.getters['entities/exportData'].entities);
    const endpointAttributes = computed<string[]>(() => store.state.endpointAttributes._[props.attributeKey].attributes);

    const type = computed({
      get: (): any => {
        let typeVal: string;

        if (!isSwagger.value) {
          if (store.state.endpointAttributes._[props.attributeKey].entity_mapping != null
          && store.state.endpointAttributes._[props.attributeKey].entity_mapping.type !== '') {
            typeVal = store.state.endpointAttributes._[props.attributeKey].entity_mapping.type;
          }
          else if (store.state.endpointAttributes._[props.attributeKey].relatedEntity !== '') {
            typeVal = store.state.endpointAttributes._[props.attributeKey].relatedEntity;
          }
          else {
            typeVal = store.state.endpointAttributes._[props.attributeKey].type;
          }
        }
        else {
          typeVal = store.state.endpointAttributes._[props.attributeKey].type || '';
        }

        return typeVal || '';
      },
      set: (value: any) => {
        store.commit('endpointAttributes/SET_TYPE', {
          key: props.attributeKey,
          value,
        });
      },
    });

    const entityMapping = computed({
      get: (): any => {
        let variable = store.state.endpointAttributes._[props.attributeKey].entity_mapping;
        if (variable.name === '') {
          variable = [];
        }
        return variable;
      },
      set: (value: any) => {
        if (isSwagger.value) {
          const updatedValue = { ...value };

          if (endpointAttributes.value && endpointAttributes.value.length === 0 && typeOriginal.value === 'Array') {
            updatedValue.type_of_array = entityMappingTypeOfArray.value;
          }

          if (updatedValue.name === '' && updatedValue.type === '') {
            updatedValue.is_calculated = true;
          }

          store.commit('endpointAttributes/SET_ENTITYMAPPING', {
            key: props.attributeKey,
            value: updatedValue,
          });
        } else {
          store.commit('endpointAttributes/SET_ENTITYMAPPING', {
            key: props.attributeKey,
            value,
          });
        }
      },
    });

    const onBaseEntityChanged = (val: string) => {
      baseEntityHasChanged.value = true;
      if (isSwagger.value && props.isPagedResource && props.isFirstChild) {
        const updatedPagedResource = { ...(props.isPagedResource as Record<string, any>), relatedEntity: val };
        store.commit('endpointAttributes/SET_PAGED_RESOURCE', {
          key: props.attributeKey,
          value: updatedPagedResource,
        });
      }
      childValue.value = null;
    };

    watch(() => props.baseEntity, onBaseEntityChanged, { immediate: true });

    // Función compartida para intentar auto-seleccionar la tabla intermedia
    // eslint-disable-next-line no-use-before-define
    const tryAutoSelectChildEntity = () => {
      if (childValue.value !== null) return; // ya seleccionado manualmente o por mount anterior
      const em = store.state.endpointAttributes._[props.attributeKey]?.entity_mapping;
      if (!em?.foreign_table && (!em?.type || em.type === '')) return;
      // eslint-disable-next-line no-use-before-define
      const opts = parentAttributes.value;
      if (!opts.length) return;
      const matchingOption = opts.find(
        (opt: any) => (em.foreign_table && opt.table === em.foreign_table)
          || (em.type && (opt.type === em.type || opt.type?.toLowerCase() === em.type.toLowerCase())),
      );
      if (matchingOption) {
        childValue.value = matchingOption;
        // eslint-disable-next-line no-use-before-define
        autoMapChildAttributes((matchingOption as any).name);

        // Para YAML enriquecido: los sub-atributos ya tienen entity_mapping.name seteado
        // desde el import, pero autoMapChildAttributes los saltea. Bloquearlos aquí.
        const childAttrKeys = endpointAttributes.value;
        if (childAttrKeys?.length) {
          childAttrKeys.forEach((childKey: string) => {
            const childAttr = store.state.endpointAttributes._[childKey];
            if (childAttr?.entity_mapping?.name && !childAttr.mappedByEndpoint) {
              store.commit('endpointAttributes/SET_MAPPED_BY_ENDPOINT', {
                key: childKey,
                value: 'imported',
              });
            }
          });
        }
      }
    };

    onMounted(() => {
      const em = store.state.endpointAttributes._[props.attributeKey]?.entity_mapping;
      if (!em?.type || em.type === '' || !endpointAttributes.value?.length) {
        // Fallback original: restaurar childValue si la entidad está en el store
        if (em?.name && em.name !== '' && store.state.entities._[em.type?.toLowerCase()] !== undefined) {
          childValue.value = {
            name: em.type, table: store.state.entities._[em.type.toLowerCase()].table, db_schema: store.state.entities._[em.type.toLowerCase()].db_schema, type: em.type, resolved_entity: em.type,
          };
        }
        return;
      }
      tryAutoSelectChildEntity();
    });

    const attributeSwaggerType = computed(() => {
      if (type.value === 'Array' || type.value === 'array') {
        return entityMappingTypeOfArray.value;
      }
      if (type.value === 'Object' || type.value === 'object') { 
        return entityMappingType.value;
      }
      if (type.value === 'ZonedDateTime') {
        return 'LocalDateTime';
      }
      return type.value;
    });

    const isMapped = computed<boolean>(() => {
      const em = store.state.endpointAttributes._[props.attributeKey].entity_mapping;
      return em.name !== '' || (props.isFirstChild === true && typeOriginal.value === 'Array');
    });

    const entityMappingHasResolvedEntity = computed<string | null>(() => {
      if (entityMapping.value !== undefined && entityMapping.value.resolved_entity !== undefined && entityMapping.value.name !== null && entityMapping.value.resolved_entity !== '') {
        return entityMapping.value.resolved_entity;
      }

      return null;
    });

    const entityMappingHasResolvedEntityText = computed<string>(() => {
      const attributeTable = store.state.endpointAttributes._[props.attributeKey].entity_mapping.foreign_table;
      if (attributeTable !== undefined) {
        return t('endpointAttribute.additionalRequired')
          .toString()
          .replaceAll('%replace1%', entityMapping.value.name)
          .replaceAll('%replace2%', entityMapping.value.resolved_entity)
          .replaceAll('%replace3%', attributeTable.toUpperCase());
      }
      return '';
    });
  
    const childEntityAttributes = computed<string>(() => {
      const found = entities.value.find((entity) => entity.table === props.childEntity?.table);
      return found?.attributes || [];
    });

    /*
   * Obtenemos el campo NAME del atributo
   */
    const name = computed({
      get: (): string => store.state.endpointAttributes._[props.attributeKey].name,
      set: (value) => {
        store.commit('endpointAttributes/SET_NAME', {
          key: props.attributeKey,
          value,
        });
      },
    });

    const disabledBlob = computed(() => (props.operation === 'POST' && props.mapping === '/get') || (props.operation === 'GET/' && props.mapping !== ''));

    const readOnlyAttr = computed(() => store.state.endpointAttributes._[props.attributeKey]?.readOnly);
    const writeOnlyAttr = computed(() => store.state.endpointAttributes._[props.attributeKey]?.writeOnly);

    const isDisabledByReadWriteOnly = computed(() => {
      const attr = store.state.endpointAttributes._[props.attributeKey];
      if (!attr) return false;
      if (!props.endpointKey) return false;

      const endpoint = store.state.endpoints._[props.endpointKey];
      if (!endpoint) return false;

      const isInRequestBody = endpoint.requestBody?.attributes?.includes(props.attributeKey);

      // readOnly: no debe estar en request body (POST/PUT/PATCH)
      if (attr.readOnly && isInRequestBody) return true;

      // writeOnly: no debe estar en response
      if (attr.writeOnly && !isInRequestBody) return true;

      return false;
    });

    const active = computed({
      get: () => {
        if (isDisabledByReadWriteOnly.value) return false;
        return store.state.endpointAttributes._[props.attributeKey].active;
      },
      set: (value) => {
        if (isDisabledByReadWriteOnly.value) return;
        store.commit('endpointAttributes/SET_ISACTIVE', {
          key: props.attributeKey,
          value,
        });
      },
    });

    const primaryKey = computed({
      get: () : boolean => {
        const attributes = props.entityAttributes as any[];

        if (typeof attributes === 'object' && attributes.length !== undefined) {
          for (let i = 0; i < attributes.length; i += 1) {
            const attribute = attributes[i];
            if (attribute !== undefined && attribute !== null
            && attribute.column !== undefined
            && attribute.column.primary_key !== undefined
            && (props.originalRelation === undefined || props.originalRelation !== 'ONE_TO_MANY' || (props.originalRelation !== undefined && props.isView))
            && attribute.name === name.value) {
              return attribute.column.primary_key;
            }
          }
        }

        return false;
      },
      set: () => {
        const mappingName = store.state.endpointAttributes._[props.attributeKey].entity_mapping.name;
        const entityAttrs = props.entityAttributes as any[];
        let changed = false;

        if (typeof entityAttrs === 'object' && entityAttrs.length !== undefined) {
          for (let i = 0; i < entityAttrs.length; i += 1) {
            const attribute = entityAttrs[i];
            if (attribute !== undefined && attribute !== null
              && attribute.column !== undefined
              && attribute.column.primary_key !== undefined
              && attribute.name === mappingName)
            {
              attribute.column.primary_key = !attribute.column.primary_key;
              entityAttrs[i] = attribute;
              changed = true;
            }
          }

          if (changed) {
            for (let i = 0; i < entities.value.length; i += 1) {
              if (entities.value[i].name === props.entity) {
                const entityToUpdate = entities.value[i];
                entityToUpdate.attributes = entityAttrs as any[];
                store.commit('entities/UPDATE', {
                  key: props.entity,
                  value: entityToUpdate,
                });
                break;
              }
            }
          }
        }
      },
    });

    const relationType = computed<string>(() => store.state.endpointAttributes._[props.attributeKey].relation_type);

    /**
   * Buscamos en el store de entities a través del
   * nombre del atributo del endpoint si es PK o no.
   */
    const isPrimaryKey = (attrName: string): any => {
      if (props.entity && store.state.entities._[(props.entity).toLowerCase()]) {
        const entityAttrs = store.state.entities._[(props.entity).toLowerCase()].attributes;
        return entityAttrs.filter((d: any) => {
          if (d.name === attrName) {
            if (d.column) return d.column.primary_key;
          }
          return false;
        });
      }
      return null;
    };

    const nameWithLang = ({ name: attrName, type: attrType }: any) => `${attrName} : ${attrType}`;

    const relatedEntity = computed({
      get() {
        if (store.state.endpointAttributes._[props.attributeKey].entity_mapping !== null
        && store.state.endpointAttributes._[props.attributeKey].entity_mapping.type !== '') 
        {
          return store.state.endpointAttributes._[props.attributeKey].entity_mapping.type;
        }
    
        return store.state.endpointAttributes._[props.attributeKey].relatedEntity;
      },      
      set: (value) => {
        // Asigna entidad relacionada
        store.commit('endpointAttributes/SET_ENTITYMAPPING', {
          key: props.attributeKey,
          value: { name: value.name, type: 'Object' }, // eslint-disable-line
        });
    
        store.commit('endpointAttributes/SET_RELATEDENTITY', {
          key: props.attributeKey,
          value: value.name,
        });
    
        const nuevosKeys : Array<string> = [];
        const responseDataAttributes = store.state.entities._[(value.name).toLowerCase()].attributes;
    
        responseDataAttributes.forEach((elAttribute: EndpointAttributeStoreObject) => {
          const newAttr = { ...elAttribute };
          newAttr.active = true;
          newAttr.entity_mapping = {
            name: '',
            type: '',
            type_of_array: '',
          };
      
          const kveaso: KeyValue<EndpointAttributeStoreObject> = {
            key: nanoid(10),
            value: newAttr,
          };
      
          store.commit('endpointAttributes/ADD', kveaso);
      
          nuevosKeys.push(kveaso.key);
        });
    
        store.commit('endpointAttributes/UPDATE_ATTRIBUTES', {
          key: props.attributeKey,
          value: nuevosKeys,
        });
      },
    });

    const relatedEntityAttributes = computed(() => {
      const relEntity = store.state.endpointAttributes._[props.attributeKey].relatedEntity;
      return store.state.entities._[relEntity.toLowerCase()].attributes;
    });

    const hasRelation = (attributeName: string) => {
      let entity;
      if (isSwagger.value) { entity = props.baseEntity; }
      else { entity = props.entity; }
      const { attributes } = store.state.entities._[(entity).toLowerCase()];
      return attributes.filter((d: any) => d.name === attributeName);
    };

    const parentAttributes = computed((): string[] => {
      if (props.baseEntity !== null) {
        const filteredAttributes: any[] = [];

        // Solo incluir entidades que el usuario haya añadido en "Entidades adicionales a cargar"
        const controller: any = props.controllerKey ? store.state.controllers._[props.controllerKey] : null;
        if (controller?.additionalEntities) {
          Array.from(controller.additionalEntities).forEach((additionalTable: any) => {
            const parts = additionalTable.split('.');
            const schema = parts.length > 1 ? parts[0] : 'public';
            const tableName = parts.length > 1 ? parts[1] : parts[0];
            const loadedEntity: any = Object.values(store.state.entities._).find(
              (e: any) => e.table === tableName && e.db_schema === schema,
            );
            filteredAttributes.push({
              name: loadedEntity?.name || tableName,
              type: loadedEntity?.name || tableName,
              table: tableName,
              db_schema: schema,
              resolved_entity: loadedEntity?.name,
            });
          });
        }

        filteredAttributes.push({
          name: 'ENTIDAD BASE', type: props.baseEntity, table: props.baseTable, db_schema: props.baseTableSchema,
        });

        return filteredAttributes;
      }

      return [];
    });

    /**
     * Auto-mapea los sub-atributos de la tabla intermedia si el mismo schema
     * ya está mapeado en otro endpoint (por nombre de atributo coincidente).
     * Los atributos auto-mapeados se bloquean con mappedByEndpoint.
     */
    const autoMapChildAttributes = (entityName: string) => {
      const childAttrKeys = endpointAttributes.value;
      if (!childAttrKeys || childAttrKeys.length === 0) return;

      // Buscar en todos los endpoints un schemaRef que coincida con el nombre de la entidad
      const endpoints = store.state.endpoints._;
      const sourceMappings: Record<string, any> = {};
      let sourceEndpointKey = '';

      Object.entries(endpoints).forEach(([epKey, ep]: [string, any]) => {
        if (Object.keys(sourceMappings).length > 0) return; // Ya encontramos uno

        const sections = [ep.requestBody, ep.responseData];
        sections.forEach((section: any) => {
          if (!section?.attributes || Object.keys(sourceMappings).length > 0) return;
          // Coincidir por entity de la sección, entity del endpoint, o schemaRef (case-insensitive)
          const en = entityName.toLowerCase();
          const sectionMatch = section.entity && section.entity.toLowerCase() === en;
          const epMatch = ep.entity && ep.entity.toLowerCase() === en;
          const schemaMatch = section.schemaRef && section.schemaRef.toLowerCase() === en;
          if (!sectionMatch && !epMatch && !schemaMatch) return;

          section.attributes.forEach((attrKey: string) => {
            const attr = store.state.endpointAttributes._[attrKey];
            if (attr?.entity_mapping?.name) {
              sourceMappings[attr.name] = attr.entity_mapping;
              sourceEndpointKey = epKey;
            }
          });
        });
      });

      if (Object.keys(sourceMappings).length === 0) return;

      // Aplicar los mapeos encontrados a los sub-atributos de la tabla intermedia
      childAttrKeys.forEach((childKey: string) => {
        const childAttr = store.state.endpointAttributes._[childKey];
        if (!childAttr || childAttr.entity_mapping?.name) return; // Ya mapeado

        const existingMapping = sourceMappings[childAttr.name];
        if (existingMapping) {
          store.commit('endpointAttributes/SET_ENTITYMAPPING', {
            key: childKey,
            value: existingMapping,
          });
          store.commit('endpointAttributes/SET_MAPPED_BY_ENDPOINT', {
            key: childKey,
            value: sourceEndpointKey,
          });
        }
      });
    };

    // Watch parentAttributes para cuando ADD_ADDITIONAL_ENTITY se hace DESPUÉS de que el
    // componente ya montó (timing: importControllers monta componentes antes de que se detecten
    // entidades adicionales). Cuando parentAttributes gana nuevas opciones, re-intentar la selección.
    watch(
      () => parentAttributes.value.length,
      () => {
        if (isSwagger.value) tryAutoSelectChildEntity();
      },
    );

    const clearChildMappingsOnly = () => {
      const childAttrKeys = endpointAttributes.value;
      if (!childAttrKeys || childAttrKeys.length === 0) return;
      // Flag global en el store para que los watchers de los hijos no disparen unpropagateMapping
      store.commit('endpointAttributes/SET_SUPPRESS_UNPROPAGATE', true);
      childAttrKeys.forEach((childKey: string) => {
        const childAttr = store.state.endpointAttributes._[childKey];
        if (!childAttr) return;
        store.commit('endpointAttributes/SET_ENTITYMAPPING', {
          key: childKey,
          value: { name: '', type: '', type_of_array: '' },
        });
        store.commit('endpointAttributes/SET_MAPPED_BY_ENDPOINT', {
          key: childKey,
          value: '',
        });
      });
      nextTick(() => {
        store.commit('endpointAttributes/SET_SUPPRESS_UNPROPAGATE', false);
      });
    };

    const fetchChildEntity = (value: any) => {
      // Limpiar solo los mapeos locales de la tabla intermedia al cambiar tabla
      clearChildMappingsOnly();

      baseEntityHasChanged.value = false;
      childValue.value = value;

      if (isSwagger.value) {
        const tableToFind = `${value.db_schema}.${value.table}`;
        const foundEntity: any = Object.values(store.state.entities._).find((entity: any): any => `${entity.db_schema}.${entity.table}` === tableToFind);

        if (!foundEntity) {
          loading.value = true;
          // Obtiene la información de la entidad relacionada via DB Explorer
          const tableName = value.table;
          store.dispatch('connectionStore/fetchConfigs', [tableName])
            .then((data: any) => {
              if (!data || !data.entities || data.entities.length === 0) {
                loading.value = false;
                return;
              }
              const entityObj = data.entities.find(
                (entity: any) => entity.table === value.table && entity.db_schema === value.db_schema,
              ) || data.entities[0];
              const entityName = entityObj?.name;
              store.dispatch('entities/importEntities', data.entities);

              store.commit('endpointAttributes/SET_ENTITYMAPPING', {
                key: props.attributeKey,
                value: { name: value.name, type: value.type, resolved_entity: value.resolved_entity },
              });
              if (entityName) {
                store.commit('endpointAttributes/SET_RELATEDENTITY', {
                  key: props.attributeKey,
                  value: entityName,
                });
                // Auto-mapear y bloquear sub-atributos si el schema ya está mapeado
                autoMapChildAttributes(entityName);
              }

              loading.value = false;
            })
            .catch((err: any) => {
              loading.value = false;
              $toast.error(err);
            });
        }
        else {
          store.commit('endpointAttributes/SET_ENTITYMAPPING', {
            key: props.attributeKey,
            value: {
              name: value.name, type: value.type, foreign_table: value.foreign_table, foreign_schema: value.foreign_schema, resolved_entity: value.resolved_entity,
            },
          });

          store.commit('endpointAttributes/SET_RELATEDENTITY', {
            key: props.attributeKey,
            value: foundEntity.name,
          });

          // Auto-mapear y bloquear sub-atributos si el schema ya está mapeado
          autoMapChildAttributes(foundEntity.name);
        }
      }
    };

    const clearChildEntity = () => {
      clearChildMappingsOnly();
      childValue.value = null;
    };

    const checkAndLoadRelatedEntity = () => {
      const { name: mappingName } = store.state.endpointAttributes._[props.attributeKey].entity_mapping;
      const isRelated = mappingName.includes('.');
      if (isRelated) {
        const attributeTable = store.state.endpointAttributes._[props.attributeKey].entity_mapping.foreign_table;
        loading.value = true;
        store.dispatch('connectionStore/fetchConfigs', [attributeTable])
          .then((data: any) => {
            if (!data || !data.entities || data.entities.length === 0) {
              loading.value = false;
              return;
            }
            const entityObj = data.entities.find((entity: any) => entity.table === attributeTable) || data.entities[0];
            const entityName = entityObj?.name;
            store.dispatch('entities/importEntities', data.entities);
            if (entityName) {
              store.commit('endpointAttributes/SET_RELATEDENTITY', {
                key: props.attributeKey,
                value: entityName,
              });
            }
            loading.value = false;
          })
          .catch((err: any) => {
            loading.value = false;
            $toast.error(err);
          });
      }
      return isRelated;
    };

    /* get additionalEntityRequiredText() {
    const attributeTable = this.$store.state.endpointAttributes._[this.attributeKey].entity_mapping.foreign_table;
    if (attributeTable !== undefined) {
      return this.$t('endpointAttribute.additionalRequired').toString().replaceAll('%replace%', attributeTable.toUpperCase());
    }
  } */

    const cleanMultiSelect = () => {
      const mappingName = store.state.endpointAttributes._[props.attributeKey].entity_mapping.name;
      const primaryKeyField = isPrimaryKey(mappingName);

      if (props.isView && primaryKeyField !== undefined && primaryKeyField.length > 0) {
        primaryKey.value = false; // This will trigger the setter
      }

      if (entityMapping.value !== null) {
        const initValue = {
          is_calculated: true,
          name: '',
          type: '',
          type_of_array: '',
          resolved_entity: '',
        };

        store.commit('endpointAttributes/SET_ENTITYMAPPING', {
          key: props.attributeKey,
          value: initValue,
        });
      }
    };

    const cleanObjectMultiSelect = () => {
      store.commit('endpointAttributes/RESET_ENTITYMAPPING', endpointAttributes.value);
      baseEntityHasChanged.value = true;

      if (entityMapping.value !== null) {
        const initValue = {
          is_calculated: true,
          name: '',
          type: '',
          type_of_array: '',
          resolved_entity: '',
        };

        store.commit('endpointAttributes/SET_ENTITYMAPPING', {
          key: props.attributeKey,
          value: initValue,
        });
        childValue.value = null;
      }
    };

    const restartPrimaryKeyIfView = () => {
      const mappingName = store.state.endpointAttributes._[props.attributeKey].entity_mapping.name;
      const primaryKeyField = isPrimaryKey(mappingName);

      if (props.isView && primaryKeyField !== undefined && primaryKeyField.length > 0) {
        primaryKey.value = false; // This will trigger the setter
      }
    };

    const anonymization = computed({
      get: (): string => store.state.endpointAttributes._[props.attributeKey]?.anonymization || '',
      set: (value: string) => {
        store.commit('endpointAttributes/SET_ANONYMIZATION', {
          key: props.attributeKey,
          value: value || undefined,
        });
      },
    });

    const hasNotDatabase = computed<boolean>(() => store.state.applicationStore.archetype_has_database === false);

    const isLockedBySchema = computed(() => {
      const attr = store.state.endpointAttributes._[props.attributeKey];
      return !!attr?.mappedByEndpoint;
    });

    const getSchemaContext = () => {
      if (!props.endpointKey) return null;
      const endpoint = store.state.endpoints._[props.endpointKey];
      if (!endpoint) return null;

      const inRequest = endpoint.requestBody?.attributes?.includes(props.attributeKey);
      const inResponse = endpoint.responseData?.attributes?.includes(props.attributeKey);

      if (inRequest) {
        return {
          context: 'request' as const,
          schemaRef: endpoint.requestBody?.schemaRef,
          entity: endpoint.entity,
        };
      }
      if (inResponse) {
        return {
          context: 'response' as const,
          schemaRef: endpoint.responseData?.schemaRef,
          entity: endpoint.entity,
        };
      }

      // Tabla intermedia: el atributo no está directo en request/response,
      // usar el nombre de la entidad (ej: "Pet") para propagar a los demás endpoints
      if (props.entity) {
        return { context: 'response' as const, schemaRef: props.entity, entity: props.entity };
      }

      return null;
    };

    const propagateMappingToSchema = () => {
      const ctx = getSchemaContext();
      if (!ctx) return;
      // Necesitamos al menos schemaRef o entity para propagar
      if (!ctx.schemaRef && !ctx.entity) return;

      store.dispatch('endpointAttributes/propagateMapping', {
        sourceEndpointKey: props.endpointKey,
        attributeKey: props.attributeKey,
        schemaRef: ctx.schemaRef,
        entity: ctx.entity,
        context: ctx.context,
      });
    };

    const unpropagateMappingFromSchema = () => {
      const ctx = getSchemaContext();
      if (!ctx) return;
      if (!ctx.schemaRef && !ctx.entity) return;

      store.dispatch('endpointAttributes/unpropagateMapping', {
        sourceEndpointKey: props.endpointKey,
        attributeKey: props.attributeKey,
        schemaRef: ctx.schemaRef,
        entity: ctx.entity,
        context: ctx.context,
      });
    };

    // Watch entity_mapping changes to propagate/unpropagate to endpoints sharing the same schema
    watch(
      () => store.state.endpointAttributes._[props.attributeKey]?.entity_mapping?.name,
      (newName, oldName) => {
        if (store.state.endpointAttributes.suppressUnpropagate) return;
        if (isLockedBySchema.value) return;
        if (newName) {
          propagateMappingToSchema();
        } else if (oldName && !newName) {
          unpropagateMappingFromSchema();
        }
      },
    );

    // Watch anonymization changes to propagate to endpoints sharing the same schema
    watch(
      () => store.state.endpointAttributes._[props.attributeKey]?.anonymization,
      () => {
        const ctx = getSchemaContext();
        if (!ctx) return;
        if (!ctx.schemaRef && !ctx.entity) return;
        store.dispatch('endpointAttributes/propagateAnonymization', {
          sourceEndpointKey: props.endpointKey,
          attributeKey: props.attributeKey,
          schemaRef: ctx.schemaRef,
          entity: ctx.entity,
          context: ctx.context,
        });
      },
    );

    return { // eslint-disable-line
      capitalize,
      typesData,
      config,
      childValue,
      loading,
      baseEntityHasChanged,
      attributeSwaggerType,
      isSwagger,
      tables,
      entityMappingType,
      entityMappingTypeOfArray,
      isMapped,
      entityMapping,
      entityMappingHasResolvedEntity,
      entityMappingHasResolvedEntityText,
      childEntityAttributes,
      name,
      type,
      active,
      disabledBlob,
      entities,
      typeOriginal,
      endpointAttributes,
      relationType,
      primaryKey,
      isPrimaryKey,
      nameWithLang,
      relatedEntity,
      relatedEntityAttributes,
      hasRelation,
      parentAttributes,
      fetchChildEntity,
      clearChildEntity,
      checkAndLoadRelatedEntity,
      cleanMultiSelect,
      cleanObjectMultiSelect,
      restartPrimaryKeyIfView,
      hasNotDatabase,
      anonymization,
      isLockedBySchema,
      isDisabledByReadWriteOnly,
      readOnlyAttr,
      writeOnlyAttr,
      propagateMappingToSchema,
      unpropagateMappingFromSchema,
    };
  },
});
</script>
