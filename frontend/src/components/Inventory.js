import React, { useState, useEffect } from "react";
import api from "../api";

export default function Inventory({ refreshKey }) {
  const [items, setItems] = useState([]);

  const fetchInventory = async () => {
    try {
      const resp = await api.get("/inventory");
      setItems(resp.data);
    } catch (e) {
      console.error("Failed to fetch inventory:", e);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [refreshKey]);

  const removeOne = async (upc) => {
    try {
      await api.delete(`/inventory/${upc}`, { params: { quantity: 1 } });
      fetchInventory();
    } catch (e) {
      console.error("Failed to remove item:", e);
    }
  };

  return (
    <div>
      <h2>Your Pantry</h2>
      {items.length === 0 && <p>No items in pantry yet.</p>}
      <ul>
        {items.map((it) => (
          <li key={it.upc} style={{ marginBottom: 8 }}>
            {it.name} ×{it.quantity}{" "}
            <small>(Expires: {new Date(it.expiry).toLocaleDateString()})</small>
            <button
              onClick={() => removeOne(it.upc)}
              style={{
                marginLeft: 12,
                color: "#fff",
                background: "#e74c3c",
                border: "none",
                borderRadius: 4,
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
