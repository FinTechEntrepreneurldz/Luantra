const LocalModelPersistence = require('./localModelPersistence');
const datasetAnalyzer = require('./datasetAnalyzer');
const vertexaiService = require('./vertexai');

class IntelligentGemini {
  constructor() {
    this.modelPersistence = new LocalModelPersistence();
    this.conversations = new Map(); // Track conversation state per session
  }

  // Main conversation handler
  async processMessage(message, sessionId = 'default') {
    try {
      const lowerMsg = message.toLowerCase();
      const conversation = this.getConversation(sessionId);
      
      // Analyze intent
      const intent = this.analyzeIntent(lowerMsg, conversation);
      
      switch (intent.type) {
        case 'CREATE_MODEL':
          return await this.handleModelCreation(intent, conversation, sessionId);
        
        case 'UPLOAD_REQUEST':
          return await this.handleUploadRequest(intent, conversation, sessionId);
          
        case 'DEPLOY_MODEL':
          return await this.handleModelDeployment(intent, conversation, sessionId);
          
        case 'LIST_MODELS':
          return await this.handleListModels();
          
        case 'USE_MODEL':
          return await this.handleUseModel(intent, conversation, sessionId);
          
        case 'GENERAL_HELP':
          return this.handleGeneralHelp(intent);
          
        default:
          return this.handleDefault(message);
      }
    } catch (error) {
      console.error('Error in Gemini processing:', error);
      return {
        response: 'I encountered an error processing your request. Could you please try again?',
        actions: []
      };
    }
  }

  // Analyze user intent from message
  analyzeIntent(message, conversation) {
    const intent = { type: 'GENERAL_HELP', confidence: 0.5, entities: {} };
    
    // Model creation patterns
    if (message.includes('create') && (message.includes('model') || message.includes('train'))) {
      intent.type = 'CREATE_MODEL';
      intent.confidence = 0.9;
      
      // Extract model type
      if (message.includes('housing') || message.includes('price') || message.includes('real estate')) {
        intent.entities.modelType = 'housing';
      } else if (message.includes('customer') || message.includes('churn') || message.includes('classification')) {
        intent.entities.modelType = 'classification';
      }
    }
    
    // Upload patterns
    else if (message.includes('upload') || message.includes('data') || message.includes('dataset')) {
      intent.type = 'UPLOAD_REQUEST';
      intent.confidence = 0.8;
    }
    
    // Deploy patterns
    else if (message.includes('deploy') || message.includes('use') || message.includes('predict')) {
      intent.type = 'DEPLOY_MODEL';
      intent.confidence = 0.8;
    }
    
    // List models
    else if (message.includes('show') && message.includes('model') || message.includes('list')) {
      intent.type = 'LIST_MODELS';
      intent.confidence = 0.9;
    }
    
    // Use specific model
    else if (message.includes('use model') || message.includes('open model')) {
      intent.type = 'USE_MODEL';
      intent.confidence = 0.8;
      // Try to extract model name/id
      const modelMatch = message.match(/model\s+(\w+)/);
      if (modelMatch) {
        intent.entities.modelId = modelMatch[1];
      }
    }
    
    return intent;
  }

  // Handle model creation workflow
  async handleModelCreation(intent, conversation, sessionId) {
    conversation.state = 'creating_model';
    conversation.modelType = intent.entities.modelType || 'custom';
    
    const response = {
      response: `Great! I'll help you create a ${conversation.modelType} model. Here's what we'll do:

1. **Upload your dataset** - I'll need training data
2. **Analyze the data** - I'll examine the structure and suggest configurations  
3. **Train the model** - I'll create and train it on Vertex AI
4. **Deploy & Generate UI** - I'll create a custom prediction interface

Let's start! Please upload your dataset using the upload component on the right, or tell me what type of data you have.`,
      actions: [
        { type: 'highlight_upload', message: 'Ready for data upload' },
        { type: 'switch_tab', tab: 'build' }
      ]
    };
    
    this.updateConversation(sessionId, conversation);
    return response;
  }

  // Handle upload completion and next steps
  async handleDatasetUploaded(datasetPath, filename, sessionId) {
    try {
      const conversation = this.getConversation(sessionId);
      
      // Analyze the uploaded dataset
      const analysisResult = await datasetAnalyzer.analyzeDataset(datasetPath);
      
      // Generate model configuration based on analysis
      const modelConfig = this.generateModelConfig(analysisResult, conversation.modelType);
      
      conversation.state = 'dataset_analyzed';
      conversation.datasetPath = datasetPath;
      conversation.analysisResult = analysisResult;
      conversation.modelConfig = modelConfig;
      
      const response = {
        response: `Perfect! I've analyzed "${filename}" and here's what I found:

📊 **Dataset Analysis:**
- ${analysisResult.rowCount} rows, ${analysisResult.columnCount} columns
- Suggested target: ${modelConfig.targetColumn}
- Model type: ${modelConfig.modelType}

🤖 **Recommended Configuration:**
- Algorithm: ${modelConfig.algorithm}
- Training approach: ${modelConfig.approach}

Ready to train the model? Say "yes, train the model" and I'll start the training process on Vertex AI!`,
        actions: [
          { type: 'show_analysis', data: analysisResult },
          { type: 'ready_for_training', config: modelConfig }
        ]
      };
      
      this.updateConversation(sessionId, conversation);
      return response;
      
    } catch (error) {
      console.error('Error handling dataset upload:', error);
      return {
        response: 'I had trouble analyzing your dataset. Could you check the file format and try again?',
        actions: []
      };
    }
  }

  // Handle model training initiation
  async handleTrainingStart(sessionId) {
    try {
      const conversation = this.getConversation(sessionId);
      
      if (!conversation.datasetPath || !conversation.modelConfig) {
        return {
          response: 'I need a dataset first. Please upload your training data.',
          actions: []
        };
      }
      
      const modelName = `${conversation.modelType}-model-${Date.now()}`;
      
      // Start training job
      const trainingJob = await vertexaiService.createAutoMLModel(
        conversation.datasetPath,
        modelName,
        conversation.modelConfig.modelType,
        conversation.modelConfig.targetColumn
      );
      
      // Save model to persistence
      await this.modelPersistence.saveModel({
        id: modelName,
        name: modelName,
        displayName: modelName,
        trainingJobId: trainingJob.name,
        datasetPath: conversation.datasetPath,
        modelType: conversation.modelType,
        status: 'training'
      });
      
      conversation.state = 'model_training';
      conversation.trainingJobId = trainingJob.name;
      conversation.modelName = modelName;
      
      const response = {
        response: `🚀 **Training Started!**

I've initiated training for your ${conversation.modelType} model on Vertex AI:

- Model Name: ${modelName}
- Training Job ID: ${trainingJob.name.split('/').pop()}
- Dataset: ${conversation.datasetPath.split('/').pop()}

The training will take a few minutes. Once complete, I'll automatically:
1. Deploy the model to an endpoint
2. Generate a custom prediction UI
3. Make it available in your DEPLOY tab

You can check the progress in Google Cloud Console or I'll notify you when it's ready!`,
        actions: [
          { type: 'training_started', jobId: trainingJob.name },
          { type: 'switch_tab', tab: 'deploy' }
        ]
      };
      
      this.updateConversation(sessionId, conversation);
      return response;
      
    } catch (error) {
      console.error('Error starting training:', error);
      return {
        response: 'I encountered an error starting the training. Please check your Google Cloud setup and try again.',
        actions: []
      };
    }
  }

  // Handle model deployment and UI generation
  async handleModelDeployment(intent, conversation, sessionId) {
    try {
      const models = await this.modelPersistence.getAllModels();
      
      if (models.length === 0) {
        return {
          response: 'You don\'t have any trained models yet. Would you like to create one? Just say "create a model" and I\'ll guide you through the process!',
          actions: []
        };
      }
      
      const deployedModels = models.filter(m => m.status === 'trained' || m.status === 'deployed');
      
      if (deployedModels.length === 0) {
        return {
          response: 'Your models are still training. I\'ll let you know when they\'re ready for deployment!',
          actions: []
        };
      }
      
      // If user didn't specify a model, show available options
      const modelList = deployedModels.map(m => `- ${m.name} (${m.modelType})`).join('\n');
      
      const response = {
        response: `You have ${deployedModels.length} model(s) ready for deployment:

${modelList}

Which model would you like to use? You can say "use [model-name]" or click "Use Model" in the DEPLOY tab.`,
        actions: [
          { type: 'switch_tab', tab: 'deploy' },
          { type: 'show_models', models: deployedModels }
        ]
      };
      
      return response;
      
    } catch (error) {
      console.error('Error handling deployment:', error);
      return {
        response: 'I had trouble accessing your models. Please try again.',
        actions: []
      };
    }
  }

  // Handle model usage
  async handleUseModel(intent, conversation, sessionId) {
    const modelId = intent.entities.modelId;
    
    if (!modelId) {
      return {
        response: 'Which model would you like to use? Please specify the model name.',
        actions: []
      };
    }
    
    try {
      const models = await this.modelPersistence.getAllModels();
      const model = models.find(m => m.id.includes(modelId) || m.name.toLowerCase().includes(modelId));
      
      if (!model) {
        return {
          response: `I couldn't find a model with the name "${modelId}". Here are your available models: ${models.map(m => m.name).join(', ')}`,
          actions: []
        };
      }
      
      const response = {
        response: `Perfect! I'm opening the prediction interface for "${model.name}". You'll be able to input data and get real-time predictions from your trained model!`,
        actions: [
          { type: 'navigate_to_model', modelId: model.id },
          { type: 'open_model_ui', modelId: model.id }
        ]
      };
      
      return response;
      
    } catch (error) {
      console.error('Error handling model usage:', error);
      return {
        response: 'I had trouble opening that model. Please try again.',
        actions: []
      };
    }
  }

  // Handle listing models
  async handleListModels() {
    try {
      const models = await this.modelPersistence.getAllModels();
      
      if (models.length === 0) {
        return {
          response: 'You don\'t have any models yet. Would you like to create one? Just say "create a model" and I\'ll guide you through the entire process!',
          actions: [{ type: 'switch_tab', tab: 'build' }]
        };
      }
      
      const modelList = models.map(model => 
        `- **${model.name}** (${model.modelType}) - Status: ${model.status}`
      ).join('\n');
      
      const response = {
        response: `Here are your models:

${modelList}

You can use any trained model by saying "use [model-name]" or clicking "Use Model" in the DEPLOY tab.`,
        actions: [
          { type: 'switch_tab', tab: 'deploy' },
          { type: 'highlight_models', models }
        ]
      };
      
      return response;
      
    } catch (error) {
      console.error('Error listing models:', error);
      return {
        response: 'I had trouble retrieving your models. Please try again.',
        actions: []
      };
    }
  }

  // Generate model configuration from analysis
  generateModelConfig(analysisResult, modelType) {
    const config = {
      modelType: modelType || 'classification',
      algorithm: 'AutoML',
      approach: 'Automated feature engineering'
    };
    
    // Suggest target column based on analysis
    if (analysisResult.columns) {
      const columns = analysisResult.columns.map(c => c.toLowerCase());
      
      if (modelType === 'housing') {
        config.targetColumn = columns.find(c => 
          c.includes('price') || c.includes('value') || c.includes('cost')
        ) || columns[columns.length - 1];
      } else {
        config.targetColumn = columns[columns.length - 1]; // Default to last column
      }
    }
    
    return config;
  }

  // Conversation state management
  getConversation(sessionId) {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        state: 'idle',
        modelType: null,
        datasetPath: null,
        analysisResult: null,
        modelConfig: null,
        history: []
      });
    }
    return this.conversations.get(sessionId);
  }

  updateConversation(sessionId, conversation) {
    this.conversations.set(sessionId, conversation);
  }

  // Default handlers
  handleGeneralHelp(intent) {
    return {
      response: `I'm here to help you with the complete TALK.BUILD.DEPLOY AI pipeline! Here's what I can do:

🗣️ **TALK**: Chat with me to build AI models
🛠️ **BUILD**: Upload data and train models on Vertex AI  
🚀 **DEPLOY**: Create custom prediction interfaces

**Try saying:**
- "Create a housing price model"
- "Upload my dataset"
- "Show me my models"
- "Use model [name]"

What would you like to build today?`,
      actions: []
    };
  }

  handleDefault(message) {
    return {
      response: `I understand you said "${message}". I can help you create, train, and deploy AI models through conversation. Try asking me to "create a model" or "show my models" to get started!`,
      actions: []
    };
  }
}

module.exports = IntelligentGemini;
