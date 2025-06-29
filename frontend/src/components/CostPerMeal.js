import React, { useState, useEffect } from "react";
import api from "../api";

export default function CostPerMeal({ refreshKey }) {
  const [mealData, setMealData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMealData();
  }, [refreshKey]);

  const fetchMealData = async () => {
    setLoading(true);
    try {
      const resp = await api.get("/cost-per-meal");
      setMealData(resp.data);
    } catch (e) {
      console.error("Failed to fetch cost per meal:", e);
    } finally {
      setLoading(false);
    }
  };

  const getCostColor = (cost) => {
    if (cost < 3) return '#28a745'; // Green - very affordable
    if (cost < 6) return '#ffc107'; // Yellow - moderate
    return '#dc3545'; // Red - expensive
  };

  if (loading) {
    return (
      <div>
        <h2 style={{ color: '#495057', marginBottom: '15px' }}>🍽️ Cost Per Meal</h2>
        <p>Calculating...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: '#495057', marginBottom: '15px' }}>🍽️ Cost Per Meal</h2>
      
      {mealData ? (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ 
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ 
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: getCostColor(mealData.cost_per_meal),
              marginBottom: '5px'
            }}>
              ${mealData.cost_per_meal}
            </div>
            <div style={{ color: '#6c757d', fontSize: '1.1rem' }}>
              per meal
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#495057' }}>
                {mealData.estimated_meals}
              </div>
              <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                Estimated Meals
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#495057' }}>
                ${mealData.total_inventory_value}
              </div>
              <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                Total Inventory Value
              </div>
            </div>
          </div>

          <div style={{ 
            background: '#e9ecef',
            padding: '15px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            color: '#495057'
          }}>
            {mealData.analysis}
          </div>

          <button 
            onClick={fetchMealData}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '15px',
              fontSize: '0.9rem'
            }}
          >
            🔄 Recalculate
          </button>
        </div>
      ) : (
        <p style={{ color: '#6c757d' }}>Add items to your inventory to see cost per meal analysis.</p>
      )}
    </div>
  );
}