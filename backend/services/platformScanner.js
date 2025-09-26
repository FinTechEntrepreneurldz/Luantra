const { JobServiceClient, ModelServiceClient, EndpointServiceClient } = require('@google-cloud/aiplatform').v1;
const { Storage } = require('@google-cloud/storage');
const LocalModelPersistence = require('./localModelPersistence');

class PlatformScanner {
  constructor() {
    this.modelPersistence = new LocalModelPersistence();
    this.parent = `projects/luantra-platform/locations/us-central1`;
    
    // Initialize Vertex AI clients only if authenticated
    try {
      this.jobServiceClient = new JobServiceClient({
        apiEndpoint: 'us-central1-aiplatform.googleapis.com',
      });
      this.modelServiceClient = new ModelServiceClient({
        apiEndpoint: 'us-central1-aiplatform.googleapis.com',
      });
      this.endpointServiceClient = new EndpointServiceClient({
        apiEndpoint: 'us-central1-aiplatform.googleapis.com',
      });
      this.vertexAIAvailable = true;
    } catch (error) {
      console.warn('Vertex AI not available, using local persistence only');
      this.vertexAIAvailable = false;
    }
  }

  async scanCompleteVertexAI() {
    try {
      console.log('🔍 Scanning platform (local persistence mode)...');
      
      // Get persisted models (primary source)
      const persistedModels = await this.modelPersistence.getAllModels();
      
      // Try to get Vertex AI data if available
      let vertexData = { jobs: [], vertexModels: [], endpoints: [] };
      
      if (this.vertexAIAvailable) {
        try {
          const [jobs] = await this.jobServiceClient.listCustomJobs({ parent: this.parent });
          const [vertexModels] = await this.modelServiceClient.listModels({ parent: this.parent });
          const [endpoints] = await this.endpointServiceClient.listEndpoints({ parent: this.parent });
          
          vertexData = { jobs, vertexModels, endpoints };
        } catch (error) {
          console.warn('Could not fetch Vertex AI data:', error.message);
        }
      }

      const result = {
        persistedModels,
        jobs: vertexData.jobs.map(job => ({
          id: job.name.split('/').pop(),
          name: job.displayName,
          state: job.state,
          createTime: job.createTime,
          fullName: job.name
        })),
        connectedModels: persistedModels.map(model => ({
          ...model,
          isDeployed: true, // Assume deployed for demo
          endpoints: [{ id: 'demo-endpoint', name: 'Demo Endpoint' }]
        })),
        scanTime: new Date().toISOString()
      };

      console.log(`✅ Scanned: ${persistedModels.length} persisted models`);
      return result;

    } catch (error) {
      console.error('Error scanning platform:', error);
      throw error;
    }
  }

  async generateUIConfigForModel(modelId) {
    try {
      const platformData = await this.scanCompleteVertexAI();
      const model = platformData.connectedModels.find(m => 
        m.id === modelId || 
        m.name.toLowerCase().includes(modelId.toLowerCase())
      );

      if (!model) {
        throw new Error(`Model ${modelId} not found in persisted models`);
      }

      const uiConfig = this.generateDynamicUI(model);
      
      return {
        model,
        uiConfig,
        endpoint: model.endpoints[0],
        platformData
      };

    } catch (error) {
      console.error(`Error generating UI config for model ${modelId}:`, error);
      throw error;
    }
  }

  generateDynamicUI(model) {
    const modelName = model.name.toLowerCase();
    
    let formFields = [];
    let theme = 'blue';
    let icon = 'Brain';
    let resultTitle = 'Prediction Result';

    if (model.modelType === 'housing' || modelName.includes('housing') || modelName.includes('price')) {
      formFields = [
        { name: 'bedrooms', label: 'Bedrooms', type: 'number', placeholder: 'Number of bedrooms', required: true, min: 1, max: 10 },
        { name: 'bathrooms', label: 'Bathrooms', type: 'number', placeholder: 'Number of bathrooms', required: true, min: 1, max: 5, step: 0.5 },
        { name: 'sqft', label: 'Square Feet', type: 'number', placeholder: 'Total square footage', required: true },
        { name: 'location', label: 'Location', type: 'select', options: ['Downtown', 'Suburbs', 'Waterfront', 'Rural'], required: true }
      ];
      theme = 'green';
      icon = 'Home';
      resultTitle = 'Estimated Price';
    } else {
      formFields = [
        { name: 'feature1', label: 'Feature 1', type: 'number', placeholder: 'Enter value', required: true },
        { name: 'feature2', label: 'Feature 2', type: 'number', placeholder: 'Enter value', required: true }
      ];
    }

    return {
      title: `${model.name} Predictor`,
      description: `Get AI-powered predictions using the ${model.name} model.`,
      theme,
      icon,
      formFields,
      resultTitle,
      modelInfo: {
        accuracy: model.accuracy || 0.85,
        type: model.modelType || 'Custom Model',
        trainingData: model.datasetPath || 'Custom Dataset',
        endpoint: 'Local Demo Endpoint'
      }
    };
  }
}

module.exports = PlatformScanner;
