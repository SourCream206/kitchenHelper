// LocationSetter.js
import React, { useState, useEffect } from "react";
import api from "../api";

export function LocationSetter({ onLocationSet }) {
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [currentLocation, setCurrentLocation] = useState({});

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      const resp = await api.get("/location");
      setCurrentLocation(resp.data);
      setZipCode(resp.data.zip_code || "");
      setCity(resp.data.city || "");
    } catch (e) {
      console.error("Failed to fetch location:", e);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/location", { zip_code: zipCode, city });
      onLocationSet();
      fetchLocation();
    } catch (e) {
      console.error("Failed to set location:", e);
    }
  };

  return (
    <div>
      <h3 style={{ color: '#495057', marginBottom: '15px' }}>📍 Your Location</h3>
      {currentLocation.city && (
        <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '10px' }}>
          Current: {currentLocation.city}, {currentLocation.zip_code}
        </p>
      )}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City (e.g., Toronto)"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
        />
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="ZIP/Postal Code (e.g., M5V 3A8)"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
        />
        <button 
          type="submit" 
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Update Location
        </button>
      </form>
    </div>
  );
}
