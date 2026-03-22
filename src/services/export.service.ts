import { Injectable, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import * as Excel from 'exceljs';
import * as moment from 'moment';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { ColumnDefinition, HeaderStyle, ExportOptions } from 'src/interface';

@Injectable()
export class ExportService {
  private workbook: Excel.Workbook | null = null;
  private worksheet: Excel.Worksheet | null = null;

  /**
   * Khởi tạo workbook Excel mới
   * @param worksheetName - Tên worksheet
   */
  initWorkbook(worksheetName: string = 'Sheet 1'): this {
    this.workbook = new Excel.Workbook();
    this.worksheet = this.workbook.addWorksheet(worksheetName);
    return this;
  }

  /**
   * Thêm worksheet mới vào workbook
   * @param worksheetName - Tên worksheet
   */
  addWorksheet(worksheetName: string): this {
    if (!this.workbook) {
      throw new BadRequestException(
        'Workbook chưa được khởi tạo. Gọi initWorkbook() trước.',
      );
    }

    this.worksheet = this.workbook.addWorksheet(worksheetName);
    return this;
  }

  /**
   * Thiết lập cột/header cho worksheet
   * @param columns - Mảng định nghĩa cột
   * @param headerStyle - Style tùy chỉnh cho header (tùy chọn)
   */
  setColumns(columns: ColumnDefinition[], headerStyle?: HeaderStyle): this {
    if (!this.worksheet) {
      throw new BadRequestException(
        'Worksheet chưa được khởi tạo. Gọi initWorkbook() hoặc addWorksheet() trước.',
      );
    }

    // Thiết lập cột
    this.worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
      style: col.style,
    }));

    // Thiết lập độ rộng cột
    columns.forEach((col, index) => {
      if (col.width && this.worksheet) {
        const column = this.worksheet.getColumn(index + 1);
        if (column) {
          column.width = col.width;
        }
      }
    });

    // Áp dụng style cho header
    if (this.worksheet.rowCount > 0) {
      const headerRow = this.worksheet.getRow(1);

      headerRow.eachCell((cell: Excel.Cell) => {
        cell.font = headerStyle?.font || {
          name: 'Calibri',
          size: 11,
          bold: true,
          color: { argb: 'FFFFFF' },
        };
        cell.fill = headerStyle?.fill || {
          type: 'pattern' as const,
          pattern: 'solid' as const,
          fgColor: { argb: '1C4587' },
        };
        cell.alignment = headerStyle?.alignment || {
          vertical: 'middle',
          horizontal: 'center',
        };
        cell.border = headerStyle?.border || {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }

    return this;
  }

  /**
   * Thêm dữ liệu vào worksheet hiện tại
   * @param data - Mảng dữ liệu
   */
  addData(data: Record<string, unknown>[]): this {
    if (!this.worksheet) {
      throw new BadRequestException(
        'Worksheet chưa được khởi tạo. Gọi initWorkbook() hoặc addWorksheet() trước.',
      );
    }

    data.forEach((row) => {
      this.worksheet!.addRow(row);
    });

    return this;
  }

  /**
   * Thêm các dòng trống vào worksheet hiện tại
   * @param count - Số dòng trống cần thêm
   * @param template - Template cho dòng trống
   */
  addEmptyRows(count: number, template: Record<string, unknown> = {}): this {
    if (!this.worksheet) {
      throw new BadRequestException(
        'Worksheet chưa được khởi tạo. Gọi initWorkbook() hoặc addWorksheet() trước.',
      );
    }

    for (let i = 1; i <= count; i++) {
      const rowData = { ...template };
      if (template.stt !== undefined) {
        rowData.stt = i;
      }
      this.worksheet.addRow(rowData);
    }

    return this;
  }

  /**
   * Thêm một dòng vào worksheet hiện tại
   * @param row - Dữ liệu cho dòng
   */
  addRow(row: Record<string, unknown>): this {
    if (!this.worksheet) {
      throw new BadRequestException(
        'Worksheet chưa được khởi tạo. Gọi initWorkbook() hoặc addWorksheet() trước.',
      );
    }

    this.worksheet.addRow(row);
    return this;
  }

  /**
   * Thiết lập header response và ghi file Excel vào response
   * @param res - Express response object
   * @param filename - Tên file (không có extension)
   */
  async writeToResponse(res: Response, filename: string): Promise<void> {
    if (!this.workbook) {
      throw new BadRequestException(
        'Workbook chưa được khởi tạo. Gọi initWorkbook() trước.',
      );
    }

    const fullFilename = `${filename}-${moment().format('DD-MM-YYYY-HH-mm-ss')}.xlsx`;

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fullFilename}`,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    await this.workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Xuất Excel với một lần gọi
   * @param options - Tùy chọn xuất Excel
   * @param res - Express response object
   */
  async exportToExcel(options: ExportOptions, res: Response): Promise<void> {
    this.initWorkbook(options.worksheetName || 'Sheet 1')
      .setColumns(options.columns, options.headerStyle)
      .addData(options.data);

    await this.writeToResponse(res, options.filename);
  }

  /**
   * Lấy workbook để thực hiện các thao tác tùy chỉnh
   * @returns Excel workbook object
   */
  getWorkbook(): Excel.Workbook | null {
    return this.workbook;
  }

  /**
   * Lấy worksheet hiện tại để thực hiện các thao tác tùy chỉnh
   * @returns Excel worksheet object
   */
  getWorksheet(): Excel.Worksheet | null {
    return this.worksheet;
  }

  /**
   * Reset service để tái sử dụng
   */
  reset(): this {
    this.workbook = null;
    this.worksheet = null;
    return this;
  }

  /**
   * Tạo style mặc định cho header
   */
  getDefaultHeaderStyle(): HeaderStyle {
    return {
      font: {
        name: 'Calibri',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFF' },
      },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1C4587' },
      },
      alignment: {
        vertical: 'middle',
        horizontal: 'center',
      },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
  }

  /**
   * Tạo style cho dữ liệu
   */
  getDefaultDataStyle(): Partial<Excel.Style> {
    return {
      font: {
        name: 'Calibri',
        size: 10,
      },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
  }

  /**
   * Xuất Excel với streaming từ database cursor
   * @param options - Tùy chọn xuất Excel streaming
   * @param res - Express response object
   */
  async exportToExcelStreaming<T = Record<string, unknown>>(
    options: {
      filename: string;
      worksheetName: string;
      columns: ColumnDefinition[];
      dataStream: NodeJS.ReadableStream & { destroy(): void };
      maxRows?: number;
      headerStyle?: HeaderStyle;
      dataStyle?: Partial<Excel.Style>;
      onRowProcess?: (row: T, index: number) => Record<string, unknown>;
      onProgress?: (processedRows: number) => void;
    },
    res: Response,
  ): Promise<void> {
    const {
      filename,
      worksheetName,
      columns,
      dataStream,
      maxRows = 100000,
      headerStyle,
      dataStyle,
      onRowProcess,
      onProgress,
    } = options;

    // Khởi tạo workbook và worksheet
    this.initWorkbook(worksheetName).setColumns(columns, headerStyle);

    // Thiết lập headers cho response
    const fullFilename = `${filename}-${moment().format('DD-MM-YYYY-HH-mm-ss')}.xlsx`;
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fullFilename}`,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let rowIndex = 1;
    let processedRows = 0;

    return new Promise<void>((resolve, reject) => {
      dataStream.on('data', (data: T) => {
        try {
          if (rowIndex > maxRows) {
            dataStream.destroy();
            return;
          }

          // Xử lý row data
          let excelRow: Record<string, unknown> = data as Record<
            string,
            unknown
          >;
          if (onRowProcess) {
            excelRow = onRowProcess(data, rowIndex);
          }

          // Thêm row vào worksheet
          const row = this.worksheet!.addRow(excelRow);

          // Style cho data row
          if (dataStyle) {
            row.eachCell((cell: Excel.Cell) => {
              Object.assign(cell, dataStyle);
            });
          }

          rowIndex++;
          processedRows++;

          // Callback progress
          if (onProgress && processedRows % 1000 === 0) {
            onProgress(processedRows);
          }

          // Giải phóng memory sau mỗi 1000 rows
          if (processedRows % 1000 === 0) {
            if (global.gc) {
              global.gc();
            }
          }
        } catch (error) {
          dataStream.destroy();
          reject(
            new Error(error instanceof Error ? error.message : String(error)),
          );
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      dataStream.on('end', async () => {
        try {
          await this.workbook!.xlsx.write(res);
          res.end();
          resolve();
        } catch (error) {
          reject(
            new Error(error instanceof Error ? error.message : String(error)),
          );
        }
      });

      dataStream.on('error', (error: Error) => {
        reject(new Error(error.message));
      });
    });
  }

  /**
   * Tạo streaming export với TypeORM query builder
   * @param options - Tùy chọn export
   * @param res - Express response object
   */
  async exportFromQueryBuilder<T = Record<string, unknown>>(
    options: {
      filename: string;
      worksheetName: string;
      columns: ColumnDefinition[];
      queryBuilder: SelectQueryBuilder<ObjectLiteral>;
      maxRows?: number;
      headerStyle?: HeaderStyle;
      dataStyle?: Partial<Excel.Style>;
      onRowProcess?: (row: T, index: number) => Record<string, unknown>;
      onProgress?: (processedRows: number) => void;
    },
    res: Response,
  ): Promise<void> {
    const { queryBuilder, ...exportOptions } = options;

    // Thêm limit vào query
    if (exportOptions.maxRows) {
      queryBuilder.limit(exportOptions.maxRows);
    }

    // Tạo stream từ query builder
    const stream = await queryBuilder.stream();

    // Export với streaming
    await this.exportToExcelStreaming(
      {
        ...exportOptions,
        dataStream: stream,
      },
      res,
    );
  }
}
