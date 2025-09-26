'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Settings, Upload, Brain, Code, Database, Zap, Save, Play, Eye, ArrowLeft, Plus, Trash2, Edit, FileText, MessageCircle, Sparkles, Target, Cog, Globe, Lock, Users, Palette } from 'lucide-react';

// BEAUTIFUL AURORA LOGO
const LuantraLogo = ({ className }: { className?: string }) => (
  <svg width="120" height="120" viewBox="0 0 200 200" className={className}>
    <defs>
      <radialGradient id="auroraCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
      </radialGradient>
      
      <linearGradient id="lGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="25%" stopColor="#ef4444" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="75%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>

    <circle cx="100" cy="100" r="90" fill="url(#auroraCore)" opacity="0.3">
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 100 100"
        to="360 100 100"
        dur="15s"
        repeatCount="indefinite"
      />
    </circle>

    <g>
      <path
        d="M60 40 L60 140 L140 140 L140 120 L80 120 L80 40 Z"
        fill="url(#lGradient)"
        stroke="#ffffff"
        strokeWidth="2"
        opacity="0.9"
      />
      
      <circle cx="85" cy="70" r="6" fill="#10b981" opacity="1">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="110" cy="85" r="6" fill="#3b82f6" opacity="1">
        <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="125" cy="110" r="6" fill="#8b5cf6" opacity="1">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
      </circle>
    </g>
  </svg>
);

interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  baseModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  personality: string;
  useCase: string;
  knowledgeBase: string[];
  tools: string[];
  responseStyle: string;
  safetyLevel: string;
  accessLevel: string;
  customInstructions: string;
  examples: Array<{ input: string; output: string }>;
}

const AgentBuilderPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: '',
    description: '',
    systemPrompt: '',
    baseModel: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
    personality: 'professional',
    useCase: 'general',
    knowledgeBase: [],
    tools: [],
    responseStyle: 'concise',
    safetyLevel: 'high',
    accessLevel: 'private',
    customInstructions: '',
    examples: []
  });

  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [savedAgents, setSavedAgents] = useState<AgentConfig[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('luantra_user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    setUser(JSON.parse(userData));
    
    // Load saved agents from localStorage
    const saved = localStorage.getItem('luantra_agents');
    if (saved) {
      setSavedAgents(JSON.parse(saved));
    }
  }, [router]);

  const steps = [
    { id: 1, title: 'Basic Info', icon: <Bot className="w-5 h-5" /> },
    { id: 2, title: 'Personality', icon: <Sparkles className="w-5 h-5" /> },
    { id: 3, title: 'System Prompt', icon: <Code className="w-5 h-5" /> },
    { id: 4, title: 'Knowledge Base', icon: <Database className="w-5 h-5" /> },
    { id: 5, title: 'Configuration', icon: <Settings className="w-5 h-5" /> },
    { id: 6, title: 'Test & Deploy', icon: <Play className="w-5 h-5" /> }
  ];

  const updateAgentConfig = (field: keyof AgentConfig, value: any) => {
    setAgentConfig(prev => ({ ...prev, [field]: value }));
  };

  const addExample = () => {
    setAgentConfig(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '' }]
    }));
  };

  const updateExample = (index: number, field: 'input' | 'output', value: string) => {
    setAgentConfig(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const removeExample = (index: number) => {
    setAgentConfig(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileNames = Array.from(files).map(file => file.name);
    setAgentConfig(prev => ({
      ...prev,
      knowledgeBase: [...prev.knowledgeBase, ...fileNames]
    }));
  };

  const removeKnowledgeFile = (index: number) => {
    setAgentConfig(prev => ({
      ...prev,
      knowledgeBase: prev.knowledgeBase.filter((_, i) => i !== index)
    }));
  };

  const testAgent = async () => {
    if (!testMessage.trim()) return;
    
    setIsTesting(true);
    
    // Simulate AI response based on agent configuration
    setTimeout(() => {
      const responses = [
        `As ${agentConfig.name}, I understand your request. Based on my configuration, here's my response: ${testMessage}`,
        `Given my ${agentConfig.personality} personality and ${agentConfig.responseStyle} response style, I would say: This is a thoughtful question that requires careful consideration.`,
        `My system prompt guides me to be ${agentConfig.personality} while maintaining a ${agentConfig.responseStyle} approach. Here's my analysis of your message.`
      ];
      
      setTestResponse(responses[Math.floor(Math.random() * responses.length)]);
      setIsTesting(false);
    }, 2000);
  };

  const saveAgent = async () => {
    setIsBuilding(true);
    
    try {
      // Save to backend
      const response = await fetch('http://localhost:3001/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentConfig,
          userId: user.email
        })
      });

      if (response.ok) {
        // Save locally as well
        const newSavedAgents = [...savedAgents, agentConfig];
        setSavedAgents(newSavedAgents);
        localStorage.setItem('luantra_agents', JSON.stringify(newSavedAgents));
        
        alert('Agent created successfully!');
        router.push('/dashboard');
      } else {
        throw new Error('Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setIsBuilding(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Aurora background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-purple-500/20 text-purple-400 p-2 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <LuantraLogo className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Custom Agent Builder
              </h1>
              <p className="text-purple-300 text-sm">Create your personalized AI agent</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-purple-300">{user.email}</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeStep === step.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : activeStep > step.id
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-black/20 text-purple-300'
                  }`}
                >
                  {step.icon}
                  <span className="hidden md:block">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    activeStep > step.id ? 'bg-green-400' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8">
          {activeStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={agentConfig.name}
                    onChange={(e) => updateAgentConfig('name', e.target.value)}
                    placeholder="e.g., Legal Assistant, Customer Support Bot, Research Helper"
                    className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Use Case</label>
                  <select
                    value={agentConfig.useCase}
                    onChange={(e) => updateAgentConfig('useCase', e.target.value)}
                    className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="general">General Assistant</option>
                    <option value="customer-support">Customer Support</option>
                    <option value="legal">Legal Assistant</option>
                    <option value="medical">Medical Advisor</option>
                    <option value="education">Educational Tutor</option>
                    <option value="sales">Sales Assistant</option>
                    <option value="research">Research Helper</option>
                    <option value="creative">Creative Writing</option>
                    <option value="technical">Technical Support</option>
                    <option value="personal">Personal Assistant</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={agentConfig.description}
                  onChange={(e) => updateAgentConfig('description', e.target.value)}
                  placeholder="Describe what your agent does and how it helps users..."
                  rows={4}
                  className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                />
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Personality & Style</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Personality</label>
                  <select
                    value={agentConfig.personality}
                    onChange={(e) => updateAgentConfig('personality', e.target.value)}
                    className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="calm">Calm & Measured</option>
                    <option value="witty">Witty</option>
                    <option value="empathetic">Empathetic</option>
                    <option value="direct">Direct</option>
                    <option value="supportive">Supportive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Response Style</label>
                  <select
                    value={agentConfig.responseStyle}
                    onChange={(e) => updateAgentConfig('responseStyle', e.target.value)}
                    className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="concise">Concise</option>
                    <option value="detailed">Detailed</option>
                    <option value="step-by-step">Step-by-step</option>
                    <option value="conversational">Conversational</option>
                    <option value="bullet-points">Bullet Points</option>
                    <option value="narrative">Narrative</option>
                    <option value="analytical">Analytical</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Custom Instructions</label>
                <textarea
                  value={agentConfig.customInstructions}
                  onChange={(e) => updateAgentConfig('customInstructions', e.target.value)}
                  placeholder="Add specific instructions about how your agent should behave, what tone to use, or any special requirements..."
                  rows={4}
                  className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                />
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">System Prompt</h2>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <h3 className="text-blue-300 font-medium mb-2">💡 System Prompt Tips</h3>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• Be specific about your agent's role and expertise</li>
                  <li>• Include guidelines for how it should respond</li>
                  <li>• Mention any limitations or boundaries</li>
                  <li>• Add context about your business or domain</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">System Prompt</label>
                <textarea
                  value={agentConfig.systemPrompt}
                  onChange={(e) => updateAgentConfig('systemPrompt', e.target.value)}
                  placeholder={`You are ${agentConfig.name || 'an AI assistant'}, ${agentConfig.description || 'designed to help users with their questions'}. 

Your personality is ${agentConfig.personality} and you should respond in a ${agentConfig.responseStyle} manner.

Key guidelines:
- Always be helpful and accurate
- If you don't know something, admit it
- Maintain a ${agentConfig.personality} tone
- Focus on ${agentConfig.useCase} tasks

Additional instructions: ${agentConfig.customInstructions || 'None specified'}`}
                  rows={12}
                  className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 font-mono text-sm"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    const autoPrompt = `You are ${agentConfig.name || 'an AI assistant'}, ${agentConfig.description || 'designed to help users with their questions'}. 

Your personality is ${agentConfig.personality} and you should respond in a ${agentConfig.responseStyle} manner.

Key guidelines:
- Always be helpful and accurate
- If you don't know something, admit it
- Maintain a ${agentConfig.personality} tone
- Focus on ${agentConfig.useCase} tasks

Additional instructions: ${agentConfig.customInstructions || 'None specified'}`;
                    updateAgentConfig('systemPrompt', autoPrompt);
                  }}
                  className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  Auto-Generate
                </button>
                <button
                  onClick={() => updateAgentConfig('systemPrompt', '')}
                  className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}

          {activeStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Knowledge Base</h2>
              
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                <h3 className="text-amber-300 font-medium mb-2">📚 Knowledge Base</h3>
                <p className="text-amber-300 text-sm">
                  Upload documents, PDFs, or text files that your agent should know about. 
                  This creates a custom knowledge base for your specific use case.
                </p>
              </div>
              
              <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-300 mb-4">
                  Drag and drop files here or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
                >
                  Upload Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.docx,.md,.json"
                  className="hidden"
                />
                <p className="text-purple-500 text-xs mt-2">
                  Supported: PDF, TXT, DOCX, MD, JSON
                </p>
              </div>
              
              {agentConfig.knowledgeBase.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-3">Uploaded Files</h3>
                  <div className="space-y-2">
                    {agentConfig.knowledgeBase.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-purple-400" />
                          <span className="text-white">{file}</span>
                        </div>
                        <button
                          onClick={() => removeKnowledgeFile(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-white font-medium mb-3">Training Examples</h3>
                <p className="text-purple-300 text-sm mb-4">
                  Provide examples of how your agent should respond to specific inputs
                </p>
                
                {agentConfig.examples.map((example, index) => (
                  <div key={index} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">User Input</label>
                        <textarea
                          value={example.input}
                          onChange={(e) => updateExample(index, 'input', e.target.value)}
                          placeholder="What the user might ask..."
                          rows={3}
                          className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Expected Response</label>
                        <textarea
                          value={example.output}
                          onChange={(e) => updateExample(index, 'output', e.target.value)}
                          placeholder="How your agent should respond..."
                          rows={3}
                          className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeExample(index)}
                      className="mt-3 text-red-400 hover:text-red-300 text-sm flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove Example</span>
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={addExample}
                  className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Example</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeStep === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Advanced Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Base Model</label>
                  <select
                    value={agentConfig.baseModel}
                    onChange={(e) => updateAgentConfig('baseModel', e.target.value)}
                    className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recommended)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Faster)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Latest)</option>
                    <option value="claude-sonnet">Claude Sonnet 3.5</option>
                    <option value="gpt-4">GPT-4 Turbo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Safety Level</label>
                  <select
                    value={agentConfig.safetyLevel}
                    onChange={(e) => updateAgentConfig('safetyLevel', e.target.value)}
                    className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="high">High (Recommended)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Temperature: {agentConfig.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={agentConfig.temperature}
                    onChange={(e) => updateAgentConfig('temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-purple-400 text-xs mt-1">Controls creativity (0 = focused, 1 = creative)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Max Tokens: {agentConfig.maxTokens}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    value={agentConfig.maxTokens}
                    onChange={(e) => updateAgentConfig('maxTokens', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-purple-400 text-xs mt-1">Maximum response length</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Top P: {agentConfig.topP}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={agentConfig.topP}
                    onChange={(e) => updateAgentConfig('topP', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-purple-400 text-xs mt-1">Controls response diversity</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Access Level</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'private', label: 'Private', desc: 'Only you can use this agent', icon: <Lock className="w-5 h-5" /> },
                    { value: 'team', label: 'Team', desc: 'Your team members can use this agent', icon: <Users className="w-5 h-5" /> },
                    { value: 'public', label: 'Public', desc: 'Anyone with the link can use this agent', icon: <Globe className="w-5 h-5" /> }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateAgentConfig('accessLevel', option.value)}
                      className={`p-4 rounded-lg border transition-all ${
                        agentConfig.accessLevel === option.value
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {option.icon}
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <p className="text-xs opacity-75">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 6 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Test & Deploy</h2>
              
              {/* Agent Preview */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-6 border border-blue-500/30">
                <h3 className="text-white font-bold text-xl mb-2">{agentConfig.name || 'Unnamed Agent'}</h3>
                <p className="text-purple-300 mb-4">{agentConfig.description || 'No description provided'}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Personality:</span>
                    <p className="text-blue-300 capitalize">{agentConfig.personality}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Use Case:</span>
                    <p className="text-blue-300 capitalize">{agentConfig.useCase.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Model:</span>
                    <p className="text-blue-300">{agentConfig.baseModel}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Knowledge Files:</span>
                    <p className="text-blue-300">{agentConfig.knowledgeBase.length}</p>
                  </div>
                </div>
              </div>
              
              {/* Test Interface */}
              <div className="bg-black/20 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-white font-medium mb-4">Test Your Agent</h3>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Type a message to test your agent..."
                      className="w-full bg-black/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
                      onKeyPress={(e) => e.key === 'Enter' && testAgent()}
                    />
                  </div>
                  
                  <button
                    onClick={testAgent}
                    disabled={!testMessage.trim() || isTesting}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isTesting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Test Agent</span>
                      </>
                    )}
                  </button>
                  
                  {testResponse && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h4 className="text-green-300 font-medium mb-2">Agent Response:</h4>
                      <p className="text-white">{testResponse}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Deploy Button */}
              <div className="flex justify-center">
                <button
                  onClick={saveAgent}
                  disabled={!agentConfig.name.trim() || !agentConfig.systemPrompt.trim() || isBuilding}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-3"
                >
                  {isBuilding ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Agent...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Create & Deploy Agent</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="bg-gray-500/20 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-500/30 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            
            <button
              onClick={() => setActiveStep(Math.min(6, activeStep + 1))}
              disabled={activeStep === 6}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentBuilderPage;
