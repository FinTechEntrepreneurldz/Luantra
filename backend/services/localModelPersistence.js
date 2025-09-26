const fs = require('fs').promises;
const path = require('path');

class LocalModelPersistence {
  constructor() {
    this.modelsFile = path.join(__dirname, '../data/models-registry.json');
    this.dataDir = path.join(__dirname, '../data');
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  // Save model metadata locally
  async saveModel(modelData) {
    try {
      await this.ensureDataDir();
      console.log('💾 Saving model locally:', modelData.name);
      
      const modelRecord = {
        id: modelData.id || modelData.name.split('/').pop(),
        name: modelData.displayName || modelData.name,
        fullVertexName: modelData.name,
        trainingJobId: modelData.trainingJobId,
        datasetPath: modelData.datasetPath,
        modelType: modelData.modelType || 'custom',
        accuracy: modelData.accuracy || null,
        status: 'trained',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deployedEndpoints: [],
        uiConfig: modelData.uiConfig || null
      };

      const registry = await this.getModelsRegistry();
      
      const existingIndex = registry.models.findIndex(m => m.id === modelRecord.id);
      if (existingIndex >= 0) {
        registry.models[existingIndex] = { ...registry.models[existingIndex], ...modelRecord };
      } else {
        registry.models.push(modelRecord);
      }

      await this.saveModelsRegistry(registry);
      
      console.log('✅ Model saved locally');
      return modelRecord;
    } catch (error) {
      console.error('Error saving model locally:', error);
      throw error;
    }
  }

  async getAllModels() {
    try {
      const registry = await this.getModelsRegistry();
      return registry.models;
    } catch (error) {
      console.error('Error getting models:', error);
      return [];
    }
  }

  async getModelsRegistry() {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.modelsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          version: '1.0',
          createdAt: new Date().toISOString(),
          models: []
        };
      }
      throw error;
    }
  }

  async saveModelsRegistry(registry) {
    try {
      await this.ensureDataDir();
      registry.updatedAt = new Date().toISOString();
      await fs.writeFile(this.modelsFile, JSON.stringify(registry, null, 2));
    } catch (error) {
      console.error('Error saving models registry locally:', error);
      throw error;
    }
  }
}

module.exports = LocalModelPersistence;
