import YAML from 'yaml';

export interface SqlConfig {
  tablePrefix: string;
  relationsPrefix: string;
  dbSchema: string;
}

function toSnakeCase(name: string): string {
  return name
    .replace(/([A-Z])/g, (_, c) => `_${c.toLowerCase()}`)
    .replace(/^_/, '');
}

function jsonPropToSqlType(prop: any): string {
  if (!prop) return 'TEXT';
  switch (prop.type) {
    case 'integer': return prop.format === 'int64' ? 'BIGINT' : 'INTEGER';
    case 'number':
      if (prop.format === 'float') return 'FLOAT';
      if (prop.format === 'double') return 'DOUBLE PRECISION';
      return 'NUMERIC';
    case 'boolean': return 'BOOLEAN';
    case 'string':
      if (prop.format === 'date') return 'DATE';
      if (prop.format === 'date-time') return 'TIMESTAMP';
      if (prop.format === 'uuid') return 'UUID';
      return `VARCHAR(${prop.maxLength || 255})`;
    default: return 'TEXT';
  }
}

export function parseOpenApiContent(content: string): any {
  try {
    return YAML.parse(content);
  } catch {
    return JSON.parse(content);
  }
}

export default function generateSql(openapi: any, config: SqlConfig): string {
  const schemas: Record<string, any> = openapi?.components?.schemas || {};
  if (Object.keys(schemas).length === 0) return '';

  const { tablePrefix, relationsPrefix } = config;
  const dbSchema = config.dbSchema?.trim() || '';
  const schemaPrefix = dbSchema ? `${dbSchema}.` : '';

  // Skip per-method schemas (PetPost, PetGet, etc. from enriched YAMLs)
  const baseSchemas = Object.entries(schemas).filter(
    ([, schema]) => !schema?.['x-apigen-mapping']?.method,
  );

  // Map schemaName → full table name (with prefix)
  const schemaToTable: Record<string, string> = {};
  baseSchemas.forEach(([name]) => {
    schemaToTable[name] = `${tablePrefix}${toSnakeCase(name)}`;
  });

  const mainStatements: string[] = [];
  const junctionStatements: string[] = [];
  const processedJunctions = new Set<string>();

  baseSchemas.forEach(([schemaName, schema]) => {
    if (!schema?.properties) return;

    const tableName = schemaToTable[schemaName];
    const required: string[] = schema.required || [];
    const columns: string[] = [];
    const foreignKeys: string[] = [];

    Object.entries(schema.properties).forEach(([propName, prop]: [string, any]) => {
      if (!prop || typeof prop !== 'object') return;

      // $ref → FK column
      if (prop.$ref) {
        const refSchemaName = prop.$ref.replace('#/components/schemas/', '');
        const refTable = schemaToTable[refSchemaName];
        const colName = `${toSnakeCase(propName)}_id`;
        const notNull = required.includes(propName) ? ' NOT NULL' : '';
        columns.push(`  ${colName} BIGINT${notNull}`);
        if (refTable) {
          foreignKeys.push(
            `  CONSTRAINT fk_${tableName}_${colName} FOREIGN KEY (${colName}) REFERENCES ${schemaPrefix}${refTable}(id)`,
          );
        }
        return;
      }

      // array + $ref items → junction/relations table
      if (prop.type === 'array' && prop.items?.$ref) {
        const refSchemaName = prop.items.$ref.replace('#/components/schemas/', '');
        const refTable = schemaToTable[refSchemaName];
        if (refTable) {
          const sorted = [tableName, refTable].sort();
          const junctionName = `${relationsPrefix}${sorted[0]}_${sorted[1]}`;
          if (!processedJunctions.has(junctionName)) {
            processedJunctions.add(junctionName);
            const col1 = `${sorted[0]}_id`;
            const col2 = `${sorted[1]}_id`;
            junctionStatements.push(
              `CREATE TABLE IF NOT EXISTS ${schemaPrefix}${junctionName} (\n`
              + `  ${col1} BIGINT NOT NULL,\n`
              + `  ${col2} BIGINT NOT NULL,\n`
              + `  CONSTRAINT fk_${junctionName}_${col1} FOREIGN KEY (${col1}) REFERENCES ${schemaPrefix}${sorted[0]}(id),\n`
              + `  CONSTRAINT fk_${junctionName}_${col2} FOREIGN KEY (${col2}) REFERENCES ${schemaPrefix}${sorted[1]}(id),\n`
              + `  PRIMARY KEY (${col1}, ${col2})\n`
              + ');',
            );
          }
        }
        return;
      }

      // Skip plain arrays without $ref
      if (prop.type === 'array') return;

      // id integer → auto-generated PK
      if (propName === 'id' && (prop.type === 'integer' || prop.format === 'int64')) {
        const serial = prop.format === 'int64' ? 'BIGSERIAL' : 'SERIAL';
        columns.push(`  id ${serial} PRIMARY KEY`);
        return;
      }

      // Regular column
      const sqlType = jsonPropToSqlType(prop);
      const notNull = required.includes(propName) ? ' NOT NULL' : '';
      columns.push(`  ${toSnakeCase(propName)} ${sqlType}${notNull}`);
    });

    const allCols = [...columns, ...foreignKeys];
    if (allCols.length === 0) return;

    mainStatements.push(
      `CREATE TABLE IF NOT EXISTS ${schemaPrefix}${tableName} (\n${allCols.join(',\n')}\n);`,
    );
  });

  if (mainStatements.length === 0 && junctionStatements.length === 0) return '';

  const prefixInfo = tablePrefix ? `-- Table prefix:     ${tablePrefix}` : '-- Table prefix:     (none)';
  const relInfo = relationsPrefix ? `-- Relations prefix: ${relationsPrefix}` : '-- Relations prefix: (none)';
  const schemaInfo = dbSchema ? `-- Schema: ${dbSchema}` : '-- Schema: (none)';
  const header = `-- Generated by Visual Mapper\n${schemaInfo}\n${prefixInfo}\n${relInfo}\n`;

  return [header, ...[...mainStatements, ...junctionStatements]].join('\n\n');
}
