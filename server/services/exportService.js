import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Parser } from '@json2csv/plainjs';
import { collectExportData } from './exportDataService.js';

const BRAND = {
  primary: '#6C63FF',
  dark: '#0B1020',
  muted: '#64748B',
  text: '#1E293B',
};

function slugify(name = 'vexora') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}

function pdfBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

function drawHeader(doc, organization, exportDate) {
  doc.rect(0, 0, doc.page.width, 90).fill(BRAND.dark);

  doc.circle(55, 45, 18).fill(BRAND.primary);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(16).text('V', 49, 37);

  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(22).text('VEXORA', 82, 28);
  doc.font('Helvetica').fontSize(10).fillColor('#CBD5E1').text('Business Intelligence Export', 82, 52);

  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11).text(organization.name, doc.page.width - 220, 28, { width: 200, align: 'right' });
  doc.font('Helvetica').fontSize(9).fillColor('#94A3B8').text(`Exported: ${exportDate}`, doc.page.width - 220, 48, { width: 200, align: 'right' });

  doc.y = 110;
  doc.fillColor(BRAND.text);
}

function sectionTitle(doc, title) {
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(BRAND.primary).text(title);
  doc.moveDown(0.3);
  doc.strokeColor(BRAND.primary).lineWidth(1).moveTo(doc.x, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fillColor(BRAND.text);
}

function ensureSpace(doc, height = 80) {
  if (doc.y + height > doc.page.height - 70) {
    doc.addPage();
    doc.fillColor(BRAND.text);
  }
}

function drawFooter(doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    doc.font('Helvetica').fontSize(8).fillColor(BRAND.muted)
      .text('VEXORA — Confidential Business Report | Generated automatically from live dashboard data', 50, doc.page.height - 40, {
        align: 'center',
        width: doc.page.width - 100,
      });
    doc.text(`Page ${i + 1} of ${range.count}`, 50, doc.page.height - 28, { align: 'center', width: doc.page.width - 100 });
  }
}

export async function generatePdfExport(organizationId, userId) {
  const data = await collectExportData(organizationId, userId);
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
  const bufferPromise = pdfBuffer(doc);

  drawHeader(doc, data.organization, data.exportDate);

  doc.font('Helvetica-Bold').fontSize(20).fillColor(BRAND.text).text('Executive Business Report');
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(11).fillColor(BRAND.muted)
    .text(`${data.organization.industry} · ${data.organization.size} employees · ${data.reports.length} reports on file`);

  sectionTitle(doc, 'KPI Summary');
  const kpis = data.metrics.kpis || [];
  kpis.forEach((kpi) => {
    ensureSpace(doc, 30);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND.text).text(kpi.label, { continued: true });
    doc.font('Helvetica').fillColor(BRAND.muted).text(`  (${kpi.change})`);
    const display = kpi.format === 'currency'
      ? formatCurrency(kpi.value)
      : `${kpi.value}${kpi.suffix || ''}`;
    doc.font('Helvetica-Bold').fontSize(13).fillColor(BRAND.primary).text(display);
    doc.moveDown(0.3);
  });

  sectionTitle(doc, 'Activities Summary');
  if (!data.activities.length) {
    doc.font('Helvetica').fontSize(10).text('No recent activities recorded.');
  } else {
    data.activities.slice(0, 8).forEach((item) => {
      ensureSpace(doc, 40);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND.text).text(`${item.icon} ${item.title}`);
      doc.font('Helvetica').fontSize(9).fillColor(BRAND.muted).text(`${item.desc} — ${item.time}`);
      doc.moveDown(0.2);
    });
  }

  sectionTitle(doc, 'Charts Summary');
  data.chartsSummary.forEach((chart) => {
    ensureSpace(doc, 30);
    doc.font('Helvetica-Bold').fontSize(10).text(chart.name);
    doc.font('Helvetica').fontSize(9).fillColor(BRAND.muted).text(chart.detail);
    doc.fillColor(BRAND.text);
    doc.moveDown(0.2);
  });

  sectionTitle(doc, 'Reports Library');
  data.reports.slice(0, 10).forEach((report) => {
    ensureSpace(doc, 35);
    doc.font('Helvetica-Bold').fontSize(10).text(report.title);
    doc.font('Helvetica').fontSize(9).fillColor(BRAND.muted)
      .text(`${report.category} · ${report.date} · ${report.pages} pages · ${report.status}`);
    doc.fillColor(BRAND.text);
    doc.moveDown(0.2);
  });

  sectionTitle(doc, 'Notifications Summary');
  const unread = data.notifications.filter((n) => n.unread).length;
  doc.font('Helvetica').fontSize(10).text(`Total: ${data.notifications.length} · Unread: ${unread}`);
  data.notifications.slice(0, 5).forEach((n) => {
    ensureSpace(doc, 30);
    doc.font('Helvetica-Bold').fontSize(10).text(n.title);
    doc.font('Helvetica').fontSize(9).fillColor(BRAND.muted).text(`${n.text} — ${n.time}`);
    doc.fillColor(BRAND.text);
    doc.moveDown(0.2);
  });

  drawFooter(doc);
  doc.end();

  const buffer = await bufferPromise;
  const filename = `${slugify(data.organization.name)}-vexora-report-${Date.now()}.pdf`;

  return { buffer, filename, contentType: 'application/pdf' };
}

export async function generateCsvExport(organizationId, userId) {
  const data = await collectExportData(organizationId, userId);

  const metricsRows = (data.metrics.kpis || []).map((kpi) => ({
    section: 'Dashboard Metrics',
    label: kpi.label,
    value: kpi.value,
    change: kpi.change,
    trend: kpi.trend,
  }));

  const reportRows = data.reports.map((report) => ({
    section: 'Reports',
    title: report.title,
    category: report.category,
    date: report.date,
    pages: report.pages,
    size: report.size,
    status: report.status,
    description: report.description || '',
  }));

  const parser = new Parser({
    fields: ['section', 'label', 'value', 'change', 'trend', 'title', 'category', 'date', 'pages', 'size', 'status', 'description'],
  });

  const csv = parser.parse([...metricsRows, ...reportRows]);
  const header = `# VEXORA Export — ${data.organization.name}\n# Exported: ${data.exportDate}\n\n`;
  const buffer = Buffer.from(header + csv, 'utf8');
  const filename = `${slugify(data.organization.name)}-vexora-export-${Date.now()}.csv`;

  return { buffer, filename, contentType: 'text/csv; charset=utf-8' };
}

function styleHeaderRow(row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6C63FF' } };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
  row.height = 22;
}

function autoWidth(sheet) {
  sheet.columns.forEach((column) => {
    let max = 12;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > max) max = Math.min(len + 2, 40);
    });
    column.width = max;
  });
}

export async function generateExcelExport(organizationId, userId) {
  const data = await collectExportData(organizationId, userId);
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'VEXORA';
  workbook.created = new Date();

  const metricsSheet = workbook.addWorksheet('Dashboard Metrics');
  metricsSheet.addRow(['VEXORA Export', data.organization.name, data.exportDate]);
  metricsSheet.addRow([]);
  metricsSheet.addRow(['Metric', 'Value', 'Change', 'Trend']);
  styleHeaderRow(metricsSheet.getRow(3));
  (data.metrics.kpis || []).forEach((kpi) => {
    metricsSheet.addRow([kpi.label, kpi.value, kpi.change, kpi.trend]);
  });
  autoWidth(metricsSheet);

  const activitiesSheet = workbook.addWorksheet('Activities');
  activitiesSheet.addRow(['Title', 'Description', 'Type', 'Time', 'Icon']);
  styleHeaderRow(activitiesSheet.getRow(1));
  data.activities.forEach((item) => {
    activitiesSheet.addRow([item.title, item.desc, item.type, item.time, item.icon]);
  });
  autoWidth(activitiesSheet);

  const reportsSheet = workbook.addWorksheet('Reports');
  reportsSheet.addRow(['Title', 'Category', 'Date', 'Pages', 'Size', 'Status', 'Description']);
  styleHeaderRow(reportsSheet.getRow(1));
  data.reports.forEach((report) => {
    reportsSheet.addRow([report.title, report.category, report.date, report.pages, report.size, report.status, report.description || '']);
  });
  autoWidth(reportsSheet);

  const notificationsSheet = workbook.addWorksheet('Notifications');
  notificationsSheet.addRow(['Title', 'Message', 'Type', 'Read', 'Time']);
  styleHeaderRow(notificationsSheet.getRow(1));
  data.notifications.forEach((n) => {
    notificationsSheet.addRow([n.title, n.text, n.type, n.read ? 'Yes' : 'No', n.time]);
  });
  autoWidth(notificationsSheet);

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const filename = `${slugify(data.organization.name)}-vexora-export-${Date.now()}.xlsx`;

  return { buffer, filename, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
}

export default {
  generatePdfExport,
  generateCsvExport,
  generateExcelExport,
};
