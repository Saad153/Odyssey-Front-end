const ExcelJS = require("exceljs");

export default function exportExcelFile(data, columns, options = {}){
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(options.sheetName || "Report");
    sheet.properties.defaultRowHeight = 25;

    sheet.columns = columns.map(col => ({
        key: col.key,
        width: col.width || 15,
    }));

    const headerTexts = [];
    if (options.title) headerTexts.push(options.title);
    if (options.address) headerTexts.push(options.address);
    if (options.dateRange) headerTexts.push(options.dateRange);

    headerTexts.forEach((text, index) => {
        const row = sheet.getRow(index + 1);
        row.getCell(1).value = text;
        row.getCell(1).font = { bold: true, size: index === 0 ? 16 : 12 };
        row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
        sheet.mergeCells(index + 1, 1, index + 1, columns.length);
        row.height = 22;
        row.commit();
    });

    const headerRowIndex = headerTexts.length + 2;
    const headerRow = sheet.getRow(headerRowIndex);
    headerRow.values = columns.map(col => col.header);
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE6E6E6" },
        };
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            top: { style: "thin", color: { argb: "FFBFBFBF" } },
            left: { style: "thin", color: { argb: "FFBFBFBF" } },
            bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
            right: { style: "thin", color: { argb: "FFBFBFBF" } },
        };
    });
    headerRow.height = 20;

    data.forEach((product) => {
        const { SE_Job, ...restProduct } = product;
        const obj = { ...SE_Job, ...restProduct };
        const rowValues = columns.map(col => {
            const value = obj[col.key];
            return value === undefined || value === null ? '' : value;
        });
        sheet.addRow(rowValues);
    });

    const fileName = options.fileName || "download.xlsx";

    workbook.xlsx.writeBuffer().then(function (buffer) {
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
    });
};