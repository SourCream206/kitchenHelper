import React, { useState, useEffect } from "react";
import api from "../api";

export default function LocationSetter({ onLocationSet }) {
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  // Load existing location on mount
  useEffect(() => {
    loadExistingLocation();
  }, []);

  const loadExistingLocation = async () => {
    try {
      const resp = await api.get("/location");
      if (resp.data.zip_code && resp.data.city) {
        setZipCode(resp.data.zip_code);
        setCity(resp.data.city);
        setLocationStatus("Location set");
      } else {
        setLocationStatus("Set your location for local deals");
      }
    } catch (e) {
      console.error("Failed to fetch location:", e);
      setLocationStatus("Set your location for local deals");
    }
  };

  const autoDetectLocation = async () => {
    setIsLoading(true);
    setLocationStatus("Detecting location...");

    try {
      // Try browser geolocation first
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Use a more reliable geocoding service
      const locationData = await reverseGeocode(latitude, longitude);
      
      if (locationData && locationData.postal_code) {
        setZipCode(locationData.postal_code);
        setCity(locationData.city);
        await saveLocation(locationData.postal_code, locationData.city);
        setLocationStatus("Location detected automatically! ✅");
      } else {
        throw new Error("Could not get address from coordinates");
      }
    } catch (error) {
      console.error("Auto-detection failed:", error);
      setLocationStatus("Auto-detection failed. Please enter manually.");
      setIsExpanded(true); // Expand the form for manual entry
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: false, // Less accurate but faster
          timeout: 5000, // Shorter timeout
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Try multiple geocoding services for better reliability
      const services = [
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=10`,
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      ];

      for (const service of services) {
        try {
          const response = await fetch(service, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'SmartPantry/1.0'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (service.includes('nominatim')) {
              // OpenStreetMap response
              if (data.address) {
                const address = data.address;
                return {
                  postal_code: address.postcode || "",
                  city: address.city || address.town || address.village || ""
                };
              }
            } else {
              // BigDataCloud response
              if (data.postcode && data.city) {
                return {
                  postal_code: data.postcode,
                  city: data.city
                };
              }
            }
          }
        } catch (e) {
          console.log(`Service failed: ${service}`, e);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error("All geocoding services failed:", error);
      return null;
    }
  };

  const saveLocation = async (zip, cityName) => {
    try {
      await api.post("/location", { zip_code: zip, city: cityName });
      setLocationStatus("Location saved! ✅");
      onLocationSet();
    } catch (e) {
      console.error("Failed to save location:", e);
      setLocationStatus("Failed to save location");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!zipCode.trim() || !city.trim()) {
      setLocationStatus("Please enter both ZIP code and city");
      return;
    }
    await saveLocation(zipCode.trim(), city.trim());
  };

  const handleQuickSet = (zip, cityName) => {
    setZipCode(zip);
    setCity(cityName);
    saveLocation(zip, cityName);
  };

  // Common locations for quick selection
  const quickLocations = [
    { zip: "M5V 3A8", city: "Toronto, ON" },
    { zip: "10001", city: "New York, NY" },
    { zip: "90210", city: "Beverly Hills, CA" },
    { zip: "60601", city: "Chicago, IL" },
    { zip: "77001", city: "Houston, TX" },
    { zip: "33101", city: "Miami, FL" },
    { zip: "98101", city: "Seattle, WA" }
  ];

  return (
    <div className="card">
      <h2 className="card-title">Location Settings</h2>
      <div className="card-content">
        <div className="location-setter">
          <div className="location-header" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="location-info">
              <span className="location-icon">📍</span>
              <div className="location-details">
                <div className="location-status">{locationStatus}</div>
                {zipCode && city && (
                  <div className="location-display">{zipCode} • {city}</div>
                )}
              </div>
            </div>
            <button 
              className="expand-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>

          {isExpanded && (
            <div className="location-expanded">
              {/* Quick location buttons */}
              <div className="quick-locations">
                <div className="quick-locations-label">Quick Set:</div>
                <div className="quick-locations-grid">
                  {quickLocations.map((loc, index) => (
                    <button
                      key={index}
                      className="quick-location-btn"
                      onClick={() => handleQuickSet(loc.zip, loc.city)}
                      disabled={isLoading}
                    >
                      {loc.city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="location-divider">or</div>

              {/* Auto-detect button */}
              <button
                className="auto-detect-btn"
                onClick={autoDetectLocation}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Detecting...' : '📍 Auto-Detect My Location'}
              </button>

              <div className="location-divider">or</div>

              {/* Manual entry form */}
              <form onSubmit={handleSubmit} className="location-form">
                <div className="form-row">
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="ZIP Code"
                    className="location-input"
                    maxLength="10"
                  />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City, State"
                    className="location-input"
                  />
                </div>
                <button type="submit" className="save-location-btn">
                  Save Location
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}