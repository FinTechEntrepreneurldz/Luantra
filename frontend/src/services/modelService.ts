const API_BASE_URL = 'http://localhost:3001';

export interface ModelCreationRequest {
  datasetPath: string;
  modelName: string;
  modelType?: 'classification' | 'regression';
  targetVariable?: string;
  useAutoConfig?: boolean;
}

export interface ModelCreationResponse {
  message: string;
  model: {
    success: boolean;
    trainingJobName: string;
    modelName: string;
    status: string;
    jobId: string;
  };
  status: string;
  vertexAIJob: string;
}

export interface TrainingStatus {
  jobId: string;
  status: string;
  details: {
    name: string;
    state: string;
    createTime: any;
    updateTime: any;
    error?: any;
  };
}

export interface VertexAIModel {
  name: string;
  displayName: string;
  createTime: any;
  updateTime: any;
  description: string;
}

class ModelService {
  async createModel(request: ModelCreationRequest): Promise<ModelCreationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/models/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Model creation failed');
    }

    return response.json();
  }

  async getTrainingStatus(jobId: string): Promise<TrainingStatus> {
    const response = await fetch(`${API_BASE_URL}/api/models/training/${jobId}/status`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get training status');
    }

    return response.json();
  }

  async listModels(): Promise<{ models: VertexAIModel[] }> {
    const response = await fetch(`${API_BASE_URL}/api/models`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list models');
    }

    return response.json();
  }

  async deployModel(modelName: string, endpointName: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/models/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ modelName, endpointName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Model deployment failed');
    }

    return response.json();
  }

  async listEndpoints(): Promise<{ endpoints: any[] }> {
    const response = await fetch(`${API_BASE_URL}/api/endpoints`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list endpoints');
    }

    return response.json();
  }
}

export default new ModelService();
