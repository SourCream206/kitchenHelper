import React, { useState } from "react";
import api from "../api";

export default function WasteTips() {
  const [tips, setTips] = useState("");

  const fetchTips = async () => {
    try {
      const resp = await api.get("/tips");
      setTips(resp.data.tips);
    } catch (e) {
      console.error("Failed to fetch tips:", e);
    }
  };

  return (
    <div>
      <h2>Waste Reduction Tips</h2>
      <button onClick={fetchTips}>Get Tips</button>
      {tips && (
        <pre style={{ background: "#f4f4f4", padding: 12, marginTop: 8 }}>
          {tips}
        </pre>
      )}
    </div>
  );
}
