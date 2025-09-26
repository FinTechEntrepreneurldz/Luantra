const API_BASE_URL = 'http://localhost:3001';

export interface UploadResponse {
  message: string;
  file: {
    success: boolean;
    filename: string;
    bucket: string;
    path: string;
    publicUrl: string;
  };
  metadata: {
    originalName: string;
    size: number;
    type: string;
    uploadedAt: string;
  };
}

export interface Dataset {
  name: string;
  size: string;
  contentType: string;
  timeCreated: string;
  path: string;
}

class UploadService {
  async uploadDataset(file: File, description?: string, tags?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (tags) formData.append('tags', tags);

    const response = await fetch(`${API_BASE_URL}/api/upload/dataset`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async listDatasets(): Promise<{ datasets: Dataset[] }> {
    const response = await fetch(`${API_BASE_URL}/api/datasets`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch datasets');
    }

    return response.json();
  }

  async checkHealth(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
}

export default new UploadService();
