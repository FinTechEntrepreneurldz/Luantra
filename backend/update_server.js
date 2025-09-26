// Add this after the existing requires at the top of server.js
const VertexAIService = require('./vertexAIService');

// Add this after the other initializations
const vertexAI = new VertexAIService();

// Replace the existing training job creation in the chat agent with:
// REAL VERTEX AI TRAINING JOB CREATION
const realTrainingJob = await vertexAI.createRealTrainingJob(
  latestDataset, 
  targetCol, 
  modelType, 
  analysis.likelyFeatures
);

platformData.trainingJobs.push(realTrainingJob);

// Add endpoint to check real training job status
app.get('/api/training-jobs/:jobId/status', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = platformData.trainingJobs.find(j => j.name.includes(jobId));
    
    if (job && job.isReal) {
      const status = await vertexAI.checkTrainingJobStatus(job.name);
      res.json(status);
    } else {
      res.json({ error: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
