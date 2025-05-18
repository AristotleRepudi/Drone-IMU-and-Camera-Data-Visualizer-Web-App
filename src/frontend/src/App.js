import React, { useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import './App.css';

function App() {
  const [imuData, setImuData] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [smoothingWindow, setSmoothingWindow] = useState(5);
  const [showRawData, setShowRawData] = useState(true);
  const [showSmoothedData, setShowSmoothedData] = useState(false);

  // Add smoothing function
  const smoothData = useCallback((data, windowSize) => {
    if (!data || windowSize <= 1) return data;
    
    const smoothed = {...data};
    ['x', 'y', 'z'].forEach(axis => {
      const values = data[axis];
      smoothed[axis] = values.map((_, i) => {
        const start = Math.max(0, i - Math.floor(windowSize/2));
        const end = Math.min(values.length, i + Math.floor(windowSize/2) + 1);
        const window = values.slice(start, end);
        return window.reduce((a, b) => a + b, 0) / window.length;
      });
    });
    return smoothed;
  }, []);

  // Update plot data preparation
  const preparePlotData = useCallback((rawData, type) => {
    if (!rawData) return [];
    
    const plotData = [];
    const smoothedData = type === 'pose' 
      ? smoothData(rawData.position, smoothingWindow)
      : {
          acceleration: smoothData(rawData.acceleration, smoothingWindow),
          gyroscope: smoothData(rawData.gyroscope, smoothingWindow)
        };

    if (type === 'pose') {
      if (showRawData) {
        plotData.push({
          type: 'scatter3d',
          mode: 'lines+markers',
          name: 'Raw Trajectory',
          x: rawData.position.x,
          y: rawData.position.y,
          z: rawData.position.z,
          marker: { size: 5 },
          line: { color: '#1f77b4' }
        });
      }
      
      if (showSmoothedData) {
        plotData.push({
          type: 'scatter3d',
          mode: 'lines+markers',
          name: 'Smoothed Trajectory',
          x: smoothedData.x,
          y: smoothedData.y,
          z: smoothedData.z,
          marker: { size: 5 },
          line: { color: '#ff7f0e' }
        });
      }
    }

    return plotData;
  }, [smoothData, smoothingWindow, showRawData, showSmoothedData]);

  // Add data analysis controls
  const renderDataControls = () => (
    <div className="data-controls">
      <div className="control-group">
        <label>
          Smoothing Window:
          <input
            type="range"
            min="1"
            max="15"
            value={smoothingWindow}
            onChange={(e) => setSmoothingWindow(Number(e.target.value))}
          />
          <span>{smoothingWindow}</span>
        </label>
      </div>
      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={showRawData}
            onChange={(e) => setShowRawData(e.target.checked)}
          />
          Show Raw Data
        </label>
        <label>
          <input
            type="checkbox"
            checked={showSmoothedData}
            onChange={(e) => setShowSmoothedData(e.target.checked)}
          />
          Show Smoothed Data
        </label>
      </div>
    </div>
  );

  const handleImuUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload_imu/', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setImuData(data);
    } catch (error) {
      console.error('Error uploading IMU data:', error);
    }
  };

  const handlePoseUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload_pose/', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setPoseData(data);
    } catch (error) {
      console.error('Error uploading pose data:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload_images/', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setImageFiles(data.image_files);
      setCurrentImageIndex(0);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Drone Data Visualizer</h1>
      </header>
      
      <div className="upload-section">
        <div className="upload-card">
          <h3>IMU Data</h3>
          <input type="file" accept=".csv" onChange={handleImuUpload} />
        </div>
        
        <div className="upload-card">
          <h3>Pose Data</h3>
          <input type="file" accept=".csv" onChange={handlePoseUpload} />
        </div>
        
        <div className="upload-card">
          <h3>Image Sequence</h3>
          <input type="file" accept=".zip" onChange={handleImageUpload} />
        </div>
      </div>

      {imuData && (
        <div className="plots-section">
          <h2>IMU Data Visualization</h2>
          <Plot
            data={[
              {
                x: imuData.timestamp,
                y: imuData.acceleration.x,
                name: 'Acc X',
                type: 'scatter'
              },
              {
                x: imuData.timestamp,
                y: imuData.acceleration.y,
                name: 'Acc Y',
                type: 'scatter'
              },
              {
                x: imuData.timestamp,
                y: imuData.acceleration.z,
                name: 'Acc Z',
                type: 'scatter'
              }
            ]}
            layout={{
              title: 'Acceleration vs Time',
              xaxis: { title: 'Time' },
              yaxis: { title: 'Acceleration (m/s²)' },
              height: 500  // Added fixed height
            }}
          />
          <h2>Pose Data Visualization</h2>
          <Plot
            data={[
              {
                x: imuData.timestamp,
                y: imuData.gyroscope.x,
                name: 'Gyro X',
                type: 'scatter'
              },
              {
                x: imuData.timestamp,
                y: imuData.gyroscope.y,
                name: 'Gyro Y',
                type: 'scatter'
              },
              {
                x: imuData.timestamp,
                y: imuData.gyroscope.z,
                name: 'Gyro Z',
                type: 'scatter'
              }
            ]}
            layout={{
              title: 'Angular Velocity vs Time',
              xaxis: { title: 'Time' },
              yaxis: { title: 'Angular Velocity (rad/s)' },
              height: 500  // Added fixed height
            }}
          />
        </div>
      )}

      {poseData && (
        <div className="visualization-section">
          <h2>3D Trajectory Visualization</h2>
          {renderDataControls()}
          <Plot
            data={preparePlotData(poseData, 'pose')}
            layout={{
              title: 'Drone 3D Trajectory',
              scene: {
                xaxis: { title: 'X (m)' },
                yaxis: { title: 'Y (m)' },
                zaxis: { title: 'Z (m)' },
                camera: {
                  eye: { x: 1.5, y: 1.5, z: 1.5 }
                }
              },
              showlegend: true,
              legend: {
                x: 0,
                y: 1,
                bgcolor: 'rgba(255,255,255,0.5)'
              },
              height: 700  // Increased height for 3D visualization
            }}
            config={{
              responsive: true,
              scrollZoom: true,
              displayModeBar: true,
              modeBarButtonsToAdd: ['hoverClosest3d']
            }}
          />
        </div>
      )}

      {imageFiles.length > 0 && (
        <div className="image-section">
          <h2>Image Sequence</h2>
          <p>Total Images: {imageFiles.length}</p>
          <div className="image-navigation">
            <button 
              onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
              disabled={currentImageIndex === 0}
            >
              Previous
            </button>
            <span>Image {currentImageIndex + 1} of {imageFiles.length}</span>
            <button 
              onClick={() => setCurrentImageIndex(Math.min(imageFiles.length - 1, currentImageIndex + 1))}
              disabled={currentImageIndex === imageFiles.length - 1}
            >
              Next
            </button>
          </div>
          <div className="image-display">
            {/* Image display will be implemented once we have image serving from backend */}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
