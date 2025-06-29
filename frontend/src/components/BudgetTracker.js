import React, { useState } from "react";
import api from "../api";

export default function BudgetTracker({ onBudgetSet }) {
  const [budget, setBudget] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/budget", { monthly_budget: parseFloat(budget) });
      onBudgetSet();
    } catch (e) {
      console.error("Failed to set budget:", e);
    }
  };

  return (
    <div>
      <h2>Monthly Budget</h2>
      <form onSubmit={submit}>
        <input
          type="number"
          min="0"
          step="0.01"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="e.g. 200"
        />
        <button type="submit" style={{ marginLeft: 8 }}>
          Set
        </button>
      </form>
    </div>
  );
}
