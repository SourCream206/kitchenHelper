import React, { useState, useRef, useEffect } from "react";
import "./FullScreenFoodScanner.css";

export default function FullScreenFoodScanner({ isOpen, onClose, onFoodDetected }) {
  const [currentStep, setCurrentStep] = useState("camera"); // camera, analyzing, details, success
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [foodData, setFoodData] = useState(null);
  const [formData, setFormData] = useState({
    price: "",
    store: "",
    quantity: 1,
    notes: ""
  });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera when component opens
  useEffect(() => {
    if (isOpen && currentStep === "camera") {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, currentStep]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
      setCurrentStep("analyzing");
      stopCamera();
      
      // Automatically start analysis
      analyzeFoodImage(imageData);
    }
  };

  const analyzeFoodImage = async (imageData) => {
    setAnalyzing(true);
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'food.jpg');
      
      console.log('Sending image to backend for analysis...');
      
      // Send to backend for AI analysis
      const result = await fetch('http://localhost:8000/analyze-food', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', result.status);
      console.log('Response headers:', result.headers);
      
      if (result.ok) {
        const data = await result.json();
        console.log("AI Analysis Result:", data);
        setFoodData(data);
        setCurrentStep("details");
      } else {
        const errorText = await result.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${result.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      alert(`Failed to analyze food image: ${error.message}. Please try again or add manually.`);
      setCurrentStep("details");
    } finally {
      setAnalyzing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setFoodData(null);
    setFormData({
      price: "",
      store: "",
      quantity: 1,
      notes: ""
    });
    setCurrentStep("camera");
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveItem = () => {
    if (!formData.price || !formData.store) {
      alert("Please fill in Price and Store");
      return;
    }

    const itemData = {
      name: foodData?.name || "Unknown Food Item",
      category: foodData?.category || "Other",
      purchase_price: parseFloat(formData.price),
      store: formData.store,
      quantity: parseInt(formData.quantity),
      notes: formData.notes,
      upc: foodData?.upc || `food_${Date.now()}`,
      nutrition: foodData?.nutrition || {},
      image: capturedImage
    };

    onFoodDetected(itemData);
    setCurrentStep("success");
  };

  const handleClose = () => {
    stopCamera();
    setCurrentStep("camera");
    setCapturedImage(null);
    setFoodData(null);
    setFormData({
      price: "",
      store: "",
      quantity: 1,
      notes: ""
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fullscreen-scanner-overlay">
      <div className="fullscreen-scanner-container">
        {/* Header */}
        <div className="scanner-header">
          <div className="header-content">
            <h1 className="scanner-title">
              <span className="title-icon">📷</span>
              AI Food Scanner
            </h1>
            <button className="close-button" onClick={handleClose}>
              ✕
            </button>
          </div>
          <div className="step-indicator">
            <div className={`step ${currentStep === "camera" ? "active" : ""}`}>
              <span className="step-number">1</span>
              <span className="step-label">Take Photo</span>
            </div>
            <div className={`step ${currentStep === "analyzing" ? "active" : ""}`}>
              <span className="step-number">2</span>
              <span className="step-label">AI Analysis</span>
            </div>
            <div className={`step ${currentStep === "details" ? "active" : ""}`}>
              <span className="step-number">3</span>
              <span className="step-label">Confirm</span>
            </div>
            <div className={`step ${currentStep === "success" ? "active" : ""}`}>
              <span className="step-number">4</span>
              <span className="step-label">Done</span>
            </div>
          </div>
        </div>

        {/* Camera Step */}
        {currentStep === "camera" && (
          <div className="camera-step">
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="camera-overlay">
                <div className="scan-frame">
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>
                </div>
                <div className="scan-instructions">
                  <p>📸 Point camera at food item or packaging</p>
                  <p>🤖 AI will automatically identify the food</p>
                </div>
              </div>
            </div>
            
            <div className="camera-controls">
              <button className="capture-btn" onClick={captureImage}>
                <span className="capture-icon">📸</span>
                Capture & Analyze
              </button>
            </div>
          </div>
        )}

        {/* Analyzing Step */}
        {currentStep === "analyzing" && (
          <div className="analyzing-step">
            <div className="analyzing-content">
              <div className="analyzing-icon">🤖</div>
              <h2>AI is Analyzing Your Food</h2>
              <p>Identifying food item and extracting nutritional information...</p>
              
              <div className="analyzing-progress">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <div className="progress-steps">
                  <div className="progress-step">
                    <span className="step-dot">✓</span>
                    <span>Image captured</span>
                  </div>
                  <div className="progress-step">
                    <span className="step-dot">✓</span>
                    <span>OCR text extraction</span>
                  </div>
                  <div className="progress-step">
                    <span className="step-dot">⏳</span>
                    <span>AI food recognition</span>
                  </div>
                  <div className="progress-step">
                    <span className="step-dot">⏳</span>
                    <span>Nutritional analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Step */}
        {currentStep === "details" && (
          <div className="details-step">
            <div className="details-container">
              <div className="image-preview">
                <img 
                  src={capturedImage} 
                  alt="Captured food" 
                  className="preview-image"
                />
                <button className="retake-btn" onClick={retakePhoto}>
                  📷 Retake Photo
                </button>
              </div>
              
              <div className="form-section">
                <h2>Review & Confirm</h2>
                {foodData ? (
                  <>
                    <div className="detected-info">
                      <h3>✅ AI Detected:</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Name:</label>
                          <span>{foodData.name}</span>
                        </div>
                        <div className="info-item">
                          <label>Category:</label>
                          <span>{foodData.category}</span>
                        </div>
                        {foodData.upc && (
                          <div className="info-item">
                            <label>UPC:</label>
                            <span>{foodData.upc}</span>
                          </div>
                        )}
                      </div>
                      
                      {foodData.nutrition && Object.keys(foodData.nutrition).length > 0 && (
                        <div className="form-group full-width">
                          <label>Nutritional Info</label>
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
                  </>
                ) : (
                  <div className="form-group full-width">
                    <div className="manual-entry-notice">
                      <span style={{ color: "#f59e0b" }}>⚠️</span>
                      <span style={{ color: "#6b7280" }}>
                        Could not detect food item automatically. Please enter details manually below.
                      </span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Store *</label>
                  <input
                    type="text"
                    value={formData.store}
                    onChange={(e) => handleInputChange("store", e.target.value)}
                    placeholder="e.g., Walmart, Kroger"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional notes about this item..."
                    className="form-textarea"
                    rows="2"
                  />
                </div>
                <div className="form-actions">
                  <button className="back-btn" onClick={retakePhoto}>
                    ← Back to Camera
                  </button>
                  <button className="save-btn" onClick={saveItem}>
                    ✅ Save to Inventory
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {currentStep === "success" && (
          <div className="success-step">
            <div className="success-content">
              <div className="success-icon">✅</div>
              <h2>Item Added Successfully!</h2>
              <p>Your food item has been added to your inventory.</p>
              <div className="success-actions">
                <button className="add-another-btn" onClick={retakePhoto}>
                  ➕ Add Another Item
                </button>
                <button className="done-btn" onClick={handleClose}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 