const express = require('express');
const { EndpointServiceClient } = require('@google-cloud/aiplatform').v1;
const router = express.Router();

const PROJECT_ID = 'luantra-platform';
const LOCATION = 'us-central1';

// Deploy a model to an endpoint
router.post('/create', async (req, res) => {
  try {
    const { modelName, endpointName } = req.body;
    
    console.log(`🚀 Deploying model ${modelName} to endpoint...`);
    
    const endpointServiceClient = new EndpointServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });
    
    const parent = `projects/${PROJECT_ID}/locations/${LOCATION}`;
    
    // Create endpoint
    const endpoint = {
      displayName: endpointName || `${modelName}-endpoint`,
      description: `Luantra deployment endpoint for ${modelName}`,
      labels: {
        created_by: "luantra",
        model: modelName,
        status: "active"
      }
    };
    
    const [operation] = await endpointServiceClient.createEndpoint({
      parent: parent,
      endpoint: endpoint
    });
    
    console.log('✅ Endpoint created:', operation.name);
    
    res.json({
      success: true,
      message: 'Model deployed successfully',
      endpoint: {
        name: operation.name,
        displayName: endpoint.displayName,
        status: 'CREATING'
      }
    });
    
  } catch (error) {
    console.error('❌ Deployment error:', error);
    res.status(500).json({ 
      error: 'Deployment failed', 
      details: error.message 
    });
  }
});

// List endpoints
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching endpoints from Vertex AI...');
    
    const endpointServiceClient = new EndpointServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });
    
    const parent = `projects/${PROJECT_ID}/locations/${LOCATION}`;
    const [endpoints] = await endpointServiceClient.listEndpoints({ parent });
    
    console.log(`✅ Found ${endpoints.length} endpoints`);
    
    const formattedEndpoints = endpoints.map(endpoint => ({
      name: endpoint.name,
      displayName: endpoint.displayName,
      createTime: endpoint.createTime,
      updateTime: endpoint.updateTime,
      state: endpoint.state || 'ACTIVE'
    }));
    
    res.json({
      success: true,
      endpoints: formattedEndpoints
    });
    
  } catch (error) {
    console.error('❌ Error listing endpoints:', error);
    res.json({ endpoints: [] });
  }
});

module.exports = router;
