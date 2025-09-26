const express = require('express');
const { ModelServiceClient } = require('@google-cloud/aiplatform').v1;
const router = express.Router();

const PROJECT_ID = 'luantra-platform';
const LOCATION = 'us-central1';

// Promote a completed training job to a model
router.post('/promote/:jobName', async (req, res) => {
  try {
    const { jobName } = req.params;
    const { modelName, modelType, targetVariable } = req.body;
    
    console.log(`🚀 Promoting training job ${jobName} to model...`);
    
    const modelServiceClient = new ModelServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });
    
    const parent = `projects/${PROJECT_ID}/locations/${LOCATION}`;
    
    const model = {
      displayName: modelName || `model-${Date.now()}`,
      description: `Luantra ${modelType} model for predicting ${targetVariable}`,
      metadataSchemaUri: "gs://google-cloud-aiplatform/schema/model/metadata/1.0.0",
      metadata: {
        framework: "custom",
        modelType: modelType || "regression",
        target: targetVariable,
        sourceTrainingJob: jobName,
        trainingCompleted: new Date().toISOString()
      },
      labels: {
        created_by: "luantra",
        type: modelType || "regression",
        target: targetVariable || "unknown",
        status: "ready"
      }
    };
    
    const [operation] = await modelServiceClient.uploadModel({
      parent: parent,
      model: model
    });
    
    console.log('✅ Model registered successfully:', operation.name);
    
    res.json({
      success: true,
      message: 'Model registered successfully',
      model: {
        name: operation.name,
        displayName: model.displayName,
        description: model.description
      }
    });
    
  } catch (error) {
    console.error('❌ Error promoting model:', error);
    res.status(500).json({
      error: 'Failed to promote model',
      details: error.message
    });
  }
});

module.exports = router;
