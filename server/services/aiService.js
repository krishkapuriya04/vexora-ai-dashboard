import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';
import AIInsight from '../models/AIInsight.js';
import DashboardMetric from '../models/DashboardMetric.js';
import Organization from '../models/Organization.js';
import Activity from '../models/Activity.js';
import Report from '../models/Report.js';
import Subscription from '../models/Subscription.js';
import { AppError } from '../utils/errors.js';

const CATEGORY_MAP = {
  summary: 'Executive Summary',
  recommendations: 'Recommendation',
  risk: 'Risk Analysis',
  forecast: 'Forecast',
};

let genAI = null;

function getModel() {
  if (env.geminiMock) return null;
  if (!env.geminiApiKey) {
    throw new AppError('AI engine is not configured. Set GEMINI_API_KEY.', 503);
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.geminiApiKey);
  }
  return genAI.getGenerativeModel({ model: env.geminiModel });
}

export async function gatherBusinessContext(organizationId) {
  const [org, metrics, activities, reports, subscription] = await Promise.all([
    Organization.findById(organizationId),
    DashboardMetric.findOne({ organization: organizationId }),
    Activity.find({ organization: organizationId }).sort({ timestamp: -1 }).limit(10),
    Report.find({ organization: organizationId }).sort({ createdAt: -1 }).limit(8),
    Subscription.findOne({ organization: organizationId }),
  ]);

  return {
    organization: {
      name: org?.name || 'Unknown Organization',
      industry: org?.industry || 'N/A',
      size: org?.size || 'N/A',
      status: org?.status || 'active',
    },
    metrics: {
      revenue: metrics?.revenue ?? 0,
      activeUsers: metrics?.activeUsers ?? 0,
      growthRate: metrics?.growthRate ?? 0,
      conversionRate: metrics?.conversionRate ?? 0,
      aiScore: metrics?.aiScore ?? 0,
      customerSatisfaction: metrics?.customerSatisfaction ?? 0,
    },
    activities: activities.map((a) => ({
      title: a.title,
      description: a.description,
      type: a.type,
      timestamp: a.timestamp,
    })),
    reports: reports.map((r) => ({
      title: r.title,
      category: r.category,
      description: r.description,
    })),
    subscription: subscription
      ? { plan: subscription.plan, status: subscription.status, endDate: subscription.endDate }
      : { plan: 'none', status: 'none', endDate: null },
  };
}

function buildContextBlock(context) {
  return JSON.stringify(context, null, 2);
}

function buildPrompt(type, context) {
  const data = buildContextBlock(context);
  const orgName = context.organization.name;

  const prompts = {
    summary: `You are a senior business intelligence analyst for VEXORA SaaS platform.
Analyze the following real business data for "${orgName}" and write an Executive Summary.

Include:
1. Company performance summary (2-3 paragraphs)
2. KPI interpretation (revenue, users, growth, conversion)
3. Key observations from recent activities and reports

Use clear markdown headings. Be specific with numbers from the data. Keep response under 500 words.

Business Data:
${data}`,

    recommendations: `You are a growth strategist for VEXORA SaaS platform.
Based on the real business data for "${orgName}", generate actionable Recommendations.

Include sections for:
1. Growth Recommendations (3-5 bullet points)
2. Revenue Recommendations (3-5 bullet points)
3. Retention Recommendations (3-5 bullet points)

Use markdown. Reference actual metrics. Be practical and specific. Keep under 500 words.

Business Data:
${data}`,

    risk: `You are a risk analyst for VEXORA SaaS platform.
Analyze the real business data for "${orgName}" and produce a Risk Analysis.

Include:
1. Potential Risks (ranked by severity)
2. Weak Metrics (with explanation)
3. Business Concerns (action items)

Use markdown with clear headings. Cite specific data points. Keep under 500 words.

Business Data:
${data}`,

    forecast: `You are a forecasting analyst for VEXORA SaaS platform.
Using the real business data for "${orgName}", generate a Forecast report.

Include:
1. Revenue Forecast (next 3 months with reasoning)
2. Growth Forecast (user and growth rate projections)
3. User Forecast (active user trends)

Use markdown. Base projections on current metrics and trends. Include confidence notes. Keep under 500 words.

Business Data:
${data}`,
  };

  return prompts[type];
}

function mockResponse(type, context) {
  const m = context.metrics;
  const org = context.organization.name;

  const mocks = {
    summary: `# Executive Summary — ${org}

## Performance Overview
${org} is operating with **$${m.revenue.toLocaleString()}** in total revenue and **${m.activeUsers.toLocaleString()}** active users. Growth rate stands at **${m.growthRate}%** with a conversion rate of **${m.conversionRate}%**.

## KPI Interpretation
- **Revenue**: Current revenue performance reflects ${m.growthRate >= 5 ? 'strong' : 'moderate'} market traction.
- **Active Users**: User base of ${m.activeUsers.toLocaleString()} indicates ${m.activeUsers >= 10000 ? 'healthy' : 'developing'} engagement.
- **Growth Rate**: At ${m.growthRate}%, growth is ${m.growthRate >= 10 ? 'above' : 'at or below'} typical SaaS benchmarks.
- **Conversion**: ${m.conversionRate}% conversion ${m.conversionRate >= 3 ? 'meets' : 'falls short of'} industry standards.

## Key Observations
- AI Score of ${m.aiScore}/100 suggests ${m.aiScore >= 80 ? 'strong' : 'room for improvement in'} operational intelligence.
- Customer satisfaction at ${m.customerSatisfaction}% ${m.customerSatisfaction >= 90 ? 'is excellent' : 'needs attention'}.
- ${context.activities.length} recent activities tracked; ${context.reports.length} reports available for review.
- Subscription: ${context.subscription.plan} (${context.subscription.status}).`,

    recommendations: `# Recommendations — ${org}

## Growth Recommendations
- Accelerate user acquisition campaigns targeting ${m.growthRate < 10 ? 'underperforming' : 'high-growth'} segments
- Expand into adjacent markets aligned with ${context.organization.industry} vertical
- Launch referral program to leverage ${m.activeUsers.toLocaleString()} existing users

## Revenue Recommendations
- Optimize pricing for current $${m.revenue.toLocaleString()} revenue base with tiered upsells
- Focus on high-converting channels (${m.conversionRate}% current conversion)
- Introduce annual billing incentives to improve cash flow

## Retention Recommendations
- Address satisfaction gaps if CSAT (${m.customerSatisfaction}%) drops below 92%
- Implement proactive outreach for at-risk accounts from activity signals
- Deploy onboarding improvements for new user cohorts`,

    risk: `# Risk Analysis — ${org}

## Potential Risks
1. **Growth Deceleration** (${m.growthRate < 8 ? 'High' : 'Medium'}): Growth at ${m.growthRate}% may ${m.growthRate < 5 ? 'signal market saturation' : 'require monitoring'}.
2. **Conversion Pressure** (${m.conversionRate < 3 ? 'High' : 'Low'}): ${m.conversionRate}% conversion rate ${m.conversionRate < 3 ? 'is below SaaS median' : 'is acceptable'}.
3. **Subscription Gap** (${context.subscription.status === 'active' ? 'Low' : 'Medium'}): Plan status is ${context.subscription.status}.

## Weak Metrics
- ${m.aiScore < 85 ? `AI Score (${m.aiScore}/100) indicates operational gaps` : 'No critical weak metrics identified'}
- ${m.customerSatisfaction < 90 ? `CSAT at ${m.customerSatisfaction}% needs improvement` : 'CSAT is within healthy range'}

## Business Concerns
- Monitor revenue concentration and diversify income streams
- Review recent ${context.activities.length} activities for anomaly patterns
- ${context.subscription.plan === 'none' ? 'No active subscription — monetization risk' : `Ensure ${context.subscription.plan} plan renewal on track`}`,

    forecast: `# Forecast — ${org}

## Revenue Forecast
- **Month 1**: $${Math.round(m.revenue * 1.03).toLocaleString()} (+3% projected)
- **Month 2**: $${Math.round(m.revenue * 1.06).toLocaleString()} (+6% cumulative)
- **Month 3**: $${Math.round(m.revenue * 1.09).toLocaleString()} (+9% cumulative)
*Based on ${m.growthRate}% current growth rate*

## Growth Forecast
- Growth rate expected to ${m.growthRate >= 10 ? 'maintain' : 'improve to'} ${Math.max(m.growthRate, 8).toFixed(1)}% over next quarter
- User base projected: ${Math.round(m.activeUsers * 1.08).toLocaleString()} users (+8%)

## User Forecast
- Active users trending from ${m.activeUsers.toLocaleString()} toward ${Math.round(m.activeUsers * 1.12).toLocaleString()} in 90 days
- Conversion expected at ${(m.conversionRate * 1.02).toFixed(2)}% with optimization efforts
- Confidence: ${m.aiScore >= 80 ? 'High' : 'Medium'} based on data quality`,
  };

  return mocks[type];
}

async function callGemini(prompt) {
  if (env.geminiMock) {
    return null;
  }
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateAndStore(actor, organizationId, type) {
  const category = CATEGORY_MAP[type];
  if (!category) throw new AppError('Invalid AI generation type', 400);

  const context = await gatherBusinessContext(organizationId);
  const prompt = buildPrompt(type, context);

  let response;
  try {
    response = await callGemini(prompt);
    if (!response) {
      response = mockResponse(type, context);
    }
  } catch (error) {
    if (env.geminiMock) {
      response = mockResponse(type, context);
    } else {
      throw new AppError(`AI generation failed: ${error.message}`, 502);
    }
  }

  if (!response?.trim()) {
    throw new AppError('AI returned an empty response', 502);
  }

  const insight = await AIInsight.create({
    organization: organizationId,
    prompt,
    response: response.trim(),
    category,
    createdBy: actor._id,
    createdByName: actor.fullName,
  });

  return insight.toPublicJSON();
}

export async function generateSummary(actor, organizationId) {
  return generateAndStore(actor, organizationId, 'summary');
}

export async function generateRecommendations(actor, organizationId) {
  return generateAndStore(actor, organizationId, 'recommendations');
}

export async function generateRiskAnalysis(actor, organizationId) {
  return generateAndStore(actor, organizationId, 'risk');
}

export async function generateForecast(actor, organizationId) {
  return generateAndStore(actor, organizationId, 'forecast');
}

export async function getAIHistory(organizationId, { limit = 50 } = {}) {
  const insights = await AIInsight.find({ organization: organizationId })
    .sort({ createdAt: -1 })
    .limit(limit);
  return insights.map((i) => i.toPublicJSON());
}

export async function getAIStats(actor) {
  const orgFilter = actor.role === 'Admin' ? {} : { organization: actor.organization };

  const [totalAIRequests, forecastsGenerated, recommendationsGenerated, mostActive] = await Promise.all([
    AIInsight.countDocuments(orgFilter),
    AIInsight.countDocuments({ ...orgFilter, category: 'Forecast' }),
    AIInsight.countDocuments({ ...orgFilter, category: 'Recommendation' }),
    AIInsight.aggregate([
      ...(actor.role === 'Manager' ? [{ $match: { organization: actor.organization } }] : []),
      { $group: { _id: '$organization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
  ]);

  let mostActiveOrganization = '—';
  if (mostActive[0]?._id) {
    const org = await Organization.findById(mostActive[0]._id).select('name');
    mostActiveOrganization = org?.name || '—';
  }

  return {
    totalAIRequests,
    forecastsGenerated,
    recommendationsGenerated,
    mostActiveOrganization,
    mostActiveCount: mostActive[0]?.count || 0,
  };
}

export default {
  gatherBusinessContext,
  generateSummary,
  generateRecommendations,
  generateRiskAnalysis,
  generateForecast,
  getAIHistory,
  getAIStats,
};
