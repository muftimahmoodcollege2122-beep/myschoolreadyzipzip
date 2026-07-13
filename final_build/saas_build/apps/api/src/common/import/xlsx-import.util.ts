/**
 * Shared bulk-import utilities: parse an uploaded .xlsx/.csv buffer into row
 * objects, and build a downloadable template file. Used by students, teachers,
 * and fees bulk-import endpoints so all three behave consistently.
 */
import * as XLSX from 'xlsx';

export interface RowError {
  row: number; // 1-indexed, matching what the user sees in Excel (header = row 1)
  message: string;
}

export interface ImportResult<T> {
  successCount: number;
  failedCount: number;
  created: T[];
  errors: RowError[];
}

/** Parses an uploaded file buffer (.xlsx, .xls, or .csv) into an array of row objects keyed by header. */
export function parseSpreadsheet(buffer: Buffer): Record<string, any>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  // defval:'' ensures missing cells come through as '' rather than being omitted entirely
  return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
}

/** Builds a downloadable .xlsx template buffer from column headers + optional example row. */
export function buildTemplate(headers: string[], exampleRow?: Record<string, any>): Buffer {
  const rows = exampleRow ? [exampleRow] : [];
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  // Force header row even if there are no example rows
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/** Builds a downloadable .xlsx export buffer from an array of row objects. */
export function buildExport(rows: Record<string, any>[], sheetName = 'Export'): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/** Trims strings and normalizes '' to undefined for optional-field cleanliness. */
export function cleanCell(v: any): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}
