const { Storage } = require('@google-cloud/storage');
const { JobServiceClient, ModelServiceClient, EndpointServiceClient } = require('@google-cloud/aiplatform').v1;

class DynamicGeminiService {
  constructor() {
    this.storage = new Storage();
    this.jobServiceClient = new JobServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });
    this.modelServiceClient = new ModelServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });
    this.endpointServiceClient = new EndpointServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });
    this.parent = `projects/luantra-platform/locations/us-central1`;
  }

  // Get REAL data from the entire pipeline
  async getCompletePipelineState() {
    try {
      const [datasets, modelMetadataList, vertexModels, endpoints, trainingJobs] = await Promise.all([
        this.getActualDatasets(),
        this.getActualModelMetadata(),
        this.getActualVertexModels(),
        this.getActualEndpoints(),
        this.getActualTrainingJobs()
      ]);

      return {
        datasets,
        modelMetadataList,
        vertexModels,
        endpoints,
        trainingJobs,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting pipeline state:', error);
      return { error: error.message };
    }
  }

  async getActualDatasets() {
    try {
      const bucket = this.storage.bucket('luantra-platform-datasets');
      const [files] = await bucket.getFiles({ prefix: 'datasets/' });
      
      const datasets = await Promise.all(files.map(async (file) => {
        try {
          const [metadata] = await file.getMetadata();
          const [exists] = await file.exists();
          
          if (exists) {
            // Try to get analysis data if available
            let analysisData = null;
            try {
              const [content] = await file.download();
              const lines = content.toString().split('\n');
              const headers = lines[0] ? lines[0].split(',') : [];
              
              analysisData = {
                columns: headers.map(h => h.trim()),
                rowCount: lines.length - 1,
                sampleData: lines.slice(1, 3).map(line => line.split(','))
              };
            } catch (e) {
              console.log('Could not analyze file content:', e.message);
            }

            return {
              name: file.name,
              originalName: file.name.split('-').slice(1).join('-'),
              size: metadata.size,
              uploaded: metadata.timeCreated,
              contentType: metadata.contentType,
              analysis: analysisData
            };
          }
        } catch (e) {
          console.log('Error processing dataset:', e.message);
          return null;
        }
      }));

      return datasets.filter(d => d !== null);
    } catch (error) {
      console.error('Error getting datasets:', error);
      return [];
    }
  }

  async getActualModelMetadata() {
    try {
      const bucket = this.storage.bucket('luantra-platform-models');
      const [files] = await bucket.getFiles();
      
      const modelMetadata = [];
      
      for (const file of files) {
        if (file.name.endsWith('/metadata.json')) {
          try {
            const [content] = await file.download();
            const metadata = JSON.parse(content.toString());
            modelMetadata.push({
              ...metadata,
              storagePath: file.name,
              modelFolder: file.name.split('/')[0]
            });
          } catch (e) {
            console.log('Could not parse metadata:', e.message);
          }
        }
      }

      return modelMetadata;
    } catch (error) {
      console.error('Error getting model metadata:', error);
      return [];
    }
  }

  async getActualVertexModels() {
    try {
      const [models] = await this.modelServiceClient.listModels({
        parent: this.parent
      });

      return models.map(model => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        createTime: model.createTime,
        updateTime: model.updateTime,
        labels: model.labels
      }));
    } catch (error) {
      console.error('Error getting Vertex AI models:', error);
      return [];
    }
  }

  async getActualEndpoints() {
    try {
      const [endpoints] = await this.endpointServiceClient.listEndpoints({
        parent: this.parent
      });

      return endpoints.map(endpoint => ({
        name: endpoint.name,
        displayName: endpoint.displayName,
        description: endpoint.description,
        createTime: endpoint.createTime,
        updateTime: endpoint.updateTime,
        labels: endpoint.labels,
        deployedModels: endpoint.deployedModels || []
      }));
    } catch (error) {
      console.error('Error getting endpoints:', error);
      return [];
    }
  }

  async getActualTrainingJobs() {
    try {
      const [jobs] = await this.jobServiceClient.listCustomJobs({
        parent: this.parent
      });

      return jobs.map(job => ({
        name: job.name,
        displayName: job.displayName,
        state: job.state,
        createTime: job.createTime,
        updateTime: job.updateTime,
        startTime: job.startTime,
        endTime: job.endTime,
        error: job.error
      }));
    } catch (error) {
      console.error('Error getting training jobs:', error);
      return [];
    }
  }

  // Generate completely dynamic chat responses based on REAL data
  async generateDynamicResponse(userMessage, currentContext = {}) {
    const pipelineState = await this.getCompletePipelineState();
    
    // Analyze what the user is asking about
    const intent = this.analyzeUserIntent(userMessage, pipelineState);
    
    return this.createContextualResponse(intent, pipelineState, userMessage, currentContext);
  }

  analyzeUserIntent(message, pipelineState) {
    const msg = message.toLowerCase();
    
    // Check for specific data references
    const mentionsDataset = pipelineState.datasets.some(d => 
      msg.includes(d.originalName.toLowerCase()) || 
      msg.includes(d.name.toLowerCase())
    );
    
    const mentionsModel = pipelineState.modelMetadataList.some(m => 
      msg.includes(m.model_name.toLowerCase())
    );
    
    const mentionsEndpoint = pipelineState.endpoints.some(e => 
      msg.includes(e.displayName.toLowerCase())
    );

    return {
      type: this.getIntentType(msg),
      specificallyMentions: {
        dataset: mentionsDataset,
        model: mentionsModel,
        endpoint: mentionsEndpoint
      },
      pipelineStage: this.determinePipelineStage(pipelineState)
    };
  }

  getIntentType(msg) {
    if (msg.includes('upload') || msg.includes('add data')) return 'upload';
    if (msg.includes('analyze') || msg.includes('columns')) return 'analyze';  
    if (msg.includes('train') || msg.includes('create model')) return 'train';
    if (msg.includes('deploy') || msg.includes('endpoint')) return 'deploy';
    if (msg.includes('predict') || msg.includes('use model')) return 'predict';
    if (msg.includes('status') || msg.includes('progress')) return 'status';
    return 'general';
  }

  determinePipelineStage(state) {
    if (state.datasets.length === 0) return 'needs_upload';
    if (state.modelMetadataList.length === 0) return 'needs_training';
    if (state.endpoints.length === 0) return 'needs_deployment';
    return 'fully_operational';
  }

  createContextualResponse(intent, pipelineState, originalMessage, context) {
    const { datasets, modelMetadataList, endpoints, trainingJobs } = pipelineState;
    
    switch (intent.type) {
      case 'upload':
        if (datasets.length === 0) {
          return "Perfect! Let's get your first dataset uploaded. Click the upload area in the TALK tab and I'll analyze it for you once it's ready.";
        } else {
          const recentDataset = datasets[datasets.length - 1];
          return `You have ${datasets.length} datasets already! Your most recent is "${recentDataset.originalName}" (${recentDataset.analysis?.rowCount || 'unknown'} rows). Want to upload another or work with existing data?`;
        }

      case 'analyze':
        if (datasets.length === 0) {
          return "You'll need to upload a dataset first before I can analyze it. Head to the TALK tab!";
        } else {
          const datasetInfo = datasets.map(d => `"${d.originalName}" (${d.analysis?.columns?.length || 'unknown'} columns)`).join(', ');
          return `I can analyze these datasets for you: ${datasetInfo}. Go to the BUILD tab, select a dataset, and I'll examine the columns and suggest the best target variable and model type.`;
        }

      case 'train':
        if (datasets.length === 0) {
          return "You need data first! Upload a dataset in the TALK tab, then we can train a model.";
        }
        
        const activeTraining = trainingJobs.filter(j => j.state === 'JOB_STATE_RUNNING').length;
        if (activeTraining > 0) {
          return `You have ${activeTraining} model(s) currently training! Check their progress or start another training job in the BUILD tab.`;
        }
        
        if (modelMetadataList.length > 0) {
          const modelNames = modelMetadataList.map(m => m.model_name).join(', ');
          return `You've already trained: ${modelNames}. Want to train another model with different data or settings?`;
        }
        
        return `Ready to train! You have ${datasets.length} dataset(s) available. Go to BUILD tab, analyze your data, then I'll help you configure the perfect model.`;

      case 'deploy':
        if (modelMetadataList.length === 0) {
          return "You need to train a model first before deploying. Complete the TALK → BUILD pipeline!";
        }
        
        if (endpoints.length > 0) {
          const endpointNames = endpoints.map(e => e.displayName).join(', ');
          return `You have these deployed models: ${endpointNames}. Deploy more in the DEPLOY tab or visit /predict to use them!`;
        }
        
        const trainedModels = modelMetadataList.map(m => m.model_name).join(', ');
        return `Perfect! You have trained models ready: ${trainedModels}. Go to the DEPLOY tab and I'll help you deploy them to production endpoints.`;

      case 'predict':
        if (endpoints.length === 0) {
          return "No deployed models yet! Complete TALK → BUILD → DEPLOY first, then visit /predict to use your AI models.";
        }
        
        const availableModels = endpoints.map(e => e.displayName).join(', ');
        return `Excellent! You have ${endpoints.length} deployed model(s): ${availableModels}. Visit /predict and I'll create a custom interface for each model based on their training data!`;

      case 'status':
        const statusParts = [
          `📊 Datasets: ${datasets.length}${datasets.length > 0 ? ` (latest: "${datasets[datasets.length - 1].originalName}")` : ''}`,
          `🧠 Trained Models: ${modelMetadataList.length}${modelMetadataList.length > 0 ? ` (${modelMetadataList.map(m => m.model_name).join(', ')})` : ''}`,
          `🚀 Deployed Endpoints: ${endpoints.length}${endpoints.length > 0 ? ` (${endpoints.map(e => e.displayName).join(', ')})` : ''}`,
          `⏳ Active Training Jobs: ${trainingJobs.filter(j => j.state === 'JOB_STATE_RUNNING').length}`
        ];
        return `Here's your real-time Luantra status:\n\n${statusParts.join('\n')}\n\nWhat would you like to work on?`;

      default:
        // Super contextual general response based on current state
        if (intent.pipelineStage === 'needs_upload') {
          return "Welcome to Luantra! 🚀 Let's start by uploading your dataset in the TALK tab. I'll analyze it and guide you through creating your AI model.";
        } else if (intent.pipelineStage === 'needs_training') {
          return `Great! You have ${datasets.length} dataset(s) uploaded. Ready to build AI models? Head to the BUILD tab and I'll help you train custom models with human-in-the-loop guidance.`;
        } else if (intent.pipelineStage === 'needs_deployment') {
          return `Awesome! You've trained ${modelMetadataList.length} model(s). Time to deploy them! Go to the DEPLOY tab and I'll help you create production endpoints.`;
        } else {
          return `Amazing! Your pipeline is fully operational with ${datasets.length} datasets, ${modelMetadataList.length} models, and ${endpoints.length} endpoints. Visit /predict to use your AI models or create more!`;
        }
    }
  }

  // Generate 100% dynamic UI based on REAL model metadata and training data
  async generateDynamicPredictionUI(modelName) {
    try {
      // Get the REAL metadata for this specific model
      const pipelineState = await this.getCompletePipelineState();
      const modelMetadata = pipelineState.modelMetadataList.find(m => 
        m.model_name === modelName || m.modelFolder === modelName
      );

      if (!modelMetadata) {
        throw new Error(`No metadata found for model: ${modelName}`);
      }

      // Get the original training dataset to understand data structure
      const trainingDatasetPath = modelMetadata.dataset_path || modelMetadata.datasetPath;
      let datasetAnalysis = null;
      
      if (trainingDatasetPath) {
        try {
          const dataset = pipelineState.datasets.find(d => 
            trainingDatasetPath.includes(d.name) || trainingDatasetPath.includes(d.originalName)
          );
          datasetAnalysis = dataset?.analysis;
        } catch (e) {
          console.log('Could not get dataset analysis:', e.message);
        }
      }

      // Generate UI based on REAL data
      return this.createDynamicUIFromRealData(modelMetadata, datasetAnalysis);

    } catch (error) {
      console.error('Error generating dynamic UI:', error);
      throw error;
    }
  }

  createDynamicUIFromRealData(modelMetadata, datasetAnalysis) {
    const isClassification = modelMetadata.model_type === 'classification';
    const targetVariable = modelMetadata.target_variable;
    const featureColumns = modelMetadata.feature_columns || [];
    const accuracy = modelMetadata.accuracy || 0.85;

    // Create fields based on ACTUAL feature columns from training
    const fields = featureColumns.map(columnName => {
      // Look at actual sample data if available
      let sampleValues = [];
      if (datasetAnalysis?.sampleData) {
        const columnIndex = datasetAnalysis.columns.indexOf(columnName);
        if (columnIndex >= 0) {
          sampleValues = datasetAnalysis.sampleData.map(row => row[columnIndex]).filter(v => v);
        }
      }

      // Determine field type from actual data
      const fieldType = this.inferFieldTypeFromData(columnName, sampleValues);
      
      return {
        name: columnName,
        label: this.createHumanFriendlyLabel(columnName),
        type: fieldType.type,
        placeholder: fieldType.placeholder,
        options: fieldType.options,
        required: true,
        validation: fieldType.validation
      };
    });

    // Determine theme based on model purpose (from actual target variable)
    const theme = this.inferThemeFromModel(modelMetadata, targetVariable);
    const icon = this.inferIconFromModel(modelMetadata, targetVariable);

    return {
      success: true,
      uiConfig: {
        title: `${modelMetadata.model_name} Predictor`,
        description: `Predict ${targetVariable.replace(/_/g, ' ')} using AI trained on real data`,
        theme: theme,
        icon: icon,
        fields: fields.slice(0, 8), // Limit for UX
        submitText: `Predict ${this.createHumanFriendlyLabel(targetVariable)}`,
        resultTitle: `Your ${this.createHumanFriendlyLabel(targetVariable)} Prediction`,
        helpText: `This AI model was trained with ${(accuracy * 100).toFixed(1)}% accuracy. Fill in the ${fields.length} features below to get your prediction.`,
        modelInfo: {
          accuracy: accuracy,
          modelType: modelMetadata.model_type,
          trainingCompleted: modelMetadata.training_completed,
          totalFeatures: featureColumns.length
        }
      },
      generatedBy: 'dynamic-real-data'
    };
  }

  inferFieldTypeFromData(columnName, sampleValues) {
    const colLower = columnName.toLowerCase();
    
    // Check if all sample values are numeric
    const isNumeric = sampleValues.length > 0 && sampleValues.every(v => !isNaN(parseFloat(v)));
    
    // Check if values look like categories (few unique values, text)
    const uniqueValues = [...new Set(sampleValues)];
    const isCategory = uniqueValues.length <= 10 && uniqueValues.length > 1;

    if (isCategory && !isNumeric) {
      return {
        type: 'select',
        options: uniqueValues.slice(0, 10),
        placeholder: `Select ${columnName}`
      };
    } else if (isNumeric) {
      return {
        type: 'number',
        placeholder: `Enter ${columnName} (e.g., ${sampleValues[0] || '123'})`,
        validation: sampleValues.length > 0 ? `Example: ${sampleValues[0]}` : null
      };
    } else {
      return {
        type: 'text',
        placeholder: `Enter ${columnName}${sampleValues[0] ? ` (e.g., ${sampleValues[0]})` : ''}`,
        validation: null
      };
    }
  }

  createHumanFriendlyLabel(columnName) {
    return columnName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  inferThemeFromModel(metadata, targetVariable) {
    const modelName = metadata.model_name.toLowerCase();
    const target = targetVariable.toLowerCase();
    
    if (modelName.includes('price') || target.includes('price') || target.includes('cost')) return 'green';
    if (modelName.includes('risk') || target.includes('risk') || target.includes('fraud')) return 'orange';
    if (modelName.includes('health') || target.includes('health')) return 'blue';
    if (modelName.includes('customer') || target.includes('churn')) return 'purple';
    
    return 'blue'; // default
  }

  inferIconFromModel(metadata, targetVariable) {
    const modelName = metadata.model_name.toLowerCase();
    const target = targetVariable.toLowerCase();
    
    if (modelName.includes('price') || target.includes('price')) return 'DollarSign';
    if (modelName.includes('house') || modelName.includes('real')) return 'Home';
    if (modelName.includes('customer') || target.includes('churn')) return 'Users';
    if (modelName.includes('risk') || target.includes('fraud')) return 'AlertTriangle';
    if (modelName.includes('sales') || target.includes('revenue')) return 'TrendingUp';
    
    return 'Brain'; // default
  }
}

module.exports = new DynamicGeminiService();
