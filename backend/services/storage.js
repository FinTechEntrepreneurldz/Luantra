const { Storage } = require('@google-cloud/storage');

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: 'luantra-platform',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const DATASETS_BUCKET = 'luantra-platform-datasets';
const MODELS_BUCKET = 'luantra-platform-models';
const ARTIFACTS_BUCKET = 'luantra-platform-artifacts';

class StorageService {
  async uploadDataset(file, filename, metadata = {}) {
    try {
      const bucket = storage.bucket(DATASETS_BUCKET);
      const blob = bucket.file(filename);
      
      const stream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            ...metadata,
            uploadedAt: new Date().toISOString(),
            source: 'luantra-platform'
          }
        }
      });

      return new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', () => {
          resolve({
            success: true,
            filename,
            bucket: DATASETS_BUCKET,
            path: `gs://${DATASETS_BUCKET}/${filename}`,
            publicUrl: `https://storage.googleapis.com/${DATASETS_BUCKET}/${filename}`
          });
        });
        stream.end(file.buffer);
      });
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async listDatasets() {
    try {
      const bucket = storage.bucket(DATASETS_BUCKET);
      const [files] = await bucket.getFiles();
      
      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        timeCreated: file.metadata.timeCreated,
        path: `gs://${DATASETS_BUCKET}/${file.name}`
      }));
    } catch (error) {
      throw new Error(`Failed to list datasets: ${error.message}`);
    }
  }
}

module.exports = new StorageService();
