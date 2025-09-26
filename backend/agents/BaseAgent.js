// backend/agents/BaseAgent.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

class BaseAgent {
  constructor(agentType, genAI) {
    this.agentType = agentType;
    this.genAI = genAI;
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.conversationHistory = [];
    this.expertise = this.defineExpertise();
  }

  // Each agent defines its own expertise
  defineExpertise() {
    throw new Error('Each agent must define its expertise');
  }

  // Core method for agent reasoning using Gemini
  async think(prompt, context = {}) {
    try {
      const systemPrompt = `You are a ${this.agentType} specialist with expertise in: ${this.expertise.join(', ')}.

CONTEXT: ${JSON.stringify(context, null, 2)}

${this.getAgentInstructions()}

USER REQUEST: ${prompt}

Respond as a professional ${this.agentType} would. Be specific, technical, and actionable.`;

      console.log(`🤖 ${this.agentType} thinking about:`, prompt.substring(0, 100) + '...');

      const result = await this.model.generateContent(systemPrompt);
      const response = result.response.text();
      
      // Log the interaction
      this.conversationHistory.push({
        prompt: prompt.substring(0, 200),
        response: response.substring(0, 500),
        timestamp: new Date().toISOString(),
        context: Object.keys(context)
      });

      return this.parseResponse(response);
    } catch (error) {
      console.error(`Error in ${this.agentType} thinking:`, error);
      return this.getErrorResponse(error);
    }
  }

  // Agent-specific instructions (override in subclasses)
  getAgentInstructions() {
    return `Focus on your area of expertise. Provide clear, implementable solutions.`;
  }

  // Parse and validate agent response (override in subclasses)
  parseResponse(response) {
    return {
      success: true,
      analysis: response,
      recommendations: [],
      nextSteps: [],
      confidence: 0.8
    };
  }

  // Handle errors gracefully
  getErrorResponse(error) {
    return {
      success: false,
      error: error.message,
      fallbackAction: `Consult with ${this.agentType} manually`,
      confidence: 0.0
    };
  }

  // Collaborate with other agents
  async collaborate(otherAgent, sharedContext, question) {
    console.log(`🤝 Collaboration: ${this.agentType} <-> ${otherAgent.agentType}`);
    
    const myPerspective = await this.think(question, sharedContext);
    const theirPerspective = await otherAgent.think(question, sharedContext);
    
    // Synthesize perspectives
    const collaborationPrompt = `As a ${this.agentType}, analyze these two perspectives and create a unified recommendation:

MY PERSPECTIVE (${this.agentType}):
${JSON.stringify(myPerspective, null, 2)}

THEIR PERSPECTIVE (${otherAgent.agentType}):
${JSON.stringify(theirPerspective, null, 2)}

Create a unified solution that incorporates both viewpoints.`;

    const synthesis = await this.think(collaborationPrompt, sharedContext);
    
    return {
      ...synthesis,
      collaboration: {
        agents: [this.agentType, otherAgent.agentType],
        perspectives: { mine: myPerspective, theirs: theirPerspective }
      }
    };
  }

  // Get agent status and capabilities
  getStatus() {
    return {
      agentType: this.agentType,
      expertise: this.expertise,
      conversationHistory: this.conversationHistory.length,
      lastActivity: this.conversationHistory[this.conversationHistory.length - 1]?.timestamp,
      capabilities: this.getCapabilities()
    };
  }

  // Define what this agent can do (override in subclasses)
  getCapabilities() {
    return ['analyze', 'recommend', 'collaborate'];
  }

  // Validate input before processing
  validateInput(input, requirements = []) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!input || typeof input !== 'object') {
      validation.isValid = false;
      validation.errors.push('Input must be a valid object');
      return validation;
    }

    // Check required fields
    requirements.forEach(req => {
      if (!input[req]) {
        validation.isValid = false;
        validation.errors.push(`Missing required field: ${req}`);
      }
    });

    return validation;
  }

  // Save agent state (for persistence)
  saveState() {
    return {
      agentType: this.agentType,
      conversationHistory: this.conversationHistory,
      timestamp: new Date().toISOString()
    };
  }

  // Load agent state (for persistence)
  loadState(state) {
    if (state && state.conversationHistory) {
      this.conversationHistory = state.conversationHistory;
      console.log(`📚 ${this.agentType} loaded ${state.conversationHistory.length} previous interactions`);
    }
  }
}

module.exports = BaseAgent;