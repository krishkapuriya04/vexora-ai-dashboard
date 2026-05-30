import * as exportService from '../services/exportService.js';
import { logAudit } from '../services/auditService.js';

async function sendExport(res, result) {
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.setHeader('Content-Length', result.buffer.length);
  res.send(result.buffer);
}

async function logExport(req, format) {
  await logAudit({
    actor: req.user,
    action: 'export_generated',
    target: `${format.toUpperCase()} export`,
    targetType: 'export',
    organization: req.organizationId,
    organizationName: req.organization?.name || '',
    metadata: { format },
  });
}

export async function exportPdf(req, res, next) {
  try {
    const result = await exportService.generatePdfExport(req.organizationId, req.user._id);
    await logExport(req, 'pdf');
    await sendExport(res, result);
  } catch (error) {
    next(error);
  }
}

export async function exportCsv(req, res, next) {
  try {
    const result = await exportService.generateCsvExport(req.organizationId, req.user._id);
    await logExport(req, 'csv');
    await sendExport(res, result);
  } catch (error) {
    next(error);
  }
}

export async function exportExcel(req, res, next) {
  try {
    const result = await exportService.generateExcelExport(req.organizationId, req.user._id);
    await logExport(req, 'excel');
    await sendExport(res, result);
  } catch (error) {
    next(error);
  }
}

export default { exportPdf, exportCsv, exportExcel };
