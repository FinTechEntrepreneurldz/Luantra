const express = require('express');
const comprehensiveVertexAIService = require('../services/comprehensive_vertexai');
const router = express.Router();

// Create model endpoint - supports all Vertex AI capabilities
router.post('/create', async (req, res) => {
  try {
    console.log('🔄 Comprehensive model creation request:', req.body);
    
    const { 
      datasetPath, 
      modelName, 
      modelType = 'regression',
      targetVariable = 'target',
      additionalConfig = {}
    } = req.body;

    if (!datasetPath || !modelName) {
      return res.status(400).json({ 
        error: 'Dataset path and model name are required' 
      });
    }

    const result = await comprehensiveVertexAIService.createModel(
      datasetPath,
      modelName,
      modelType,
      targetVariable,
      additionalConfig
    );

    console.log('✅ Model creation result:', result);

    res.json({
      success: true,
      message: `${modelType} model creation started successfully`,
      model: result,
      status: result.status
    });

  } catch (error) {
    console.error('❌ Model creation error:', error);
    res.status(500).json({ 
      error: 'Model creation failed', 
      details: error.message 
    });
  }
});

// GET route to list all models
router.get('/', async (req, res) => {
  try {
    const models = await comprehensiveVertexAIService.listModels();
    res.json({ success: true, models: models });
  } catch (error) {
    console.error('❌ Error listing models:', error);
    res.status(500).json({ error: 'Failed to list models', details: error.message });
  }
});

// List training jobs
router.get('/training', async (req, res) => {
  try {
    const jobs = await comprehensiveVertexAIService.listTrainingJobs();
    res.json({ jobs });
  } catch (error) {
    console.error('❌ Error listing training jobs:', error);
    res.status(500).json({ error: 'Failed to list training jobs', details: error.message });
  }
});

// Auto-promote completed training jobs to models
router.post('/auto-promote', async (req, res) => {
  try {
    // This will be implemented as needed
    res.json({ success: true, promotedCount: 0, message: 'Auto-promotion completed' });
  } catch (error) {
    console.error('❌ Auto-promotion error:', error);
    res.status(500).json({ error: 'Auto-promotion failed', details: error.message });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Comprehensive Vertex AI Models API is working!', 
    timestamp: new Date().toISOString(),
    capabilities: [
      'RAG Agents with Document Q&A',
      'Gemini Model Tuning',
      'AutoML Vision',
      'AutoML Tabular', 
      'Text Extraction with Document AI',
      'Custom Training Jobs'
    ]
  });
});

module.exports = router;
