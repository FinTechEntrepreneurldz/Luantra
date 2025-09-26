const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const { Storage } = require('@google-cloud/storage');
const router = express.Router();

const storage = new Storage({
  projectId: 'luantra-platform',
  keyFilename: './service-account-key.json'
});

const bucket = storage.bucket('luantra-datasets');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel', 
                         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, JSON, and Excel files are allowed'));
    }
  }
});

// Analyze dataset function
const analyzeDataset = async (buffer, filename) => {
  try {
    let data = [];
    let columns = [];
    
    if (filename.endsWith('.csv')) {
      // Parse CSV
      const csvString = buffer.toString();
      const rows = csvString.split('\n').filter(row => row.trim());
      if (rows.length === 0) throw new Error('Empty dataset');
      
      columns = rows[0].split(',').map(col => col.trim().replace(/"/g, ''));
      for (let i = 1; i < Math.min(rows.length, 101); i++) { // Analyze first 100 rows
        if (rows[i].trim()) {
          const values = rows[i].split(',').map(val => val.trim().replace(/"/g, ''));
          const rowObj = {};
          columns.forEach((col, index) => {
            rowObj[col] = values[index] || '';
          });
          data.push(rowObj);
        }
      }
    } else if (filename.endsWith('.json')) {
      // Parse JSON
      const jsonData = JSON.parse(buffer.toString());
      data = Array.isArray(jsonData) ? jsonData.slice(0, 100) : [jsonData];
      columns = data.length > 0 ? Object.keys(data[0]) : [];
    }

    // Detect column types and potential target columns
    const columnAnalysis = {};
    columns.forEach(col => {
      const sampleValues = data.map(row => row[col]).filter(val => val != null && val !== '').slice(0, 20);
      const numericValues = sampleValues.filter(val => !isNaN(parseFloat(val)));
      
      columnAnalysis[col] = {
        type: numericValues.length > sampleValues.length * 0.7 ? 'numeric' : 'categorical',
        sampleValues: sampleValues.slice(0, 5),
        uniqueCount: [...new Set(sampleValues)].length,
        nullCount: data.filter(row => row[col] == null || row[col] === '').length
      };
    });

    return {
      rowCount: data.length,
      totalRows: filename.endsWith('.csv') ? rows.length - 1 : data.length,
      columns: columns,
      columnAnalysis: columnAnalysis,
      sampleData: data.slice(0, 5),
      suggestedTargets: columns.filter(col => 
        col.toLowerCase().includes('price') || 
        col.toLowerCase().includes('target') || 
        col.toLowerCase().includes('label') ||
        col.toLowerCase().includes('class') ||
        col.toLowerCase().includes('category')
      )
    };
  } catch (error) {
    console.error('Dataset analysis error:', error);
    throw new Error(`Failed to analyze dataset: ${error.message}`);
  }
};

// Upload endpoint
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploading file:', req.file.originalname);
    
    // Analyze the dataset first
    const analysis = await analyzeDataset(req.file.buffer, req.file.originalname);
    
    // Upload to Google Cloud Storage
    const filename = `datasets/${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(filename);
    
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          uploadedAt: new Date().toISOString(),
          luantraAnalysis: JSON.stringify(analysis)
        }
      }
    });

    stream.on('error', (error) => {
      console.error('Upload stream error:', error);
      res.status(500).json({ error: 'Failed to upload to Google Cloud Storage' });
    });

    stream.on('finish', () => {
      console.log('File uploaded successfully:', filename);
      res.json({
        message: 'Dataset uploaded and analyzed successfully',
        file: {
          name: filename,
          originalName: req.file.originalname,
          bucket: 'luantra-datasets',
          size: req.file.size
        },
        analysis: analysis
      });
    });

    stream.end(req.file.buffer);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Upload failed',
      details: error.stack
    });
  }
});

module.exports = router;
