// import * as moment from 'moment';
// import * as Excel from 'exceljs';
// import { User } from 'libs/database/src/entities/user.entity';
// import { Response } from 'express';

// export const downloadExcel = (name: string, file: Excel.Buffer, response: Response) => {
//   response.setHeader(
//     'Content-Type',
//     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//   );
//   response.setHeader('Content-Disposition', `attachment; filename=${name}.xlsx`);
//   return response.send(file);
// };

// export const setTitleExport = (
//   workbook: Excel.Workbook,
//   worksheet: Excel.Worksheet,
//   title: string,
//   columns: any[],
//   exportTime: Date,
//   user: User,
// ) => {
//   worksheet.mergeCells('B2:C2');
//   const titleCell = worksheet.getCell('B2');
//   titleCell.value = title;
//   titleCell.font = { bold: true };

//   worksheet.getCell('B4').value = 'Thời gian xuất dữ liệu';
//   worksheet.getCell('C4').value = moment(exportTime).format('DD-MM-YYYY HH:mm:ss');
//   worksheet.getCell('B5').value = 'Người xuất';
//   worksheet.getCell('C5').value = user.fullName;
//   worksheet.addRow([]);
//   worksheet.addRow([]);
//   worksheet.addRow(columns).eachCell((cell: Excel.Cell) => {
//     cell.font = { name: 'Calibri', color: { argb: 'FFFFFF' } };
//     cell.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: '1C4587' },
//     };
//   });
//   return { workbook, worksheet };
// };

// export const adjustColumnWidths = (worksheet: Excel.Worksheet, columnWidths: number[]) => {
//   columnWidths.forEach((width, index) => {
//     worksheet.getColumn(index + 1).width = width;
//   });
// };

// export const hyperLink = (param: string, hyperlink: string) => {
//   return {
//     text: param,
//     hyperlink: hyperlink,
//   };
// };
// export const getCurrentTimeExport = () => {
//   return moment().format('YYYY-MM-DD HH_mm_ss');
// };
