type JsonRow = Record<string, unknown>;

export { convertJsonToInsertSql };

function isPlainObject(value: unknown): value is JsonRow {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeRows(input: unknown): JsonRow[] {
  if (Array.isArray(input)) {
    if (!input.every(isPlainObject)) {
      throw new Error('JSON array must contain only objects.');
    }

    return input;
  }

  if (isPlainObject(input)) {
    return [input];
  }

  throw new Error('JSON input must be an object or an array of objects.');
}

function escapeIdentifier(identifier: string): string {
  return `\`${identifier.replace(/`/g, '``')}\``;
}

function serializeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : `'${String(value)}'`;
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Date) {
    return `'${value.toISOString().replace(/'/g, "''")}'`;
  }

  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

function getColumns(rows: JsonRow[]): string[] {
  const columns = new Set<string>();

  rows.forEach(row => Object.keys(row).forEach(key => columns.add(key)));

  return Array.from(columns);
}

function convertJsonToInsertSql({ tableName, input }: { tableName: string; input: unknown }): string {
  const trimmedTableName = tableName.trim();

  if (!trimmedTableName) {
    throw new Error('Table name is required.');
  }

  const rows = normalizeRows(input);

  if (rows.length === 0) {
    throw new Error('JSON array must not be empty.');
  }

  const columns = getColumns(rows);

  if (columns.length === 0) {
    throw new Error('At least one column is required to generate INSERT SQL.');
  }

  const valuesSql = rows
    .map(row => `(${columns.map(column => serializeValue(row[column])).join(', ')})`)
    .join(',\n');

  return `INSERT INTO ${escapeIdentifier(trimmedTableName)} (${columns.map(escapeIdentifier).join(', ')})\nVALUES\n${valuesSql};`;
}
