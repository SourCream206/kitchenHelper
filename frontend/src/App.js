import React, { useState } from "react";
import CodeScanner from "./components/codeScanner";
import Inventory from "./components/Inventory";
import BudgetTracker from "./components/BudgetTracker";
import MealPlan from "./components/MealPlan";
import WhatCanIEat from "./components/WhatCanIEat";
import WasteTips from "./components/WasteTips";
import api from "./api";

function App() {
  // toggling this forces re-fetch in Inventory
  const [refreshKey, setRefreshKey] = useState(false);

  const handleDetected = async (upc) => {
    try {
      await api.post("/inventory", { upc });
      // refresh the list once
      setRefreshKey((k) => !k);
    } catch (e) {
      console.error("Add-to-inventory failed:", e);
    }
  };

  return (
    <div className="App">
      <h1>SmartPantry</h1>
      <CodeScanner onDetected={handleDetected} />
      <BudgetTracker onBudgetSet={() => setRefreshKey((k) => !k)} />
      <Inventory refreshKey={refreshKey} />
      <MealPlan />
      <WhatCanIEat />
      <WasteTips />
    </div>
  );
}

export default App;
