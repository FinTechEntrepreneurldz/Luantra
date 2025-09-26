const express = require('express');
const router = express.Router();

// Generate completely custom UI based on model specifics
router.post('/create', async (req, res) => {
  try {
    const { modelName, targetVariable, modelType, datasetFeatures, endpointName } = req.body;
    
    console.log(`🎨 Generating dynamic UI for: ${modelName}`);
    
    // Analyze the model to determine UI components needed
    const uiConfig = analyzeModelForUI(modelName, targetVariable, modelType, datasetFeatures);
    
    // Generate unique UI ID
    const uiId = `ui_${modelName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    
    // Store the UI configuration (in production, this would be in a database)
    global.generatedUIs = global.generatedUIs || {};
    global.generatedUIs[uiId] = uiConfig;
    
    res.json({
      success: true,
      message: 'Dynamic UI generated successfully',
      ui: {
        id: uiId,
        url: `http://localhost:3001/ui/${uiId}`,
        config: uiConfig,
        modelName: modelName,
        targetVariable: targetVariable
      }
    });
    
  } catch (error) {
    console.error('❌ UI generation error:', error);
    res.status(500).json({ 
      error: 'UI generation failed', 
      details: error.message 
    });
  }
});

// Analyze model to determine UI structure
function analyzeModelForUI(modelName, targetVariable, modelType, features) {
  let inputFields = [];
  let outputFormat = {};
  let theme = {};
  let interfaceType = "form";
  
  switch(modelType.toLowerCase()) {
    case "llm":
    case "language_model":
      inputFields = [
        { name: "prompt", label: "Enter your prompt", type: "textarea", placeholder: "Ask me anything...", required: true },
        { name: "max_tokens", label: "Max Response Length", type: "number", placeholder: "150", required: false },
        { name: "temperature", label: "Creativity (0-1)", type: "number", placeholder: "0.7", step: "0.1", required: false }
      ];
      outputFormat = { prefix: "", suffix: "", format: "text" };
      theme = { primary: "purple", secondary: "pink", icon: "message" };
      interfaceType = "chat";
      break;
      
    case "reinforcement_learning":
    case "rl":
      inputFields = [
        { name: "state", label: "Environment State", type: "textarea", placeholder: "Current game state or environment data", required: true },
        { name: "action_space", label: "Available Actions", type: "text", placeholder: "up,down,left,right", required: false },
        { name: "episodes", label: "Training Episodes", type: "number", placeholder: "1000", required: false }
      ];
      outputFormat = { prefix: "Action: ", suffix: "", format: "action" };
      theme = { primary: "green", secondary: "blue", icon: "gamepad" };
      interfaceType = "interactive";
      break;
      
    case "computer_vision":
    case "cv":
      inputFields = [
        { name: "image", label: "Upload Image", type: "file", accept: "image/*", required: true },
        { name: "confidence_threshold", label: "Confidence Threshold", type: "number", placeholder: "0.8", step: "0.1", required: false }
      ];
      outputFormat = { prefix: "", suffix: "", format: "vision" };
      theme = { primary: "cyan", secondary: "blue", icon: "camera" };
      interfaceType = "upload";
      break;
      
    case "time_series":
      inputFields = [
        { name: "historical_data", label: "Historical Data Points", type: "textarea", placeholder: "100,120,110,130,125...", required: true },
        { name: "forecast_horizon", label: "Forecast Period", type: "number", placeholder: "30", required: true },
        { name: "seasonality", label: "Seasonal Pattern", type: "select", options: ["None", "Daily", "Weekly", "Monthly", "Yearly"], required: false }
      ];
      outputFormat = { prefix: "", suffix: "", format: "forecast" };
      theme = { primary: "orange", secondary: "red", icon: "trending-up" };
      interfaceType = "chart";
      break;
      
    case "classification":
      inputFields = [
        { name: "feature_1", label: "Primary Feature", type: "number", placeholder: "1.5", required: true },
        { name: "feature_2", label: "Secondary Feature", type: "number", placeholder: "2.3", required: true },
        { name: "feature_3", label: "Additional Data", type: "text", placeholder: "Category A", required: false }
      ];
      outputFormat = { prefix: "Class: ", suffix: "", format: "category" };
      theme = { primary: "indigo", secondary: "purple", icon: "tag" };
      interfaceType = "form";
      break;
      
    default: // regression
      inputFields = [
        { name: "median_income", label: "Median Income ($)", type: "number", placeholder: "50000", required: true },
        { name: "housing_median_age", label: "Housing Age (years)", type: "number", placeholder: "10", required: true },
        { name: "total_rooms", label: "Total Rooms", type: "number", placeholder: "5000", required: true },
        { name: "population", label: "Population", type: "number", placeholder: "3000", required: true },
        { name: "latitude", label: "Latitude", type: "number", placeholder: "34.0", step: "0.01", required: true },
        { name: "longitude", label: "Longitude", type: "number", placeholder: "-118.0", step: "0.01", required: true }
      ];
      outputFormat = { prefix: "$", suffix: "", format: "currency" };
      theme = { primary: "blue", secondary: "green", icon: "home" };
      interfaceType = "form";
  }
  
  return {
    modelName,
    targetVariable,
    modelType,
    inputFields,
    outputFormat,
    theme,
    interfaceType,
    description: generateDescription(modelName, targetVariable, modelType),
    features: generateFeatureImportance(targetVariable, modelType),
    endpointName: `${modelName}-endpoint`
  };
}
function generateDescription(modelName, targetVariable, modelType) {
  if (targetVariable.includes('house')) {
    return `Predict house values based on location, demographics, and property characteristics using advanced ${modelType} algorithms.`;
  } else if (targetVariable.includes('salary')) {
    return `Estimate salary ranges based on experience, education, location, and company factors using machine learning.`;
  } else {
    return `AI-powered ${targetVariable} prediction using state-of-the-art ${modelType} models.`;
  }
}

function generateFeatureImportance(targetVariable) {
  if (targetVariable.includes('house')) {
    return [
      { name: 'Median Income', importance: 0.35, description: 'Local area median income is the strongest predictor' },
      { name: 'Location', importance: 0.25, description: 'Geographic coordinates determine neighborhood desirability' },
      { name: 'Housing Age', importance: 0.15, description: 'Newer homes typically command higher prices' },
      { name: 'Population Density', importance: 0.25, description: 'Population and household density affects pricing' }
    ];
  } else {
    return [
      { name: 'Primary Factor', importance: 0.4, description: 'Most influential feature for predictions' },
      { name: 'Secondary Factor', importance: 0.35, description: 'Strong contributing factor' },
      { name: 'Supporting Factor', importance: 0.25, description: 'Additional context for accuracy' }
    ];
  }
}

module.exports = router;
