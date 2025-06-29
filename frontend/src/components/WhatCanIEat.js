import React, { useState } from "react";
import api from "../api";

export default function WhatCanIEat(props) {
  const [options, setOptions] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchOptions = async () => {
    setIsLoading(true);
    try {
      const resp = await api.get("/whatcanieat");
      setOptions(resp.data.options);
    } catch (e) {
      console.error("Failed to fetch options:", e);
      alert("Failed to fetch meal options. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">🍴 What Can I Eat?</h2>
      <div className="card-content">
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Discover meals you can make with your current inventory and get recipe suggestions.
        </p>
        
        <button 
          onClick={fetchOptions} 
          className="save-btn"
          disabled={isLoading}
          style={{ marginBottom: '1.5rem' }}
        >
          {isLoading ? "Finding meals..." : "Find Meals I Can Make"}
        </button>
        
        {options && (
          <div style={{ 
            padding: '1.5rem', 
            background: '#f8f9fa', 
            borderRadius: '12px', 
            border: '1px solid #e9ecef',
            whiteSpace: 'pre-line',
            lineHeight: '1.6',
            color: '#495057'
          }}>
            {options}
          </div>
        )}
      </div>
    </div>
  );
}
