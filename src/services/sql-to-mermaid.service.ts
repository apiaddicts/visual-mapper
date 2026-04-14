/* eslint-disable */

interface ParsedColumn {
  name: string;
  type: string;
  isPK: boolean;
  references?: string; // tabla referenciada
}

interface ParsedTable {
  name: string;
  columns: ParsedColumn[];
}

function normalizeType(rawType: string): string {
  const t = rawType.toLowerCase().trim();
  if (t.startsWith('serial') || t.startsWith('bigserial')) return 'serial';
  if (t.startsWith('varchar') || t.startsWith('character varying')) return 'varchar';
  if (t.startsWith('numeric') || t.startsWith('decimal')) return 'decimal';
  if (t.startsWith('integer') || t === 'int' || t.startsWith('int4') || t.startsWith('int8')) return 'integer';
  if (t.startsWith('bigint')) return 'bigint';
  if (t.startsWith('boolean') || t === 'bool') return 'boolean';
  if (t.startsWith('text')) return 'text';
  if (t.startsWith('timestamp')) return 'timestamp';
  if (t.startsWith('date')) return 'date';
  if (t.startsWith('uuid')) return 'uuid';
  if (t.startsWith('float') || t.startsWith('real') || t.startsWith('double')) return 'float';
  return t.split(/[\s(]/)[0]; // primer token
}

function parseSql(sql: string): ParsedTable[] {
  const tables: ParsedTable[] = [];

  // Extraer bloques CREATE TABLE manualmente (para manejar paréntesis anidados)
  const createTableHeaderRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?\s*\(/gi;

  let match: RegExpExecArray | null;

  while ((match = createTableHeaderRegex.exec(sql)) !== null) {
    const tableName = match[1];
    // Extraer el cuerpo balanceando paréntesis
    let depth = 1;
    let i = match.index + match[0].length;
    let body = '';
    while (i < sql.length && depth > 0) {
      const ch = sql[i];
      if (ch === '(') depth++;
      else if (ch === ')') { depth--; if (depth === 0) break; }
      body += ch;
      i++;
    }
    const columns: ParsedColumn[] = [];

    // Separar líneas por coma (respetando paréntesis anidados)
    const lines: string[] = [];
    let depth2 = 0;
    let current = '';
    for (const ch of body) {
      if (ch === '(') depth2++;
      else if (ch === ')') depth2--;
      if (ch === ',' && depth2 === 0) {
        lines.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) lines.push(current.trim());

    // PKs declaradas a nivel de tabla: PRIMARY KEY (col1, col2)
    const tablePKs = new Set<string>();
    const tablePKLine = lines.find((l) => /^\s*(?:CONSTRAINT\s+\w+\s+)?PRIMARY\s+KEY\s*\(/i.test(l));
    if (tablePKLine) {
      const pkMatch = tablePKLine.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        pkMatch[1].split(',').forEach((c) => tablePKs.add(c.trim().replace(/['"]/g, '').toLowerCase()));
      }
    }

    // FKs declaradas a nivel de tabla: FOREIGN KEY (col) REFERENCES table(col)
    const tableFKs: Record<string, string> = {};
    lines.forEach((line) => {
      const fkMatch = line.match(/(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+["']?(\w+)["']?/i);
      if (fkMatch) {
        const col = fkMatch[1].trim().replace(/['"]/g, '').toLowerCase();
        tableFKs[col] = fkMatch[2];
      }
    });

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Saltar constraints de tabla
      if (/^\s*(?:CONSTRAINT|PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN\s+KEY|INDEX)/i.test(trimmed)) return;

      // Columna: nombre tipo [opciones]
      const colMatch = trimmed.match(/^["']?(\w+)["']?\s+([^\s,]+(?:\s*\([^)]*\))?)/i);
      if (!colMatch) return;

      const colName = colMatch[1];
      const rawType = colMatch[2];
      const rest = trimmed.slice(colMatch[0].length).toUpperCase();

      const isPK = /\bPRIMARY\s+KEY\b/.test(rest) || tablePKs.has(colName.toLowerCase());

      // REFERENCES inline: col INT REFERENCES tabla(id)
      let references: string | undefined;
      const refMatch = trimmed.match(/REFERENCES\s+["']?(\w+)["']?/i);
      if (refMatch) references = refMatch[1];
      else if (tableFKs[colName.toLowerCase()]) references = tableFKs[colName.toLowerCase()];

      columns.push({
        name: colName,
        type: normalizeType(rawType),
        isPK,
        references,
      });
    });

    if (columns.length > 0) {
      tables.push({ name: tableName, columns });
    }
  }

  return tables;
}

function generateMermaid(tables: ParsedTable[]): string {
  const lines: string[] = ['erDiagram'];
  const tableNames = new Set(tables.map((t) => t.name));

  tables.forEach((table) => {
    lines.push(`  ${table.name} {`);
    table.columns.forEach((col) => {
      const pk = col.isPK ? ' PK' : '';
      const fk = col.references ? ' FK' : '';
      lines.push(`    ${col.type} ${col.name}${pk}${fk}`);
    });
    lines.push('  }');
  });

  // Relaciones
  tables.forEach((table) => {
    table.columns.forEach((col) => {
      if (col.references && tableNames.has(col.references)) {
        lines.push(`  ${col.references} ||--o{ ${table.name} : "fk"`);
      }
    });
  });

  return lines.join('\n');
}

export function sqlToMermaid(sqlContent: string): string {
  try {
    const tables = parseSql(sqlContent);
    if (tables.length === 0) return '';
    return generateMermaid(tables);
  } catch (e) {
    console.error('Error parsing SQL:', e);
    return '';
  }
}
