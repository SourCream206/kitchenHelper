import React, { useState } from "react";
import api from "../api";

export default function BudgetTracker({ onBudgetSet }) {
  const [budget, setBudget] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/budget", { monthly_budget: parseFloat(budget) });
      onBudgetSet();
      setBudget("");
      alert("Budget set successfully!");
    } catch (e) {
      console.error("Failed to set budget:", e);
      alert("Failed to set budget. Please try again.");
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">💰 Budget Tracker</h2>
      <div className="card-content">
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Set your monthly food budget to track spending and stay on target.
        </p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <div>
            <label htmlFor="budget" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Monthly Budget ($)
            </label>
            <input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 200.00"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
              required
            />
          </div>
          <button 
            type="submit" 
            className="save-btn"
            style={{ alignSelf: 'flex-start' }}
          >
            Set Budget
          </button>
        </form>
      </div>
    </div>
  );
}
