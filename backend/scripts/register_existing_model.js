const { ModelServiceClient } = require('@google-cloud/aiplatform').v1;

const PROJECT_ID = 'luantra-platform';
const LOCATION = 'us-central1';

async function registerExistingModel() {
  try {
    const modelServiceClient = new ModelServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });
    
    const parent = `projects/${PROJECT_ID}/locations/${LOCATION}`;
    
    // Register your completed training job as a model
    const model = {
      displayName: 'median-house-value-predictor',
      description: 'Luantra regression model for predicting median_house_value',
      metadataSchemaUri: "gs://google-cloud-aiplatform/schema/model/metadata/1.0.0",
      metadata: {
        framework: "custom",
        modelType: "regression",
        target: "median_house_value",
        trainingCompleted: new Date().toISOString()
      },
      labels: {
        created_by: "luantra",
        type: "regression", 
        target: "median_house_value",
        status: "ready"
      }
    };

    console.log('🚀 Registering existing training job as model...');
    
    const [operation] = await modelServiceClient.uploadModel({
      parent: parent,
      model: model
    });

    console.log('✅ Model registered successfully!');
    console.log('Model name:', operation.name);
    console.log('🎯 Model should now appear in Vertex AI Model Registry and frontend');
    
    return operation;
  } catch (error) {
    console.error('❌ Error registering model:', error);
  }
}

registerExistingModel();
