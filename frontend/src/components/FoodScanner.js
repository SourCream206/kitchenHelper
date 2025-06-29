import React, { useState, useRef, useEffect } from "react";
import "./FoodScanner.css";

export default function FoodScanner({ onFoodDetected }) {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [foodData, setFoodData] = useState(null);
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("");
  const [quantity, setQuantity] = useState(1);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsScanning(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  // Analyze food packaging using OCR and AI
  const analyzeFood = async () => {
    if (!capturedImage) return;
    
    setAnalyzing(true);
    try {
      // Convert base64 image to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Create FormData to send image
      const formData = new FormData();
      formData.append('image', blob, 'food.jpg');
      
      // Send to backend for analysis
      const result = await fetch('/api/analyze-food', {
        method: 'POST',
        body: formData,
      });
      
      if (result.ok) {
        const data = await result.json();
        setFoodData(data);
      } else {
        throw new Error('Failed to analyze image');
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      alert('Failed to analyze food packaging. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Save food item
  const saveFoodItem = () => {
    if (!foodData || !price || !store) {
      alert('Please fill in all required fields');
      return;
    }

    const itemData = {
      name: foodData.name,
      nutrition: foodData.nutrition,
      category: foodData.category,
      purchase_price: parseFloat(price),
      store: store,
      quantity: parseInt(quantity),
      upc: foodData.upc || `food_${Date.now()}`, // Generate unique ID
    };

    onFoodDetected(itemData);
    
    // Reset form
    setCapturedImage(null);
    setFoodData(null);
    setPrice("");
    setStore("");
    setQuantity(1);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="food-scanner">
      {!capturedImage ? (
        <div className="scanner-view">
          {!isScanning ? (
            <div className="scanner-placeholder">
              <div className="placeholder-icon">📷</div>
              <h3>Food Scanner</h3>
              <p>Point your camera at the food packaging to capture nutritional information</p>
              <button 
                className="start-scan-button"
                onClick={startCamera}
              >
                Start Scanning
              </button>
            </div>
          ) : (
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div className="scan-overlay">
                <div className="scan-frame">
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>
                </div>
                <p className="scan-instruction">Position the food packaging within the frame</p>
              </div>
              <div className="camera-controls">
                <button 
                  className="capture-button"
                  onClick={captureImage}
                >
                  📸 Capture
                </button>
                <button 
                  className="cancel-button"
                  onClick={stopCamera}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="analysis-view">
          <div className="captured-image-container">
            <img 
              src={capturedImage} 
              alt="Captured food" 
              className="captured-image"
            />
            <button 
              className="retake-button"
              onClick={() => setCapturedImage(null)}
            >
              📷 Retake Photo
            </button>
          </div>

          {analyzing ? (
            <div className="analyzing">
              <div className="loading-spinner"></div>
              <p>Analyzing food packaging...</p>
            </div>
          ) : foodData ? (
            <div className="food-details">
              <h3>Detected Food Item</h3>
              <div className="food-info">
                <div className="info-row">
                  <label>Name:</label>
                  <span>{foodData.name}</span>
                </div>
                <div className="info-row">
                  <label>Category:</label>
                  <span>{foodData.category}</span>
                </div>
                {foodData.nutrition && (
                  <div className="nutrition-info">
                    <h4>Nutritional Information</h4>
                    <div className="nutrition-grid">
                      {Object.entries(foodData.nutrition).map(([key, value]) => (
                        <div key={key} className="nutrition-item">
                          <span className="nutrition-label">{key}:</span>
                          <span className="nutrition-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="purchase-details">
                <h4>Purchase Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="price-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Store:</label>
                    <input
                      type="text"
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      placeholder="e.g., Walmart"
                      className="store-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="quantity-input"
                    />
                  </div>
                </div>
                <button 
                  className="save-button"
                  onClick={saveFoodItem}
                >
                  �� Save to Inventory
                </button>
              </div>
            </div>
          ) : (
            <div className="analyze-prompt">
              <p>Ready to analyze the food packaging?</p>
              <button 
                className="analyze-button"
                onClick={analyzeFood}
              >
                🔍 Analyze Food
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 