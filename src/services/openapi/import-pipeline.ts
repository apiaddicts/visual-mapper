export default async function runImportPipeline(
  store: any,
  controllersToLoad: any[],
  rawDoc: any,
): Promise<void> {
  // 1. Fetch tablas
  const result = await store.dispatch('connectionStore/fetchTables');
  const rawTables = result.tables || result;
  const schemaPrefix = store.state.connectionStore.schema || 'public';
  const tableNames = Array.isArray(rawTables)
    ? rawTables.map((tbl: any) => {
      const tblName = typeof tbl === 'string' ? tbl : tbl.name;
      return `${schemaPrefix}.${tblName}`;
    })
    : [];
  store.commit('entities/SET_TABLES', tableNames);

  // 2. Cargar entities desde x-apigen-models antes de importControllers
  const apigenModels = rawDoc?.components?.['x-apigen-models'];
  if (apigenModels) {
    const dbTables = store.state.entities.tables as string[];
    const fetchPromises: Promise<any>[] = [];
    Object.entries(apigenModels).forEach(([modelName, model]: [string, any]) => {
      const tableName = (model as any)['relational-persistence']?.table;
      if (!tableName) return;
      const fullTable = `${schemaPrefix}.${tableName}`;
      if (!dbTables.includes(fullTable)) return;
      fetchPromises.push(
        store.dispatch('connectionStore/fetchConfigs', [tableName])
          .then(async (data: any) => {
            if (!data?.entities?.length) return;
            const targetEntity = data.entities.find((ent: any) => ent.table === tableName);
            if (!targetEntity) return;
            await store.dispatch('entities/importEntity', { ...targetEntity, name: modelName });
          }),
      );
    });
    if (fetchPromises.length > 0) await Promise.all(fetchPromises);
  }

  // 3. Importar controllers
  await store.dispatch('controllers/importControllers', controllersToLoad);

  // 4. Propagar entity del controller a sus endpoints
  const controllersMap = store.state.controllers._;
  Object.values(controllersMap).forEach((controller: any) => {
    if (!controller.entity || !controller.endpoints) return;
    controller.endpoints.forEach((endpointKey: string) => {
      store.commit('endpoints/SET_ENTITY_CLASS_NAME', { key: endpointKey, value: controller.entity });
    });
  });

  // 5. Detectar entidades adicionales desde rawDoc
  if (rawDoc) {
    const models = rawDoc?.components?.['x-apigen-models'] || {};
    const dbTables = store.state.entities.tables as string[];
    const controllersMapNow = store.state.controllers._;

    const classToTable: Record<string, string> = {};
    Object.entries(models).forEach(([modelName, model]: [string, any]) => {
      const tbl = (model as any)['relational-persistence']?.table;
      if (tbl) classToTable[modelName] = tbl;
    });

    Object.entries(rawDoc.paths || {}).forEach(([, pathItem]: [string, any]) => {
      const binding = pathItem?.['x-apigen-binding'];
      if (!binding?.model) return;
      const primaryModel = binding.model as string;

      const controllerEntry = Object.entries(controllersMapNow).find(
        ([, c]: [string, any]) => c.entity === primaryModel,
      );
      if (!controllerEntry) return;
      const [controllerKey, controller] = controllerEntry as [string, any];

      ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
        const op = pathItem[method];
        if (!op) return;

        const schemaRefs: string[] = [];
        const reqMt: any = op.requestBody?.content?.['application/json']
          || (Object.values(op.requestBody?.content || {}) as any[])[0];
        if (reqMt?.schema?.$ref) schemaRefs.push(reqMt.schema.$ref.replace('#/components/schemas/', ''));
        ['200', '201', '202'].forEach((status) => {
          const respMt: any = op.responses?.[status]?.content?.['application/json']
            || (Object.values(op.responses?.[status]?.content || {}) as any[])[0];
          const ref = respMt?.schema?.$ref?.replace('#/components/schemas/', '')
            || respMt?.schema?.items?.$ref?.replace('#/components/schemas/', '');
          if (ref) schemaRefs.push(ref);
        });

        schemaRefs.forEach((schemaName) => {
          const rawSchema: any = rawDoc.components?.schemas?.[schemaName];
          if (!rawSchema?.properties) return;

          Object.entries(rawSchema.properties).forEach(([propName, prop]: [string, any]) => {
            const propRef: string | undefined = prop?.$ref || prop?.items?.$ref;
            if (!propRef) return;
            const refClass = propRef.replace('#/components/schemas/', '');
            const table = classToTable[refClass];
            if (!table || refClass === primaryModel) return;

            const fullTable = `${schemaPrefix}.${table}`;
            if (!dbTables.includes(fullTable)) return;

            // Añadir al dropdown de entidades adicionales
            const existing = controller.additionalEntities as Set<string> | undefined;
            if (!existing || !existing.has(fullTable)) {
              store.commit('controllers/ADD_ADDITIONAL_ENTITY', { key: controllerKey, value: fullTable });
            }

            const entityInStore = Object.values(store.state.entities._).find(
              (e: any) => e.table === table && e.db_schema === schemaPrefix,
            ) as any;
            const entityStoreName: string = entityInStore?.name || refClass;

            const endpointsMap = store.state.endpoints._;
            const attrsMap = store.state.endpointAttributes._;

            controller.endpoints.forEach((epKey: string) => {
              const ep = endpointsMap[epKey];
              if (!ep) return;
              [ep.requestBody, ep.responseData].forEach((section: any) => {
                if (!section?.attributes) return;
                section.attributes.forEach((attrKey: string) => {
                  const attr = attrsMap[attrKey];
                  if (!attr || attr.name !== propName) return;
                  if (attr.type !== 'array' && attr.type !== 'Object') return;
                  if (attr.entity_mapping?.type) return;

                  store.commit('endpointAttributes/SET_ENTITYMAPPING', {
                    key: attrKey,
                    value: {
                      name: entityStoreName,
                      type: entityStoreName,
                      type_of_array: '',
                      resolved_entity: entityStoreName,
                      foreign_table: table,
                      foreign_schema: schemaPrefix,
                    },
                  });

                  const childEntityData = store.state.entities._[entityStoreName.toLowerCase()];
                  if (childEntityData?.attributes && attr.attributes?.length > 0) {
                    const typeByField: Record<string, string> = {};
                    (childEntityData.attributes as any[]).forEach((ea: any) => {
                      if (ea?.name && ea?.type) typeByField[ea.name] = ea.type;
                    });
                    (attr.attributes as string[]).forEach((subAttrKey: string) => {
                      const subAttr = attrsMap[subAttrKey];
                      if (!subAttr?.entity_mapping?.name || subAttr.entity_mapping.type) return;
                      const resolvedType = typeByField[subAttr.entity_mapping.name];
                      if (!resolvedType) return;
                      store.commit('endpointAttributes/SET_ENTITYMAPPING', {
                        key: subAttrKey,
                        value: { ...subAttr.entity_mapping, type: resolvedType },
                      });
                    });
                  }
                });
              });
            });
          });
        });
      });
    });
  }

  // 6. Propagar todos los mappings importados
  await store.dispatch('endpointAttributes/propagateAllImportedMappings');
}
