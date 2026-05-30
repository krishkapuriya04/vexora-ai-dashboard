import * as exportService from '../services/exportService.js';

async function sendExport(res, result) {
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.setHeader('Content-Length', result.buffer.length);
  res.send(result.buffer);
}

export async function exportPdf(req, res, next) {
  try {
    const result = await exportService.generatePdfExport(req.organizationId, req.user._id);
    await sendExport(res, result);
  } catch (error) {
    next(error);
  }
}

export async function exportCsv(req, res, next) {
  try {
    const result = await exportService.generateCsvExport(req.organizationId, req.user._id);
    await sendExport(res, result);
  } catch (error) {
    next(error);
  }
}

export async function exportExcel(req, res, next) {
  try {
    const result = await exportService.generateExcelExport(req.organizationId, req.user._id);
    await sendExport(res, result);
  } catch (error) {
    next(error);
  }
}

export default { exportPdf, exportCsv, exportExcel };
