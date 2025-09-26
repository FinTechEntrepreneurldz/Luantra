const express = require('express');
const router = express.Router();

// Create custom agent endpoint
router.post('/create', async (req, res) => {
  try {
    console.log('🤖 Creating custom agent:', req.body);
    
    const { agentConfig, userId } = req.body;

    if (!agentConfig.name || !agentConfig.systemPrompt) {
      return res.status(400).json({ 
        error: 'Agent name and system prompt are required' 
      });
    }

    // Create Vertex AI Agent with custom configuration
    const agentResponse = await fetch(`https://us-central1-aiplatform.googleapis.com/v1beta1/projects/luantra-platform/locations/us-central1/agents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        displayName: agentConfig.name,
        description: agentConfig.description,
        systemInstruction: agentConfig.systemPrompt,
        llmModel: agentConfig.baseModel,
        temperature: agentConfig.temperature,
        maxOutputTokens: agentConfig.maxTokens,
        topP: agentConfig.topP,
        safetySettings: {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: agentConfig.safetyLevel === 'high' ? 'BLOCK_MEDIUM_AND_ABOVE' : 'BLOCK_ONLY_HIGH'
        },
        tools: agentConfig.tools.map(tool => ({ name: tool })),
        examples: agentConfig.examples
      })
    });

    if (!agentResponse.ok) {
      throw new Error(`Failed to create Vertex AI agent: ${agentResponse.statusText}`);
    }

    const agent = await agentResponse.json();

    // Store agent configuration
    const agentData = {
      ...agentConfig,
      agentId: agent.name,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    res.json({
      success: true,
      message: 'Custom agent created successfully',
      agent: agentData,
      vertexAgent: agent
    });

  } catch (error) {
    console.error('❌ Agent creation error:', error);
    res.status(500).json({ 
      error: 'Agent creation failed', 
      details: error.message 
    });
  }
});

// List user's agents
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // In production, fetch from database
    // For now, return empty array
    res.json({ 
      success: true, 
      agents: [] 
    });
  } catch (error) {
    console.error('❌ Error listing agents:', error);
    res.status(500).json({ error: 'Failed to list agents' });
  }
});

async function getAccessToken() {
  const { exec } = require('child_process');
  return new Promise((resolve, reject) => {
    exec('gcloud auth print-access-token', (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout.trim());
    });
  });
}

module.exports = router;
