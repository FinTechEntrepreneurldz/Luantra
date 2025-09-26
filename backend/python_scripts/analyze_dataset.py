import pandas as pd
import json
import sys
import numpy as np
from urllib.parse import urlparse
import os

def analyze_dataset(file_path):
    try:
        # For now, let's handle CSV files (we can extend this later)
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith('.json'):
            df = pd.read_json(file_path)
        else:
            return {"error": "Unsupported file format"}
        
        # Basic dataset info
        analysis = {
            "success": True,
            "filename": os.path.basename(file_path),
            "shape": {
                "rows": len(df),
                "columns": len(df.columns)
            },
            "columns": [],
            "suggested_target": None,
            "model_recommendations": []
        }
        
        # Analyze each column
        for col in df.columns:
            col_info = {
                "name": col,
                "dtype": str(df[col].dtype),
                "null_count": int(df[col].isnull().sum()),
                "unique_count": int(df[col].nunique()),
                "sample_values": df[col].dropna().head(3).tolist()
            }
            
            # Determine if it's likely a target variable
            if df[col].dtype in ['object', 'category'] and df[col].nunique() < 20:
                col_info["could_be_target"] = True
                col_info["type"] = "categorical"
                if analysis["suggested_target"] is None:
                    analysis["suggested_target"] = col
            elif df[col].dtype in ['int64', 'float64'] and col.lower() in ['target', 'label', 'class', 'y', 'outcome']:
                col_info["could_be_target"] = True
                col_info["type"] = "numerical"
                analysis["suggested_target"] = col
            else:
                col_info["could_be_target"] = False
                col_info["type"] = "feature"
            
            analysis["columns"].append(col_info)
        
        # Model recommendations
        if analysis["suggested_target"]:
            target_col = df[analysis["suggested_target"]]
            if target_col.dtype in ['object', 'category'] or target_col.nunique() < 20:
                analysis["model_recommendations"] = ["classification"]
            else:
                analysis["model_recommendations"] = ["regression"]
        else:
            analysis["model_recommendations"] = ["classification", "regression"]
        
        return analysis
        
    except Exception as e:
        return {"error": str(e), "success": False}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Please provide file path"}))
        sys.exit(1)
    
    result = analyze_dataset(sys.argv[1])
    print(json.dumps(result))
