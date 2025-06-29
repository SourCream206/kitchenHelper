import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import api from "./api";
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
import ScanResultModal from "./components/ScanResultModal";
import LandingPage from "./components/LandingPage";
import Layout from "./components/Layout";
import FoodMap from "./components/FoodMap";
import PortionTracker from "./components/PortionTracker";
import "./App.css";

function App() {
  // toggling this forces re-fetch in components
  const [refreshKey, setRefreshKey] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scannedUpc, setScannedUpc] = useState("");
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleDetected = async (upc) => {
    setScannedUpc(upc);
    setScanModalOpen(true);
    setShowScanner(false); // Close scanner when barcode is detected
  };

  const handleScanSave = async (itemData) => {
    try {
      console.log("Sending item data:", itemData);
      const response = await api.post("/inventory", itemData);
      console.log("Response received:", response.data);
      setRefreshKey((k) => !k);
      setScanModalOpen(false);
      alert("Item added successfully!");
    } catch (error) {
      console.error("Failed to add scanned item:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert("Failed to add item. Please try again.");
    }
  };

  const handleScanCancel = () => {
    setScanModalOpen(false);
    setScannedUpc("");
  };

  const triggerRefresh = () => setRefreshKey((k) => !k);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/inventory" element={<Inventory refreshKey={refreshKey} />} />
          <Route path="/budget" element={<BudgetTracker onBudgetSet={triggerRefresh} />} />
          <Route path="/mealplan" element={<MealPlan refreshKey={refreshKey} />} />
          <Route path="/tips" element={<WasteTips />} />
          <Route path="/whatcanieat" element={<WhatCanIEat refreshKey={refreshKey} />} />
          <Route path="/spending-analysis" element={<SpendingAnalysis refreshKey={refreshKey} />} />
          <Route path="/price-comparison" element={<PriceComparison refreshKey={refreshKey} />} />
          <Route path="/cost-per-meal" element={<CostPerMeal refreshKey={refreshKey} />} />
          <Route path="/location" element={<LocationSetter />} />
          <Route path="/map" element={<FoodMap />} />
          <Route path="/portion-tracker" element={<PortionTracker refreshKey={refreshKey} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;