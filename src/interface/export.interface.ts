import * as Excel from 'exceljs';

export interface ColumnDefinition {
  header: string;
  key: string;
  width?: number;
  style?: Partial<Excel.Style>;
}

export interface HeaderStyle {
  font?: Partial<Excel.Font>;
  fill?: Excel.Fill;
  alignment?: Partial<Excel.Alignment>;
  border?: Partial<Excel.Borders>;
}

export interface ExportOptions {
  filename: string;
  worksheetName?: string;
  columns: ColumnDefinition[];
  data: Record<string, unknown>[];
  headerStyle?: HeaderStyle;
}
