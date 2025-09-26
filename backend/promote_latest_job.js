const { ModelServiceClient, JobServiceClient } = require('@google-cloud/aiplatform').v1;

const PROJECT_ID = 'luantra-platform';
const LOCATION = 'us-central1';

async function promoteLatestJob() {
  try {
    const jobServiceClient = new JobServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });
    
    const modelServiceClient = new ModelServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });
    
    const parent = `projects/${PROJECT_ID}/locations/${LOCATION}`;
    
    // Get the latest completed training job
    console.log('🔍 Finding latest completed training job...');
    const [jobs] = await jobServiceClient.listCustomJobs({ parent });
    
    const completedJobs = jobs.filter(job => job.state === 'JOB_STATE_SUCCEEDED');
    
    if (completedJobs.length === 0) {
      console.log('❌ No completed training jobs found');
      return;
    }
    
    const latestJob = completedJobs[0]; // Most recent
    console.log('✅ Found completed job:', latestJob.displayName);
    
    // Create model from this job
    const model = {
      displayName: `${latestJob.displayName}-model`,
      description: `Luantra regression model for predicting median_house_value from job ${latestJob.displayName}`,
      metadataSchemaUri: "gs://google-cloud-aiplatform/schema/model/metadata/1.0.0",
      metadata: {
        framework: "custom",
        modelType: "regression",
        target: "median_house_value",
        sourceTrainingJob: latestJob.name,
        trainingCompleted: new Date().toISOString()
      },
      labels: {
        created_by: "luantra",
        type: "regression",
        target: "median_house_value",
        status: "ready"
      }
    };
    
    console.log('🚀 Creating model in Vertex AI Model Registry...');
    
    const [operation] = await modelServiceClient.uploadModel({
      parent: parent,
      model: model
    });
    
    console.log('✅ Model created successfully!');
    console.log('Model name:', operation.name);
    console.log('🎯 Check Google Cloud Console: https://console.cloud.google.com/vertex-ai/models?project=luantra-platform');
    
  } catch (error) {
    console.error('❌ Error creating model:', error);
  }
}

promoteLatestJob();
