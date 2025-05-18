# Drone IMU and Camera Data Visualizer Web App

A web-based application for visualizing and analyzing drone sensor data, including IMU measurements, pose information, and camera image sequences.

## Features

- **IMU Data Visualization**
  - Real-time plotting of accelerometer data (X, Y, Z axes)
  - Gyroscope measurements visualization
  - Time-series data analysis

- **3D Trajectory Visualization**
  - Interactive 3D plot of drone's flight path
  - Raw and smoothed trajectory options
  - Adjustable smoothing window
  - Zoom and rotate capabilities

- **Image Sequence Viewer**
  - Support for ZIP-compressed image sequences
  - Navigation through image frames
  - Image sequence synchronization with sensor data

## Technology Stack

- **Frontend**
  - React.js
  - Plotly.js for data visualization
  - CSS for styling

- **Backend**
  - FastAPI
  - Python for data processing
  - NumPy for numerical operations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- pip (Python package manager)

### Installation

1. Clone the repository:
```bash
git clone [your-repository-url]

##Install frontend dependencies:
cd drone-visualizer
npm install

##Install backend dependencies:
cd backend
pip install -r requirements.txt

##Run the backend server:
cd backend
uvicorn main:app --reload

##Run the frontend development server:
cd drone-visualizer
npm start

##Access the web app in your browser at
http://localhost:3000


