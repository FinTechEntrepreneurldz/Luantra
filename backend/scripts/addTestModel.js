const LocalModelPersistence = require('../services/localModelPersistence');

async function addTestModel() {
  const modelPersistence = new LocalModelPersistence();
  
  const testModel = {
    id: 'test-housing-model',
    name: 'Housing Price Predictor',
    displayName: 'Housing Price Predictor',
    trainingJobId: 'test-job-123',
    datasetPath: 'gs://luantra-platform-datasets/housing-data.csv',
    modelType: 'housing',
    accuracy: 0.87,
    status: 'trained'
  };
  
  console.log('Adding test model to local persistence...');
  await modelPersistence.saveModel(testModel);
  console.log('✅ Test model added successfully!');
  
  const allModels = await modelPersistence.getAllModels();
  console.log('All persisted models:', allModels.length);
}

addTestModel().catch(console.error);
