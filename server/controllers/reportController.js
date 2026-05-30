import * as reportService from '../services/reportService.js';

export async function listReports(req, res, next) {
  try {
    const reports = await reportService.listReports(req.organizationId);
    res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
}

export async function getReport(req, res, next) {
  try {
    const report = await reportService.getReport(req.organizationId, req.params.id);
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

export async function createReport(req, res, next) {
  try {
    const report = await reportService.createReport(req.organizationId, req.body);
    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

export async function updateReport(req, res, next) {
  try {
    const report = await reportService.updateReport(req.organizationId, req.params.id, req.body);
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

export async function deleteReport(req, res, next) {
  try {
    await reportService.deleteReport(req.organizationId, req.params.id);
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export default {
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
};
