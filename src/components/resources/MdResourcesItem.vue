<template lang="pug">
  .c-resources.border.bg-white.mb-3.p-4(v-if="requestMapping != '/status' && requestMapping != '/files' && requestMapping != '/files/file-id' && requestMapping != '/user-info' && requestMapping != '/user-info/me' && requestMapping != '/users-info/me'")
    div(
       v-if="controllerKey !== undefined"
      :class="[`js-controller-${name}`]"
    )
      div.d-flex.justify-content-between.align-items-center.mb-3
        h2.l-subtitle.font-weight-bold.mb-0 {{ name }}
        .mr-3
          //b-button.color-red(
            variant="link"
            @click="openModal(modalGeneratePartialCode)"
            v-b-tooltip.hover.bottomleft
            :title="$t('header.generateController')"
            disabled)
            i.fas.fa-file-code
          // i.far.fa-trash.color-red.cursor-pointer(@click="deleteResource(controllerKey)" :title="$t('header.deleteController')")
      .form-group.mb-2
        label.small(for='ResourceInputController') {{ $t('resourcesItem.controllerName') }}
        b-form-input#ResourceInputController.form-control(
          type='text'
          :placeholder="$t('resourcesItem.controllerName')"
          v-model='name'
          :state="emptyField(name)"
          aria-describedby="error-empty-controller-name"
          )
        b-form-invalid-feedback(id="error-empty-controller-name") {{ $t('resourcesItem.controllerNameRequired') }}
      .form-group.mb-2
        label.small(for='ResourceInput') {{ $t('resourcesItem.mapping') }}
        b-form-input#ResourceInput.form-control(
          type='text'
          :placeholder="$t('resourcesItem.mapping')"
          v-model='requestMapping'
          :state="emptyField(requestMapping)"
          aria-describedby="error-empty-mapping"
          :disabled="isSwagger"
          )
        b-form-invalid-feedback(id="error-empty-mapping") {{ $t('resourcesItem.mappingRequired') }}
      
      div(v-if="archetypeHasDatabase").form-group.mb-2
        label.small(:for='`${controllerKey}TableResourceInput`') {{ $t('resourcesItem.dbEntity') }}
        multiselect(
          :id='`${controllerKey}TableResourceInput`'
          v-if="!isSwagger"
          :placeholder="$t('resourcesItem.dbEntity')"
          v-model='entity'
          :searchable="true"
          :options="entities"
          :disabled="!isSwagger"
          )
            template(#singlelabel="{ value }")
              span {{ entityTable(value) }}
            template(#option="{ option }")
              span {{ entityTable(option) }}
            template(#nooptions)
              span {{ $t('emptyList') }}
        multiselect(
          v-else
          :id='`${controllerKey}TableResourceInput`'
          :placeholder="$t('resourcesItem.dbEntity')"
          :searchable="true"
          :options="formattedTableOptions"
          v-model="selectedTableValue"
          @change="onTableSelected"
          :loading="loading"
          label="label"
          valueProp="value"
          )
            template(#nooptions)
              span {{ $t('emptyList') }}

      div(v-if="archetypeHasDatabase")
        label.small(:for='`${controllerKey}TableResourceInput`') {{ $t('resourcesItem.additionalEntities') }}
          b-button(
                      variant="link"
                      v-b-tooltip.hover.bottomleft.html="$t('application.entities.additional')"
                      tabindex="-1"
                  )
                      i.fas.fa-info-question(style="color: red")
        multiselect(
            :id='`${controllerKey}TableResourceInput`'
            :placeholder="$t('resourcesItem.additionalEntitiesPlaceholder')"
            :searchable="true"
            :options="tables"
            :close-on-select="false"
            v-model="localAdditionalEntities"
            @select="selectAdditionalEntity"
            @deselect="removeAdditionalEntity"
            :loading="loading"
            mode="tags"
            )
              template(#nooptions)
                span {{ $t('emptyList') }}

      h2.l-subtitle.my-3.font-weight-bold {{ $t('resourcesItem.operations') }}
      div(v-if="archetypeHasDatabase")
        div(v-if="entity")
          md-endpoint(
            v-for="e in endpoints"
            :key="e"
            :endpoint-key="e"
            :baseEntity="entity"
            :entityAttributes="entityAttributes"
            :controller-request-mapping="requestMapping"
            :controller-source="controllerSource"
            :controllerKey="controllerKey"
            :baseTable="entityTable(entity)"
            :baseTableSchema="entityTableSchema(entity)"
            :foreignKeysAttributes="foreignKeysAttributes"
            )
        div(v-else)
          div.alert.alert-info {{ $t('resourcesItem.selectDbEntity') }}
      div(v-else)
        md-endpoint(
              v-for="e in endpoints"
              :key="e"
              :endpoint-key="e"
              :controller-request-mapping="requestMapping"
              :controller-source="controllerSource"
              :controllerKey="controllerKey"
              :foreignKeysAttributes="foreignKeysAttributes"
              )
    md-modal(:modalId="modalGeneratePartialCode")
      md-generate-partial-code(
        :modalId="modalGeneratePartialCode"
        :resourceName="name"
      )
</template>

<script lang="ts">
import {
  defineComponent, ref, computed, inject, 
} from 'vue';
import Multiselect from '@vueform/multiselect';
import MdEndpoint from '@/components/endpoint/MdEndpoint.vue';
import MdModal from '@/components/commons/MdModal.vue';
import MdGeneratePartialCode from '@/components/resources/MdGeneratePartialCode.vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'MdResourcesItem',
  components: {
    MdEndpoint,
    Multiselect,
    MdModal,
    MdGeneratePartialCode,
  },
  props: {
    controllerKey: { type: String, required: true },
    additionalEntitiesToInclude: { type: Array, default: () => [] },
  },
  setup(props) {
    const store = useStore();
    const $bvModal: any = inject('$bvModal');
    const $toast: any = inject('$toast');
    const $selectAdditionalEntity: any = inject('$selectAdditionalEntity');
    const $removeAdditionalEntity: any = inject('$removeAdditionalEntity');
    const $japiPluralUtils: any = inject('$japiPluralUtils');

    const loading = ref(false);
    const foreignKeysAttributes = ref<any[]>([]);
    const archetypeHasDatabase = computed<boolean>(() => store.getters['applicationStore/archetypeHasDatabase']);

    // Computed local para additionalEntities que lee del store (no de la prop)
    // Esto evita el error "trap returned falsish" al usar v-model con una prop
    const localAdditionalEntities = computed({
      get: () => {
        const controller = store.state.controllers._[props.controllerKey];
        if (controller?.additionalEntities) {
          // Convertir Set a Array para el multiselect
          return Array.from(controller.additionalEntities);
        }
        return [];
      },
      set: () => {
        // No hacemos nada aquí porque @select y @deselect manejan las mutaciones
      },
    });

    const getSelectedEntity = () => {
      const controller = store.state.controllers._[props.controllerKey];

      if (controller !== undefined && controller.entity !== undefined) {
        const entityKey = store.state.controllers._[props.controllerKey].entity.toLowerCase();
        return store.state.entities._[entityKey];
      }

      return null;
    };

    // Computed reactivo: se recalcula cuando cambia el store.
    // Esto permite que el dropdown se autorellene al importar un OpenAPI enriquecido.
    const selectedEntity = computed<any>(() => {
      const ent = getSelectedEntity();
      if (ent) return { name: ent.name, table: `${ent.db_schema}.${ent.table}` };
      return null;
    });
    const selectedTableValue = computed<string | null>(() => {
      const ent = getSelectedEntity();
      return ent ? `${ent.db_schema}.${ent.table}` : null;
    });

    const selectAdditionalEntity = (selectedValue: any) => {
      $selectAdditionalEntity(selectedValue);

      store.commit('controllers/ADD_ADDITIONAL_ENTITY', {
        key: props.controllerKey,
        value: selectedValue,
      });

      // Cargar datos de la entidad adicional desde el DB Explorer
      const tableName = selectedValue.includes('.') ? selectedValue.split('.').pop() : selectedValue;
      const alreadyLoaded = Object.values(store.state.entities._).find(
        (e: any) => `${e.db_schema}.${e.table}` === selectedValue,
      );
      if (!alreadyLoaded) {
        store.dispatch('connectionStore/fetchConfigs', [tableName])
          .then((data: any) => {
            if (data?.entities?.length > 0) {
              store.dispatch('entities/importEntities', data.entities);
            }
          });
      }
    };

    const removeAdditionalEntity = (removedValue: any) => {
      $removeAdditionalEntity(props.controllerKey, removedValue);

      store.commit('controllers/REMOVE_ADDITIONAL_ENTITY', {
        key: props.controllerKey,
        value: removedValue,
      });
    };

    const isSwagger = computed<boolean>(() => {
      if (props.controllerKey !== undefined && store.state.controllers._[props.controllerKey]) {
        const { source } = store.state.controllers._[props.controllerKey];
        if (source === 'swagger' || source === 'asyncapi') {
          return true;
        }
      }

      return false;
    });
    
    const isEntityUsedByAnyControllerOrAttribute = (entityName: string): boolean => {
      const controllerEntities = Object.values(store.state.controllers._).map((controller: any) => controller.entity);
      const entitiesInControllerAttributes = Object.values(store.state.endpointAttributes._).map((controllerAttribute: any) => controllerAttribute.related_entity).filter((relatedEntity: any) => relatedEntity !== null && relatedEntity !== '');
      return (controllerEntities !== null && controllerEntities.includes(entityName)) || (entitiesInControllerAttributes !== null && entitiesInControllerAttributes.includes(entityName));
    };

    const endpoints = computed(() => store.state.controllers._[props.controllerKey]?.endpoints || []);

    const removePreviouslySelectedEntity = (previouslySelectedEntity: any) => {
      // Una vez localizada la entidad, se comprueba que la entidad anterior, la que se acaba de eliminar del select, 
      // no se emplee en ningún otro controlador. De ser así, se puede eliminar del listado de entidades.
      if (previouslySelectedEntity !== null && previouslySelectedEntity.name !== null) {
        const previouslySelectedEntityName = previouslySelectedEntity.name;
        if (!isEntityUsedByAnyControllerOrAttribute(previouslySelectedEntityName)) {
          store.commit('entities/REMOVE', {
            previouslySelectedEntityName,
          });
        }
      }
    };

    // Declarada aquí para que esté disponible en `entity.set`
    const calculateForeignKeysAttributes: (attributes: any[]) => void = (attributes: any[]) => {
      const entityRelationAttributesNames = new Map();
      // Usar != en lugar de !== para capturar tanto null como undefined
      const foreignEntitiesTables = attributes.filter((attr: any) => attr != null && attr.relation != null && attr.relation.type !== 'ONE_TO_MANY')
        .map((attribute: any) => {
          const foreignTableSplit = attribute.relation.foreign_table.toLowerCase().split('_');
          const foreignTable = foreignTableSplit[foreignTableSplit.length - 1];
          const foreignAttributeTable = {
            attribute: attribute.name, table: foreignTable, type: attribute.relation.type, resolved_entity: attribute.resolved_entity, 
          };
          // En caso de detectar una relación MANY_TO_MANY se utiliza como nombre del attributo el nombre de la entidad en plural
          if (attribute.relation.type === 'MANY_TO_MANY') {
            foreignAttributeTable.attribute = $japiPluralUtils.getSpanishPluralOfWord(foreignAttributeTable.table);
          }
                                            
          const foreignTableReference = `${attribute.relation.foreign_schema}.${attribute.relation.foreign_table}`;
          const foreignTableAttributeList = entityRelationAttributesNames.get(foreignTableReference);
                                            
          if (foreignTableAttributeList != null && foreignTableAttributeList.length > 0) {
            foreignTableAttributeList.push(foreignAttributeTable);
            entityRelationAttributesNames.set(foreignTableReference, foreignTableAttributeList);
          } else {
            entityRelationAttributesNames.set(foreignTableReference, [foreignAttributeTable]);
          }
                                            
          return foreignTableReference;
        });
      const uniqueForeignTables = [...new Set(foreignEntitiesTables)].map(
        (t: string) => (t.includes('.') ? t.split('.').pop()! : t),
      );

      store.dispatch('connectionStore/fetchConfigs', uniqueForeignTables)
        .then((data: any) => {
          if (!data || !data.entities) return undefined;
          data.entities.forEach((ent: any) => {
            $selectAdditionalEntity(ent.table);
          });
          return data;
        })
        .then((data: any) => {
          if (!data) return;
          const primaryKeys: any[] = [];
          data.entities.forEach((ent: any) => {
            // Se filtran los atributos que pertenecen a la clave primaria de la relación
            // Usar != en lugar de !== para capturar tanto null como undefined
            const pkAttributes = ent.attributes.filter((attr: any) => attr.column != null && attr.column.primary_key === true);
            // Si hay más de 1 elemento, se considera que es una clave compuesta y por cada atributo se añade la cadena con .embeddedId. correspondiente
            if (pkAttributes !== null && pkAttributes.length > 1) {
              const embeddedKeys: Set<string> = new Set();
              primaryKeys.push(
                pkAttributes.map((attribute: any) => {
                  const relatedTable = `${ent.db_schema}.${ent.table}`;

                  const foreignTableAttributeList = entityRelationAttributesNames.get(relatedTable);
                  if (!foreignTableAttributeList) return [];
                  const attributesToPush: any[] = [];
                  foreignTableAttributeList.forEach((element: any) => {
                    // let formattedName = {name: attribute.name, type: attribute.type, resolved_entity: attribute.resolved_entity};
                    const formattedNameEmbedded = {
                      name: `${element.table}.embeddedId.${attribute.name}`, type: attribute.type, foreign_table: ent.table, resolved_entity: attribute.resolved_entity, foreign_schema: ent.db_schema, 
                    };
                      
                    if (!embeddedKeys.has(formattedNameEmbedded.name)) {
                      embeddedKeys.add(formattedNameEmbedded.name);
                      attributesToPush.push(formattedNameEmbedded);
                      // attributesToPush.push(formattedName);
                    }
                  });
                  return attributesToPush;
                }),
              );
            } else {
              // Cada atributo identificado como primary_key se añade a la lista con el formato correspondiente
              primaryKeys.push(
                pkAttributes.map((attribute: any) => {
                  const relatedTable = `${ent.db_schema}.${ent.table}`;

                  const foreignTableAttributeList = entityRelationAttributesNames.get(relatedTable);
                  if (!foreignTableAttributeList) return [];
                  const attributesToPush: any[] = [];
                  // Cuando hay más de una relación contra la misma tabla se toma el nombre del attributo

                  if (foreignTableAttributeList.length > 1) {
                    foreignTableAttributeList.forEach((element: any) => { // eslint-disable-line
                      attributesToPush.push({
                        name: `${element.attribute}.${attribute.name}`, type: attribute.type, foreign_table: ent.table, resolved_entity: attribute.resolved_entity, foreign_schema: ent.db_schema, 
                      });
                    });
                  } else {
                    // Cuando hay una sola relación con una tabla se toma el nombre de la entidad
                    foreignTableAttributeList.forEach((element: any) => {
                      // Si se trata de una relación MANY_TO_MANY se toma el nombre de la entidad en plural (ha sido seteado previamente en element.attribute)
                      
                      if (element.type === 'MANY_TO_MANY') {
                        attributesToPush.push({
                          name: `${element.attribute}.${attribute.name}`, type: attribute.type, foreign_table: ent.table, resolved_entity: attribute.resolved_entity, foreign_schema: ent.db_schema, 
                        });
                      } else {
                        attributesToPush.push({
                          name: `${element.table}.${attribute.name}`, type: attribute.type, foreign_table: ent.table, resolved_entity: attribute.resolved_entity, foreign_schema: ent.db_schema, 
                        });
                      }
                    });
                  }
                  
                  return attributesToPush;
                }),
              );
            }
          });
            
          foreignKeysAttributes.value = primaryKeys.flat(Infinity);
        });
    };

    const name = computed({
      get: (): string => {
        if (props.controllerKey !== undefined) {
          return store.state.controllers._[props.controllerKey]?.name || '';
        }
        return '';
      },
      set: (value) => {
        store.commit('controllers/SET_NAME', {
          key: props.controllerKey,
          value,
        });
      },
    });

    const findEntity = (tableName: string): any => Object.values(store.state.entities._).find((entity: any): any => `${entity.db_schema}.${entity.table}` === tableName);

    const entity = computed({
      get: () => store.state.controllers._[props.controllerKey]?.entity,
      set: (value: string) => {
        const previouslySelectedEntity = getSelectedEntity();
        const allEndpointsAttributes = endpoints.value
          .map((endpoint: string) => {
            const ep = store.state.endpoints._[endpoint];
            if (!ep) return [];
            let endpointAttrs = ep.responseData?.attributes || [];
            if (ep.requestBody?.attributes) {
              endpointAttrs = endpointAttrs.concat(ep.requestBody.attributes);
            }
            return endpointAttrs;
          })
          .flat();
    
        // Reinicia el estado del select
        store.commit('endpointAttributes/RESET_ENTITYMAPPING', allEndpointsAttributes);
    
        // Reinicia el state de los parametros asociados a los endpoints
        const allEndpointsParameters = endpoints.value
          .map((endpoint: string) => {
            const ep = store.state.endpoints._[endpoint];
            return ep?.parameters || [];
          })
          .flat();
    
        store.commit('endpointParameters/RESET_ENTITYMAPPING', allEndpointsParameters);

        if (isSwagger.value) {
          loading.value = true;
          const foundEntity = findEntity(value);

          if (!foundEntity) {
            // Extraer solo el nombre de la tabla (sin schema) para el request
            const tableName = value.includes('.') ? value.split('.').pop()! : value;

            store.dispatch('connectionStore/fetchConfigs', [tableName])
              .then((data: any) => {
                if (!data || !data.entities || data.entities.length === 0) {
                  loading.value = false;
                  return;
                }

                const foundEnt = data.entities.find((ent: any) => `${ent.db_schema}.${ent.table}` === value)
                  || data.entities[0];

                if (!foundEnt) {
                  loading.value = false;
                  return;
                }

                const entityClassName = foundEnt.name;

                store.dispatch('entities/importEntities', data.entities);
                store.commit('controllers/SET_ENTITY_CLASS_NAME', {
                  key: props.controllerKey,
                  value: entityClassName,
                });

                endpoints.value.forEach((key: string) => {
                  store.commit('endpoints/SET_ENTITY_CLASS_NAME', {
                    key,
                    value: entityClassName,
                  });
                });
                loading.value = false;

                if (foundEnt.attributes) {
                  calculateForeignKeysAttributes(foundEnt.attributes);
                }
              })
              .then(() => {
                removePreviouslySelectedEntity(previouslySelectedEntity);
              })
              .catch((err: any) => {
                loading.value = false;
                $toast.errorFromServer(err);
              });
          } else {
            store.commit('controllers/SET_ENTITY_CLASS_NAME', {
              key: props.controllerKey,
              value: foundEntity.name,
            });
            endpoints.value.forEach((key: string) => {
              store.commit('endpoints/SET_ENTITY_CLASS_NAME', {
                key,
                value: foundEntity.name,
              });
            });
            const { attributes } = store.state.entities._[foundEntity.name.toLowerCase()];
            calculateForeignKeysAttributes(attributes);
            removePreviouslySelectedEntity(previouslySelectedEntity);
            loading.value = false;
          }
        } 
        // Se está en el modo de generación de base de datos
        else {
          store.commit('controllers/SET_ENTITY_CLASS_NAME', {
            key: props.controllerKey,
            value,
          });
          endpoints.value.forEach((key: string) => {
            store.commit('endpoints/SET_ENTITY_CLASS_NAME', {
              key,
              value,
            });
          });
        }
      },
    });

    /**
   * Obtenemos el listado de atributos de una entidad
   */
    const entityAttributes = computed<Array<any>>(() => {
      if (isSwagger.value && archetypeHasDatabase.value) {
      /* 
       2023-05-25
       Este método se ha movido al componente padre desde MdEndpointAttribute para evitar que se haga el filtrado por cada atributo.
       Ahora solo se filtran los atributos una vez por endpoint y por tanto se mejora el rendimiento de la aplicación.
       */
        const allEntities = store.getters['entities/exportData'].entities;
        const result = allEntities.find((ent: any) => ent.name === entity.value)?.attributes;

        return result;
      }
      if (isSwagger.value) {
        return [];
      }

      return store.state.entities._[(entity.value).toLowerCase()]?.attributes;
    });

    const modalGeneratePartialCode = computed(() => `md-modal-generate-partial-code-${name.value}`);

    const requestMapping = computed({
      get: () => store.state.controllers._[props.controllerKey]?.requestMapping || '',
      set: (value: string) => {
        store.commit('controllers/SET_REQUEST_MAPPING', {
          key: props.controllerKey,
          value,
        });
      },
    });

    const entities = computed(() => store.state.entities.list);

    const tables = computed(() => store.state.entities.tables);

    // Opciones formateadas para el multiselect de entidad de BD
    const formattedTableOptions = computed(() => {
      if (!tables.value) return [];
      return tables.value.map((table: string) => {
        // Si esta tabla es la seleccionada y tenemos la info de la entidad, mostrar nombre formateado
        if (selectedEntity.value && selectedEntity.value.table === table && selectedEntity.value.name) {
          return {
            value: table,
            label: `${selectedEntity.value.name} : ${table}`,
          };
        }
        return {
          value: table,
          label: table,
        };
      });
    });

    // Handler para cuando se selecciona una tabla manualmente
    const onTableSelected = (value: string) => {
      if (value) {
        entity.value = value;
      }
    };

    const controllerSource = computed<string>(() => store.state.controllers._[props.controllerKey]?.source || '');

    const entityTable = (entityKey: string): string => {
      if (store.state.entities._[entityKey.toLowerCase()]) {
        return store.state.entities._[entityKey.toLowerCase()].table;
      }
      return '';
    };

    const entityTableSchema = (entityKey: string): string => {
      if (store.state.entities._[entityKey.toLowerCase()]) {
        return store.state.entities._[entityKey.toLowerCase()].db_schema;
      }
      return '';
    };

    const openModal = (modal: string): void => {
      const m = modal;
      $bvModal.show(m);
    };

    const emptyField = (value: string): boolean | null => {
      if (value === null || (value !== null && value.length === 0)) {
        return false;
      }

      return null;
    };

    return {
      modalGeneratePartialCode,
      selectedEntity,
      selectedTableValue,
      loading,
      foreignKeysAttributes,
      localAdditionalEntities,
      selectAdditionalEntity,
      removeAdditionalEntity,
      isSwagger,
      entityAttributes,
      name,
      requestMapping,
      entity,
      endpoints,
      entities,
      tables,
      formattedTableOptions,
      onTableSelected,
      controllerSource,
      entityTable,
      entityTableSchema,
      openModal,
      emptyField,
      archetypeHasDatabase,
    };
  },
});
</script>
