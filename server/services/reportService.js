import Report from '../models/Report.js';
import { AppError } from '../utils/errors.js';

export async function listReports(organizationId) {
  const reports = await Report.find({ organization: organizationId }).sort({ createdAt: -1 });
  return reports.map((r) => r.toPublicJSON());
}

export async function getReport(organizationId, reportId) {
  const report = await Report.findOne({ _id: reportId, organization: organizationId });
  if (!report) throw new AppError('Report not found', 404);
  return report.toPublicJSON();
}

export async function createReport(organizationId, payload) {
  const report = await Report.create({
    organization: organizationId,
    title: payload.title,
    description: payload.description || '',
    category: payload.category || 'Executive',
    pages: payload.pages,
    size: payload.size,
    status: payload.status,
    thumbnail: payload.thumbnail,
  });

  return report.toPublicJSON();
}

export async function updateReport(organizationId, reportId, payload) {
  const report = await Report.findOneAndUpdate(
    { _id: reportId, organization: organizationId },
    {
      $set: {
        ...(payload.title !== undefined && { title: payload.title }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.category !== undefined && { category: payload.category }),
        ...(payload.pages !== undefined && { pages: payload.pages }),
        ...(payload.size !== undefined && { size: payload.size }),
        ...(payload.status !== undefined && { status: payload.status }),
        ...(payload.thumbnail !== undefined && { thumbnail: payload.thumbnail }),
      },
    },
    { new: true, runValidators: true }
  );

  if (!report) throw new AppError('Report not found', 404);
  return report.toPublicJSON();
}

export async function deleteReport(organizationId, reportId) {
  const report = await Report.findOneAndDelete({ _id: reportId, organization: organizationId });
  if (!report) throw new AppError('Report not found', 404);
  return { success: true };
}

export default {
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
};
