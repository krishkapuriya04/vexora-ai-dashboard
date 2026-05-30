import * as dashboardService from '../services/dashboardService.js';

export async function getMetrics(req, res, next) {
  try {
    const metrics = await dashboardService.getMetrics(req.organizationId);
    res.json({ success: true, metrics });
  } catch (error) {
    next(error);
  }
}

export async function updateMetrics(req, res, next) {
  try {
    const metrics = await dashboardService.upsertMetrics(req.organizationId, req.body);
    res.json({ success: true, message: 'Metrics updated successfully', metrics });
  } catch (error) {
    next(error);
  }
}

export default { getMetrics, updateMetrics };
