import React, { useEffect, useState } from "react";
import * as Quagga from "quagga";
import "./FullScreenFoodScanner.css";

export default function FullScreenBarcodeScanner({ isOpen, onClose, onDetected }) {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !scanning) return;

    // Clear any previous errors and success states
    setError(null);
    setSuccess(false);

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector("#fullscreen-barcode-scanner"),
          constraints: {
            facingMode: "environment",
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
            aspectRatio: { min: 1, max: 2 }
          },
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader", 
            "upc_reader",
            "upc_e_reader",
            "code_128_reader",
            "code_39_reader"
          ],
          multiple: false,
          debug: {
            drawBoundingBox: true,
            showFrequency: false,
            drawScanline: true,
            showPattern: false
          }
        },
        locate: true,
        frequency: 5, // Reduced frequency for more accurate detection
        debug: false
      },
      (err) => {
        if (err) {
          console.error("Quagga init failed:", err);
          setError("Failed to initialize camera. Please check camera permissions.");
          return;
        }
        console.log("Quagga initialized successfully");
        Quagga.start();
      }
    );

    const onDetectedCallback = (data) => {
      console.log("Barcode detected:", data.codeResult.code);
      console.log("Confidence:", data.codeResult.confidence);
      console.log("Format:", data.codeResult.format);
      
      // Validate the barcode
      const code = data.codeResult.code;
      const confidence = data.codeResult.confidence;
      
      // Check if confidence is too low (less than 0.5)
      if (confidence < 0.5) {
        console.log("Low confidence barcode detected, ignoring...");
        return;
      }
      
      // Validate UPC length (should be 12 or 13 digits)
      if (!/^\d{12,13}$/.test(code)) {
        console.log("Invalid UPC format, ignoring...");
        return;
      }
      
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      
      setSuccess(true);
      setScanning(false);
      
      // Show success briefly before calling onDetected
      setTimeout(() => {
        Quagga.offDetected(onDetectedCallback);
        Quagga.stop();
        onDetected(code);
      }, 500);
    };

    const onProcessedCallback = (data) => {
      if (data) {
        const drawingCanvas = Quagga.canvas.dom.overlay;
        const drawingCtx = drawingCanvas.getContext('2d');
        if (drawingCtx) {
          drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        }
      }
    };

    Quagga.onDetected(onDetectedCallback);
    Quagga.onProcessed(onProcessedCallback);

    return () => {
      if (Quagga.stop) Quagga.stop();
      Quagga.offDetected(onDetectedCallback);
      Quagga.offProcessed(onProcessedCallback);
    };
  }, [isOpen, scanning, onDetected]);

  if (!isOpen) return null;

  return (
    <div className="fullscreen-scanner-overlay">
      <div className="fullscreen-scanner-container" style={{ justifyContent: 'center', alignItems: 'center', padding: 0 }}>
        <div className="scanner-header">
          <div className="header-content">
            <h1 className="scanner-title">
              <span className="title-icon">📷</span>
              Barcode Scanner
            </h1>
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
        <div className="camera-step" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-900)' }}>
          {error ? (
            <div style={{ textAlign: 'center', color: '#fff', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ marginBottom: '1rem' }}>Camera Error</h3>
              <p style={{ marginBottom: '2rem', opacity: 0.8 }}>{error}</p>
              <button 
                className="save-btn" 
                onClick={() => {
                  setError(null);
                  setScanning(true);
                }}
              >
                Try Again
              </button>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center', color: '#fff', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ marginBottom: '1rem' }}>Barcode Detected!</h3>
              <p style={{ marginBottom: '2rem', opacity: 0.8 }}>Processing product information...</p>
            </div>
          ) : (
            <div className="camera-container" style={{ position: 'relative', width: 'min(400px, 90vw)', height: 'min(300px, 50vw)', background: '#000', borderRadius: '18px', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
              <div id="fullscreen-barcode-scanner" style={{ width: '100%', height: '100%' }}></div>
              <div className="camera-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div className="scan-frame" style={{ position: 'relative', width: '90%', height: '60%', border: '3px solid #fff', borderRadius: '12px', marginBottom: '1rem' }}>
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>
                </div>
                <p className="scan-instruction" style={{ color: '#fff', fontWeight: 500, fontSize: '1.1rem', textShadow: '0 2px 8px #000' }}>Align barcode within the frame</p>
              </div>
            </div>
          )}
          {!scanning && !error && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button className="save-btn" onClick={() => setScanning(true)}>Scan again?</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 