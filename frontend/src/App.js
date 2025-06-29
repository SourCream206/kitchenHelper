import React, { useState } from "react";
import CodeScanner from "./components/codeScanner";
import Inventory from "./components/Inventory";
import BudgetTracker from "./components/BudgetTracker";
import MealPlan from "./components/MealPlan";
import WhatCanIEat from "./components/WhatCanIEat";
import WasteTips from "./components/WasteTips";
import LocationSetter from "./components/LocationSetter";
import SpendingAnalysis from "./components/SpendingAnalysis";
import PriceComparison from "./components/PriceComparison";
import CostPerMeal from "./components/CostPerMeal";
import EnhancedAddItem from "./components/EnhancedAddItem";
import api from "./api";

function App() {
  // toggling this forces re-fetch in components
  const [refreshKey, setRefreshKey] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleDetected = async (upc) => {
    try {
      // For scanned items, we need additional info
      const name = prompt("Product name (optional):");
      const price = parseFloat(prompt("Purchase price:") || "0");
      const store = prompt("Store name:") || "Unknown Store";
      
      if (price > 0) {
        await api.post("/inventory", { 
          upc, 
          name: name || undefined,
          purchase_price: price,
          store,
          quantity: 1
        });
        setRefreshKey((k) => !k);
        setShowScanner(false);
      } else {
        alert("Please enter a valid purchase price");
      }
    } catch (e) {
      console.error("Add-to-inventory failed:", e);
      alert("Failed to add item. Please try again.");
    }
  };

  const triggerRefresh = () => setRefreshKey((k) => !k);

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '2.5rem' }}>🥘 SmartPantry</h1>
        <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
          Combat food insecurity with AI-powered inventory management
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Location & Budget Setup */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <LocationSetter onLocationSet={triggerRefresh} />
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <BudgetTracker onBudgetSet={triggerRefresh} />
            </div>
          </div>
        </div>

        {/* Add Items Section */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #e9ecef'
        }}>
          <h2 style={{ color: '#495057', marginBottom: '15px' }}>📦 Add Items</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <button 
              onClick={() => setShowScanner(!showScanner)}
              style={{
                background: showScanner ? '#dc3545' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              {showScanner ? '📱 Stop Scanning' : '📱 Scan Barcode'}
            </button>
          </div>

          {showScanner && (
            <div style={{ marginBottom: '20px' }}>
              <CodeScanner onDetected={handleDetected} />
            </div>
          )}

          <EnhancedAddItem onItemAdded={triggerRefresh} />
        </div>

        {/* Current Inventory */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #e9ecef'
        }}>
          <Inventory refreshKey={refreshKey} />
        </div>

        {/* Budget Analysis */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #e9ecef'
        }}>
          <SpendingAnalysis refreshKey={refreshKey} />
        </div>

        {/* Cost Per Meal */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #e9ecef'
        }}>
          <CostPerMeal refreshKey={refreshKey} />
        </div>

        {/* AI Features */}
        <div style={{ 
          background: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #c3e6c3'
        }}>
          <MealPlan />
        </div>

        <div style={{ 
          background: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #c3e6c3'
        }}>
          <WhatCanIEat />
        </div>

        <div style={{ 
          background: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #c3e6c3'
        }}>
          <WasteTips />
        </div>

        {/* Price Optimization */}
        <div style={{ 
          background: '#fff3cd', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #ffeaa7',
          gridColumn: '1 / -1'
        }}>
          <PriceComparison />
        </div>

      </div>

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '40px', 
        padding: '20px',
        color: '#7f8c8d',
        borderTop: '1px solid #e9ecef'
      }}>
        <p>SmartPantry - Reducing food insecurity through intelligent inventory management</p>
      </footer>
    </div>
  );
}

export default App;