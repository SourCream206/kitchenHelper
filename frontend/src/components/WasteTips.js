import React, { useState } from "react";
import api from "../api";

export default function WasteTips(props) {
  const [tips, setTips] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchTips = async () => {
    setIsLoading(true);
    try {
      const resp = await api.get("/tips");
      setTips(resp.data.tips);
    } catch (e) {
      console.error("Failed to fetch tips:", e);
      alert("Failed to fetch tips. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">♻️ Waste Reduction Tips</h2>
      <div className="card-content">
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Get AI-powered tips to reduce food waste and save money.
        </p>
        
        <button 
          onClick={fetchTips} 
          className="save-btn"
          disabled={isLoading}
          style={{ marginBottom: '1.5rem' }}
        >
          {isLoading ? "Loading..." : "Get Smart Tips"}
        </button>
        
        {tips && (
          <div style={{ 
            padding: '1.5rem', 
            background: '#f8f9fa', 
            borderRadius: '12px', 
            border: '1px solid #e9ecef',
            whiteSpace: 'pre-line',
            lineHeight: '1.6',
            color: '#495057'
          }}>
            {tips}
          </div>
        )}
      </div>
    </div>
  );
}
