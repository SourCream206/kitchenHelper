import React, { useState } from "react";
import api from "../api";

export default function MealPlan() {
  const [days, setDays] = useState(7);
  const [members, setMembers] = useState(1);
  const [plan, setPlan] = useState("");

  const fetchPlan = async () => {
    try {
      const resp = await api.post("/mealplan", { days, members });
      setPlan(resp.data.meal_plan);
    } catch (e) {
      console.error("Failed to fetch meal plan:", e);
    }
  };

  return (
    <div>
      <h2>Generate Meal Plan</h2>
      <label>
        Days:
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(+e.target.value)}
          min="1"
          max="14"
          style={{ width: 50, marginLeft: 4 }}
        />
      </label>
      <label style={{ marginLeft: 12 }}>
        Members:
        <input
          type="number"
          value={members}
          onChange={(e) => setMembers(+e.target.value)}
          min="1"
          style={{ width: 50, marginLeft: 4 }}
        />
      </label>
      <button onClick={fetchPlan} style={{ marginLeft: 12 }}>
        Plan Meals
      </button>
      {plan && (
        <pre style={{ background: "#f4f4f4", padding: 12, marginTop: 8 }}>
          {plan}
        </pre>
      )}
    </div>
  );
}
