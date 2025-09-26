const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

class DatasetAnalyzer {
  constructor() {
    this.storage = new Storage();
  }

  async analyzeDataset(gsPath) {
    try {
      console.log(`Analyzing dataset: ${gsPath}`);
      
      // Download file from GCS to temp location
      const bucket = this.storage.bucket(gsPath.split('/')[2]);
      const fileName = gsPath.split('/').slice(3).join('/');
      const tempPath = `/tmp/${Date.now()}-${path.basename(fileName)}`;
      
      await bucket.file(fileName).download({ destination: tempPath });
      console.log(`Downloaded ${gsPath} to ${tempPath}`);
      
      // Analyze CSV file with JavaScript
      const analysis = await this.analyzeCsvFile(tempPath);
      
      // Clean up temp file
      fs.unlinkSync(tempPath);
      
      console.log('Dataset analysis completed:', analysis);
      return analysis;
      
    } catch (error) {
      console.error('Dataset analysis failed:', error);
      throw new Error(`Dataset analysis failed: ${error.message}`);
    }
  }

  async analyzeCsvFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const columns = {};
      let rowCount = 0;
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          rowCount++;
          
          // Analyze first 100 rows for performance
          if (rowCount <= 100) {
            Object.keys(data).forEach(col => {
              if (!columns[col]) {
                columns[col] = {
                  name: col,
                  values: [],
                  nullCount: 0,
                  uniqueValues: new Set()
                };
              }
              
              const value = data[col];
              if (value === '' || value === null || value === undefined) {
                columns[col].nullCount++;
              } else {
                columns[col].values.push(value);
                columns[col].uniqueValues.add(value);
              }
            });
          }
        })
        .on('end', () => {
          // Process the analysis
          const columnAnalysis = Object.keys(columns).map(colName => {
            const col = columns[colName];
            const uniqueCount = col.uniqueValues.size;
            const sampleValues = Array.from(col.uniqueValues).slice(0, 3);
            
            // Determine if numeric
            const isNumeric = col.values.every(val => !isNaN(parseFloat(val)) && isFinite(val));
            
            // Determine if could be target
            const couldBeTarget = (
              uniqueCount < 20 && uniqueCount > 1 && uniqueCount < rowCount * 0.5
            ) || colName.toLowerCase().includes('target') || 
                colName.toLowerCase().includes('label') ||
                colName.toLowerCase().includes('class');
            
            return {
              name: colName,
              dtype: isNumeric ? 'numeric' : 'categorical',
              null_count: col.nullCount,
              unique_count: uniqueCount,
              sample_values: sampleValues,
              could_be_target: couldBeTarget,
              type: couldBeTarget ? 'target' : 'feature'
            };
          });
          
          // Find suggested target
          const targetColumns = columnAnalysis.filter(col => col.could_be_target);
          const suggestedTarget = targetColumns.length > 0 ? targetColumns[0].name : null;
          
          // Determine model type
          const modelRecommendations = [];
          if (suggestedTarget) {
            const targetCol = columnAnalysis.find(col => col.name === suggestedTarget);
            if (targetCol && targetCol.dtype === 'categorical') {
              modelRecommendations.push('classification');
            } else {
              modelRecommendations.push('regression');
            }
          } else {
            modelRecommendations.push('classification', 'regression');
          }
          
          const analysis = {
            success: true,
            filename: path.basename(filePath),
            shape: {
              rows: rowCount,
              columns: columnAnalysis.length
            },
            columns: columnAnalysis,
            suggested_target: suggestedTarget,
            model_recommendations: modelRecommendations
          };
          
          resolve(analysis);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}

module.exports = new DatasetAnalyzer();
