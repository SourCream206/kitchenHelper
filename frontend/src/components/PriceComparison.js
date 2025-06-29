import React, { useState } from "react";
import api from "../api";

export default function PriceComparison(props) {
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const resp = await api.get("/price-comparison");
      setSuggestions(resp.data.suggestions);
    } catch (e) {
      console.error("Failed to fetch price comparison:", e);
      setSuggestions("Failed to load price comparison suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">🏪 Price Optimization</h2>
      <div className="card-content">
        <p style={{ color: '#6c757d', marginBottom: '15px' }}>
          Get AI-powered suggestions to save money on your grocery shopping based on your location and purchase history.
        </p>
        
        <button 
          onClick={fetchSuggestions}
          disabled={loading}
          style={{
            background: '#ffc107',
            color: '#212529',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Finding Deals...' : '🔍 Find Better Prices'}
        </button>

        {suggestions && (
          <div style={{ 
            marginTop: '20px',
            padding: '20px',
            background: '#fff8e1',
            borderRadius: '8px',
            border: '2px solid #ffecb3'
          }}>
            <h3 style={{ color: '#f57f17', marginBottom: '15px' }}>💡 Money-Saving Tips:</h3>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              fontSize: '0.95rem',
              color: '#424242',
              margin: 0,
              lineHeight: '1.5'
            }}>
              {suggestions}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}