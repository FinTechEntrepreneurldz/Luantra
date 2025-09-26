const { Storage } = require('@google-cloud/storage');
const fs = require('fs').promises;
const path = require('path');

class ModelPersistence {
  constructor() {
    this.storage = new Storage();
    this.bucket = this.storage.bucket('luantra-platform-models');
    this.modelsFile = 'models-registry.json';
  }

  // Save model metadata when training completes
  async saveModel(modelData) {
    try {
      console.log('💾 Saving model to persistent storage:', modelData.name);
      
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

      // Get existing registry
      const registry = await this.getModelsRegistry();
      
      // Add or update model
      const existingIndex = registry.models.findIndex(m => m.id === modelRecord.id);
      if (existingIndex >= 0) {
        registry.models[existingIndex] = { ...registry.models[existingIndex], ...modelRecord };
      } else {
        registry.models.push(modelRecord);
      }

      // Save back to storage
      await this.saveModelsRegistry(registry);
      
      console.log('✅ Model saved successfully');
      return modelRecord;
    } catch (error) {
      console.error('Error saving model:', error);
      throw error;
    }
  }

  // Update model with endpoint information
  async updateModelEndpoint(modelId, endpointData) {
    try {
      const registry = await this.getModelsRegistry();
      const model = registry.models.find(m => m.id === modelId);
      
      if (model) {
        model.deployedEndpoints.push({
          endpointId: endpointData.id,
          endpointName: endpointData.name,
          fullVertexName: endpointData.fullName,
          deployedAt: new Date().toISOString()
        });
        model.status = 'deployed';
        model.updatedAt = new Date().toISOString();
        
        await this.saveModelsRegistry(registry);
        console.log(`✅ Updated model ${modelId} with endpoint ${endpointData.name}`);
      }
      
      return model;
    } catch (error) {
      console.error('Error updating model endpoint:', error);
      throw error;
    }
  }

  // Get all saved models
  async getAllModels() {
    try {
      const registry = await this.getModelsRegistry();
      return registry.models;
    } catch (error) {
      console.error('Error getting models:', error);
      return [];
    }
  }

  // Get models registry from storage
  async getModelsRegistry() {
    try {
      const file = this.bucket.file(this.modelsFile);
      const [exists] = await file.exists();
      
      if (exists) {
        const [contents] = await file.download();
        return JSON.parse(contents.toString());
      } else {
        // Create new registry
        return {
          version: '1.0',
          createdAt: new Date().toISOString(),
          models: []
        };
      }
    } catch (error) {
      console.error('Error reading models registry:', error);
      return { version: '1.0', createdAt: new Date().toISOString(), models: [] };
    }
  }

  // Save models registry to storage
  async saveModelsRegistry(registry) {
    try {
      registry.updatedAt = new Date().toISOString();
      const file = this.bucket.file(this.modelsFile);
      await file.save(JSON.stringify(registry, null, 2), {
        metadata: {
          contentType: 'application/json'
        }
      });
    } catch (error) {
      console.error('Error saving models registry:', error);
      throw error;
    }
  }
}

module.exports = ModelPersistence;
