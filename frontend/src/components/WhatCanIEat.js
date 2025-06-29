import React, { useState } from "react";
import api from "../api";

export default function WhatCanIEat() {
  const [options, setOptions] = useState("");

  const fetchOptions = async () => {
    try {
      const resp = await api.get("/whatcanieat");
      setOptions(resp.data.options);
    } catch (e) {
      console.error("Failed to fetch options:", e);
    }
  };

  return (
    <div>
      <h2>What Can I Eat?</h2>
      <button onClick={fetchOptions}>Show Options</button>
      {options && (
        <pre style={{ background: "#f4f4f4", padding: 12, marginTop: 8 }}>
          {options}
        </pre>
      )}
    </div>
  );
}
