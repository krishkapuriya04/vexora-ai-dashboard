import * as aiService from '../services/aiService.js';

export async function generateSummary(req, res, next) {
  try {
    const insight = await aiService.generateSummary(req.user, req.organizationId);
    res.status(201).json({ success: true, insight });
  } catch (error) {
    next(error);
  }
}

export async function generateRecommendations(req, res, next) {
  try {
    const insight = await aiService.generateRecommendations(req.user, req.organizationId);
    res.status(201).json({ success: true, insight });
  } catch (error) {
    next(error);
  }
}

export async function generateRiskAnalysis(req, res, next) {
  try {
    const insight = await aiService.generateRiskAnalysis(req.user, req.organizationId);
    res.status(201).json({ success: true, insight });
  } catch (error) {
    next(error);
  }
}

export async function generateForecast(req, res, next) {
  try {
    const insight = await aiService.generateForecast(req.user, req.organizationId);
    res.status(201).json({ success: true, insight });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req, res, next) {
  try {
    const insights = await aiService.getAIHistory(req.organizationId);
    res.json({ success: true, insights });
  } catch (error) {
    next(error);
  }
}

export default {
  generateSummary,
  generateRecommendations,
  generateRiskAnalysis,
  generateForecast,
  getHistory,
};
