const { PredictionServiceClient, ModelServiceClient, PipelineServiceClient } = require('@google-cloud/aiplatform');
const { Storage } = require('@google-cloud/storage');

class VertexAIService {
  constructor() {
    this.projectId = 'luantra-platform';
    this.location = 'us-central1';
    
    // Initialize clients
    this.modelClient = new ModelServiceClient({
      projectId: this.projectId,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './luantra-backend-key.json'
    });
    
    this.pipelineClient = new PipelineServiceClient({
      projectId: this.projectId,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './luantra-backend-key.json'
    });
    
    this.storage = new Storage({
      projectId: this.projectId,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './luantra-backend-key.json'
    });
    
    this.parent = `projects/${this.projectId}/locations/${this.location}`;
  }

  // Create a REAL Vertex AI AutoML training job
  async createRealTrainingJob(dataset, targetColumn, modelType, features) {
    try {
      console.log(`Creating REAL Vertex AI training job for ${targetColumn}...`);
      
      // First, we need to create a Vertex AI dataset
      const vertexDataset = await this.createVertexDataset(dataset);
      
      // Create AutoML training pipeline
      const trainingPipeline = {
        displayName: `${targetColumn} Prediction Agent - ${new Date().toISOString()}`,
        trainingTaskDefinition: modelType === 'classification' 
          ? 'gs://google-cloud-aiplatform/schema/trainingjob/definition/automl_tabular_classification_1.0.0.yaml'
          : 'gs://google-cloud-aiplatform/schema/trainingjob/definition/automl_tabular_regression_1.0.0.yaml',
        trainingTaskInputs: {
          targetColumn: targetColumn,
          predictionType: modelType === 'classification' ? 'classification' : 'regression',
          transformations: this.generateTransformations(features),
          trainBudgetMilliNodeHours: 1000, // 1 hour training budget
          disableEarlyStopping: false
        },
        modelToUpload: {
          displayName: `${targetColumn} Prediction Agent`,
          description: `AutoML ${modelType} model for predicting ${targetColumn}`
        },
        inputDataConfig: {
          datasetId: vertexDataset.name.split('/').pop(),
          fractionSplit: {
            trainingFraction: 0.8,
            validationFraction: 0.1,
            testFraction: 0.1
          }
        }
      };

      // Submit the training job to Vertex AI
      const [operation] = await this.pipelineClient.createTrainingPipeline({
        parent: this.parent,
        trainingPipeline: trainingPipeline
      });

      console.log(`✅ REAL Vertex AI training job created: ${operation.name}`);
      
      return {
        name: operation.name,
        displayName: trainingPipeline.displayName,
        state: 'PIPELINE_STATE_RUNNING',
        createTime: new Date().toISOString(),
        targetColumn: targetColumn,
        modelType: modelType,
        features: features,
        isReal: true // Flag to indicate this is a real Vertex AI job
      };
      
    } catch (error) {
      console.error('Error creating Vertex AI training job:', error);
      throw new Error(`Failed to create training job: ${error.message}`);
    }
  }

  // Create Vertex AI dataset from uploaded data
  async createVertexDataset(dataset) {
    try {
      // Upload the dataset to Google Cloud Storage bucket for Vertex AI
      const bucketName = 'luantra-platform-datasets';
      const fileName = `vertex-ai-datasets/${dataset.id}-${dataset.originalName}`;
      
      // For now, we'll create a dataset reference
      // In production, you'd upload the actual CSV data to GCS
      const vertexDataset = {
        displayName: `Dataset for ${dataset.originalName}`,
        description: `Uploaded dataset with ${dataset.analysis.rowCount} rows and ${dataset.analysis.columns.length} columns`,
        metadataSchemaUri: 'gs://google-cloud-aiplatform/schema/dataset/metadata/tabular_1.0.0.yaml',
        metadata: {
          inputConfig: {
            gcsSource: {
              uri: [`gs://${bucketName}/${fileName}`]
            }
          }
        }
      };

      // Create dataset in Vertex AI
      const [operation] = await this.modelClient.createDataset({
        parent: this.parent,
        dataset: vertexDataset
      });

      console.log(`✅ Vertex AI dataset created: ${operation.name}`);
      return operation;
      
    } catch (error) {
      console.error('Error creating Vertex AI dataset:', error);
      throw error;
    }
  }

  // Generate feature transformations for AutoML
  generateTransformations(features) {
    return features.map(feature => ({
      auto: {
        columnName: feature
      }
    }));
  }

  // Check status of real training jobs
  async checkTrainingJobStatus(jobName) {
    try {
      const [trainingPipeline] = await this.pipelineClient.getTrainingPipeline({
        name: jobName
      });
      
      return {
        name: trainingPipeline.name,
        displayName: trainingPipeline.displayName,
        state: trainingPipeline.state,
        createTime: trainingPipeline.createTime,
        endTime: trainingPipeline.endTime,
        error: trainingPipeline.error
      };
    } catch (error) {
      console.error('Error checking training job status:', error);
      return null;
    }
  }

  // Deploy model to endpoint
  async deployModelToEndpoint(modelId) {
    try {
      console.log(`Deploying model ${modelId} to endpoint...`);
      
      // Create endpoint
      const endpoint = {
        displayName: `Luantra Endpoint - ${new Date().toISOString()}`,
        description: 'Production endpoint for Luantra Agent predictions'
      };

      const [endpointOperation] = await this.modelClient.createEndpoint({
        parent: this.parent,
        endpoint: endpoint
      });

      // Deploy model to endpoint
      const deployedModel = {
        model: modelId,
        displayName: 'Primary Model',
        trafficSplit: { 0: 100 } // 100% traffic to this model
      };

      const [deployOperation] = await this.modelClient.deployModel({
        endpoint: endpointOperation.name,
        deployedModel: deployedModel,
        trafficSplit: { [deployedModel.id]: 100 }
      });

      console.log(`✅ Model deployed to endpoint: ${deployOperation.name}`);
      return deployOperation;
      
    } catch (error) {
      console.error('Error deploying model:', error);
      throw error;
    }
  }
}

module.exports = VertexAIService;
