const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiUIGenerator {
  constructor() {
    // You'll need to set your Gemini API key in .env
    // For now, we'll use a mock implementation that can be easily switched to real Gemini
    this.useRealGemini = process.env.GEMINI_API_KEY ? true : false;
    
    if (this.useRealGemini) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }
  }

  async generatePredictionUI(modelMetadata) {
    try {
      const prompt = `
You are Luantra's AI assistant. Create a personalized prediction interface for this machine learning model.

Model Information:
- Name: ${modelMetadata.modelName}
- Type: ${modelMetadata.modelType}
- Target Variable: ${modelMetadata.targetVariable}
- Feature Columns: ${JSON.stringify(modelMetadata.featureColumns)}
- Description: ${modelMetadata.description || 'AI model trained on Luantra platform'}

Generate a JSON response with this structure:
{
  "uiConfig": {
    "title": "Friendly title for the prediction interface",
    "description": "User-friendly description of what this model predicts",
    "theme": "color theme (blue/green/purple/orange)",
    "icon": "lucide icon name (without 'Icon' suffix)",
    "fields": [
      {
        "name": "field_name",
        "label": "User-friendly label",
        "type": "number|text|select|boolean",
        "placeholder": "helpful placeholder text",
        "required": true,
        "validation": "any validation rules",
        "options": ["array", "of", "options"] // only for select type
      }
    ],
    "submitText": "Predict [Something]",
    "resultTitle": "Your [Prediction Type]",
    "helpText": "Brief explanation of how to use this predictor"
  }
}

Make it intuitive, user-friendly, and relevant to the specific model. Use business-friendly language, not technical jargon.
`;

      let uiConfig;
      
      if (this.useRealGemini) {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        uiConfig = JSON.parse(text);
      } else {
        // Smart fallback based on model metadata
        uiConfig = this.generateSmartFallbackUI(modelMetadata);
      }

      return {
        success: true,
        uiConfig: uiConfig.uiConfig,
        generatedBy: this.useRealGemini ? 'gemini' : 'smart-fallback'
      };

    } catch (error) {
      console.error('Error generating UI:', error);
      return {
        success: false,
        error: error.message,
        uiConfig: this.generateBasicFallbackUI(modelMetadata)
      };
    }
  }

  generateSmartFallbackUI(metadata) {
    const isClassification = metadata.modelType === 'classification';
    const modelName = metadata.modelName || 'AI Model';
    const targetVar = metadata.targetVariable || 'prediction';
    
    // Intelligent field generation based on feature names
    const fields = (metadata.featureColumns || []).map(col => {
      const colLower = col.toLowerCase();
      
      if (colLower.includes('price') || colLower.includes('cost') || colLower.includes('amount')) {
        return {
          name: col,
          label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: 'number',
          placeholder: 'Enter amount in dollars',
          required: true
        };
      } else if (colLower.includes('age') || colLower.includes('year') || colLower.includes('count')) {
        return {
          name: col,
          label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: 'number',
          placeholder: 'Enter number',
          required: true
        };
      } else if (colLower.includes('category') || colLower.includes('type') || colLower.includes('status')) {
        return {
          name: col,
          label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: 'select',
          options: ['Option A', 'Option B', 'Option C'],
          required: true
        };
      } else {
        return {
          name: col,
          label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: 'text',
          placeholder: `Enter ${col.replace(/_/g, ' ')}`,
          required: true
        };
      }
    });

    return {
      uiConfig: {
        title: `${modelName} Predictor`,
        description: `Get instant ${isClassification ? 'classification' : 'predictions'} using our trained AI model`,
        theme: 'blue',
        icon: isClassification ? 'Target' : 'TrendingUp',
        fields: fields.slice(0, 6), // Limit to 6 fields for better UX
        submitText: `Get ${isClassification ? 'Classification' : 'Prediction'}`,
        resultTitle: `Your ${targetVar.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        helpText: `Fill in the information below to get an AI-powered ${isClassification ? 'classification' : 'prediction'}.`
      }
    };
  }

  generateBasicFallbackUI(metadata) {
    return {
      uiConfig: {
        title: 'AI Prediction',
        description: 'Get predictions from your trained model',
        theme: 'purple',
        icon: 'Brain',
        fields: [
          {
            name: 'input_value',
            label: 'Input Value',
            type: 'number',
            placeholder: 'Enter a value',
            required: true
          }
        ],
        submitText: 'Get Prediction',
        resultTitle: 'Your Result',
        helpText: 'Enter your data to get an AI prediction.'
      }
    };
  }
}

module.exports = new GeminiUIGenerator();
