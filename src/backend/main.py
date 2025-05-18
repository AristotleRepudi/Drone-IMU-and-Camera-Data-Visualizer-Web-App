from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from io import BytesIO
import zipfile
from typing import Optional
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload_imu/")
async def upload_imu(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        contents = await file.read()
        df = pd.read_csv(BytesIO(contents))
        
        # Assuming CSV has columns: timestamp, acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z
        return {
            "timestamp": df['timestamp'].tolist(),
            "acceleration": {
                "x": df['acc_x'].tolist(),
                "y": df['acc_y'].tolist(),
                "z": df['acc_z'].tolist()
            },
            "gyroscope": {
                "x": df['gyro_x'].tolist(),
                "y": df['gyro_y'].tolist(),
                "z": df['gyro_z'].tolist()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/upload_pose/")
async def upload_pose(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        contents = await file.read()
        df = pd.read_csv(BytesIO(contents))
        
        # Assuming CSV has columns: timestamp, x, y, z
        return {
            "timestamp": df['timestamp'].tolist(),
            "position": {
                "x": df['x'].tolist(),
                "y": df['y'].tolist(),
                "z": df['z'].tolist()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/upload_images/")
async def upload_images(file: UploadFile = File(...)):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="File must be a ZIP")
    
    try:
        contents = await file.read()
        zip_file = zipfile.ZipFile(BytesIO(contents))
        image_files = [f for f in zip_file.namelist() if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        return {
            "image_files": image_files
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))