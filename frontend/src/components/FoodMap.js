import React, { useState, useEffect } from 'react';
import api from '../api';
import './FoodMap.css';

export default function FoodMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualZipCode, setManualZipCode] = useState('');
  const [manualCity, setManualCity] = useState('');

  useEffect(() => {
    loadMap();
  }, []);

  const loadMap = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's location from backend
      const locationResponse = await api.get('/location');
      const location = locationResponse.data;
      
      if (!location.zip_code && !location.city) {
        setError('Please set your location first to see nearby food options');
        setLoading(false);
        return;
      }

      // Try to get user's current coordinates, fallback to location from backend
      let coords;
      try {
        coords = await getCurrentPosition();
      } catch (err) {
        console.log('Geolocation failed, using backend location:', err);
        // Use coordinates from backend location
        if (location.zip_code) {
          coords = await getCoordinatesFromZipCode(location.zip_code);
        } else if (location.city) {
          coords = await getCoordinatesFromCity(location.city);
        } else {
          // Fallback to Toronto coordinates
          coords = { lat: 43.6532, lng: -79.3832 };
        }
      }
      
      setUserLocation(coords);

      // Fetch nearby stores
      await fetchNearbyStores(coords);
      
    } catch (err) {
      console.error('Error loading map:', err);
      setError('Failed to load map. Please check your location settings.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Let the error propagate to be handled by loadMap
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000, // Increased timeout
          maximumAge: 600000
        }
      );
    });
  };

  const fetchNearbyStores = async (coords) => {
    try {
      // Fetch nearby stores from backend API
      const response = await api.get('/nearby-stores');
      const data = response.data;
      
      if (data.stores && data.stores.length > 0) {
        setNearbyStores(data.stores);
      } else {
        // Fallback to mock data if API doesn't return stores
        const mockStores = [
          {
            id: 1,
            name: 'Walmart Supercenter',
            address: '123 Main St',
            distance: '0.8 miles',
            rating: 4.2,
            price_level: '$$',
            types: ['grocery_store', 'supermarket'],
            position: {
              lat: coords.lat + 0.01,
              lng: coords.lng + 0.01
            },
            hours: '6:00 AM - 11:00 PM',
            phone: '(555) 123-4567'
          },
          {
            id: 2,
            name: 'Kroger',
            address: '456 Oak Ave',
            distance: '1.2 miles',
            rating: 4.5,
            price_level: '$$',
            types: ['grocery_store'],
            position: {
              lat: coords.lat - 0.008,
              lng: coords.lng + 0.015
            },
            hours: '7:00 AM - 10:00 PM',
            phone: '(555) 234-5678'
          },
          {
            id: 3,
            name: 'Aldi',
            address: '789 Pine Rd',
            distance: '1.5 miles',
            rating: 4.0,
            price_level: '$',
            types: ['grocery_store', 'discount_store'],
            position: {
              lat: coords.lat + 0.012,
              lng: coords.lng - 0.005
            },
            hours: '8:00 AM - 9:00 PM',
            phone: '(555) 345-6789'
          },
          {
            id: 4,
            name: 'Target',
            address: '321 Elm St',
            distance: '2.1 miles',
            rating: 4.3,
            price_level: '$$',
            types: ['department_store', 'grocery_store'],
            position: {
              lat: coords.lat - 0.015,
              lng: coords.lng - 0.01
            },
            hours: '8:00 AM - 10:00 PM',
            phone: '(555) 456-7890'
          },
          {
            id: 5,
            name: 'Whole Foods Market',
            address: '654 Maple Dr',
            distance: '2.8 miles',
            rating: 4.7,
            price_level: '$$$',
            types: ['grocery_store', 'organic_store'],
            position: {
              lat: coords.lat + 0.018,
              lng: coords.lng + 0.02
            },
            hours: '7:00 AM - 10:00 PM',
            phone: '(555) 567-8901'
          }
        ];
        setNearbyStores(mockStores);
      }

    } catch (error) {
      console.error('Error fetching nearby stores:', error);
      setError('Failed to load nearby stores');
    }
  };

  const getDirections = (store) => {
    if (!store || !userLocation) return;
    
    const url = `https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${store.position.lat},${store.position.lng}`;
    window.open(url, '_blank');
  };

  const getMapUrl = () => {
    if (!userLocation) return null;
    
    const lat = userLocation.lat;
    const lng = userLocation.lng;
    const zoom = 13;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.02},${lat-0.02},${lng+0.02},${lat+0.02}&layer=mapnik&marker=${lat},${lng}`;
  };

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault();
    if (!manualZipCode.trim() && !manualCity.trim()) {
      setError('Please enter either a ZIP code or city');
      return;
    }

    try {
      setLoading(true);
      
      // Save the location to backend
      await api.post('/location', {
        zip_code: manualZipCode.trim(),
        city: manualCity.trim()
      });

      // Get coordinates from the location (in a real app, you'd geocode the address)
      // For now, we'll use some default coordinates based on common locations
      let coords;
      
      if (manualZipCode.trim()) {
        // Use ZIP code to get approximate coordinates
        coords = await getCoordinatesFromZipCode(manualZipCode.trim());
      } else {
        // Use city to get approximate coordinates
        coords = await getCoordinatesFromCity(manualCity.trim());
      }

      setUserLocation(coords);
      setShowManualLocation(false);
      setError(null);
      await fetchNearbyStores(coords);
      
    } catch (error) {
      console.error('Error setting manual location:', error);
      setError('Failed to set location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCoordinatesFromZipCode = async (zipCode) => {
    // In a real app, you'd use a geocoding service
    // For now, we'll use some common ZIP codes
    const zipCoordinates = {
      'M5V 3A8': { lat: 43.6532, lng: -79.3832 }, // Toronto
      '10001': { lat: 40.7505, lng: -73.9934 }, // NYC
      '90210': { lat: 34.1030, lng: -118.4105 }, // Beverly Hills
      '60601': { lat: 41.8857, lng: -87.6228 }, // Chicago
      '77001': { lat: 29.7604, lng: -95.3698 }, // Houston
      '33101': { lat: 25.7617, lng: -80.1918 }, // Miami
      '98101': { lat: 47.6062, lng: -122.3321 }, // Seattle
    };

    if (zipCoordinates[zipCode]) {
      return zipCoordinates[zipCode];
    }

    // Default to Toronto if ZIP not found
    return { lat: 43.6532, lng: -79.3832 };
  };

  const getCoordinatesFromCity = async (city) => {
    // In a real app, you'd use a geocoding service
    // For now, we'll use some common cities
    const cityCoordinates = {
      'toronto': { lat: 43.6532, lng: -79.3832 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'houston': { lat: 29.7604, lng: -95.3698 },
      'miami': { lat: 25.7617, lng: -80.1918 },
      'seattle': { lat: 47.6062, lng: -122.3321 },
      'boston': { lat: 42.3601, lng: -71.0589 },
      'denver': { lat: 39.7392, lng: -104.9903 },
      'phoenix': { lat: 33.4484, lng: -112.0740 },
      'atlanta': { lat: 33.7490, lng: -84.3880 },
    };

    const cityLower = city.toLowerCase();
    if (cityCoordinates[cityLower]) {
      return cityCoordinates[cityLower];
    }

    // Default to Toronto if city not found
    return { lat: 43.6532, lng: -79.3832 };
  };

  const requestLocationPermission = () => {
    setError(null);
    setLoading(true);
    loadMap();
  };

  const handleLocationPermissionRequest = () => {
    // This will trigger the browser's location permission prompt
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          setError(null);
          fetchNearbyStores(coords);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Location access denied';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'Unable to get your location.';
          }
          setError(errorMessage);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 600000
        }
      );
    } else {
      setError('Your browser does not support location services. Please enter your location manually.');
    }
  };

  if (loading) {
    return (
      <div className="food-map-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  if (error && userLocation) {
    return (
      <div className="food-map-container">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          
          {!showManualLocation ? (
            <div className="error-actions">
              <button onClick={requestLocationPermission} className="retry-button">
                🔄 Try Again
              </button>
              <button 
                onClick={() => setShowManualLocation(true)} 
                className="manual-location-btn"
              >
                📍 Enter Location Manually
              </button>
            </div>
          ) : (
            <div className="manual-location-form">
              <h4>Enter Your Location</h4>
              <p>Enter ZIP code or city to see nearby stores:</p>
              <form onSubmit={handleManualLocationSubmit}>
                <div className="coordinate-inputs">
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={manualZipCode}
                    onChange={(e) => setManualZipCode(e.target.value)}
                    className="coordinate-input"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="coordinate-input"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    📍 Use This Location
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowManualLocation(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              
              <div className="location-examples">
                <p><strong>Example locations:</strong></p>
                <div className="example-locations">
                  <button 
                    onClick={() => {
                      setManualZipCode('M5V 3A8');
                      setManualCity('');
                    }}
                    className="example-btn"
                  >
                    Toronto (M5V 3A8)
                  </button>
                  <button 
                    onClick={() => {
                      setManualZipCode('10001');
                      setManualCity('');
                    }}
                    className="example-btn"
                  >
                    New York (10001)
                  </button>
                  <button 
                    onClick={() => {
                      setManualZipCode('');
                      setManualCity('Los Angeles');
                    }}
                    className="example-btn"
                  >
                    Los Angeles
                  </button>
                  <button 
                    onClick={() => {
                      setManualZipCode('60601');
                      setManualCity('');
                    }}
                    className="example-btn"
                  >
                    Chicago (60601)
                  </button>
                  <button 
                    onClick={() => {
                      setManualZipCode('90210');
                      setManualCity('');
                    }}
                    className="example-btn"
                  >
                    Beverly Hills (90210)
                  </button>
                  <button 
                    onClick={() => {
                      setManualZipCode('');
                      setManualCity('Miami');
                    }}
                    className="example-btn"
                  >
                    Miami
                  </button>
                  <button 
                    onClick={() => {
                      setManualZipCode('98101');
                      setManualCity('');
                    }}
                    className="example-btn"
                  >
                    Seattle (98101)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="food-map-container">
      <div className="map-header">
        <h2>📍 Nearby Food Options</h2>
        <p>Find grocery stores, markets, and food options near you</p>
      </div>
      
      {!userLocation ? (
        <div className="location-request">
          <div className="location-request-content">
            <span className="location-icon">📍</span>
            <h3>Enable Location Access</h3>
            <p>To show you nearby food options, we need your location. This helps us find the closest grocery stores and markets.</p>
            <div className="location-request-actions">
              <button 
                onClick={handleLocationPermissionRequest}
                className="enable-location-btn"
              >
                🌍 Enable Location Access
              </button>
              <button 
                onClick={() => setShowManualLocation(true)}
                className="manual-location-btn"
              >
                📍 Enter Location Manually
              </button>
            </div>
            
            {showManualLocation && (
              <div className="manual-location-form">
                <h4>Enter Your Location</h4>
                <p>Enter ZIP code or city to see nearby stores:</p>
                <form onSubmit={handleManualLocationSubmit}>
                  <div className="coordinate-inputs">
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={manualZipCode}
                      onChange={(e) => setManualZipCode(e.target.value)}
                      className="coordinate-input"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      className="coordinate-input"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      📍 Use This Location
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowManualLocation(false)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                
                <div className="location-examples">
                  <p><strong>Example locations:</strong></p>
                  <div className="example-locations">
                    <button 
                      onClick={() => {
                        setManualZipCode('M5V 3A8');
                        setManualCity('');
                      }}
                      className="example-btn"
                    >
                      Toronto (M5V 3A8)
                    </button>
                    <button 
                      onClick={() => {
                        setManualZipCode('10001');
                        setManualCity('');
                      }}
                      className="example-btn"
                    >
                      New York (10001)
                    </button>
                    <button 
                      onClick={() => {
                        setManualZipCode('');
                        setManualCity('Los Angeles');
                      }}
                      className="example-btn"
                    >
                      Los Angeles
                    </button>
                    <button 
                      onClick={() => {
                        setManualZipCode('60601');
                        setManualCity('');
                      }}
                      className="example-btn"
                    >
                      Chicago (60601)
                    </button>
                    <button 
                      onClick={() => {
                        setManualZipCode('90210');
                        setManualCity('');
                      }}
                      className="example-btn"
                    >
                      Beverly Hills (90210)
                    </button>
                    <button 
                      onClick={() => {
                        setManualZipCode('');
                        setManualCity('Miami');
                      }}
                      className="example-btn"
                    >
                      Miami
                    </button>
                    <button 
                      onClick={() => {
                        setManualZipCode('98101');
                        setManualCity('');
                      }}
                      className="example-btn"
                    >
                      Seattle (98101)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="map-content">
            <div className="map-section">
              <div className="map-canvas">
                {getMapUrl() ? (
                  <iframe
                    src={getMapUrl()}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    title="Nearby Food Options Map"
                  />
                ) : (
                  <div className="map-placeholder">
                    <span className="map-icon">🗺️</span>
                    <p>Map loading...</p>
                  </div>
                )}
              </div>
              
              <div className="map-legend">
                <div className="legend-item">
                  <span className="legend-marker user-marker">📍</span>
                  <span>Your Location</span>
                </div>
                <div className="legend-item">
                  <span className="legend-marker store-marker">🏪</span>
                  <span>Grocery Stores</span>
                </div>
              </div>
            </div>
            
            <div className="stores-sidebar">
              <h3>Nearby Stores</h3>
              <div className="stores-list">
                {nearbyStores.map(store => (
                  <div 
                    key={store.id} 
                    className={`store-item ${selectedStore?.id === store.id ? 'selected' : ''}`}
                    onClick={() => setSelectedStore(store)}
                  >
                    <div className="store-info">
                      <h4>{store.name}</h4>
                      <p className="store-address">{store.address}</p>
                      <div className="store-details">
                        <span className="distance">{store.distance}</span>
                        <span className="rating">⭐ {store.rating}</span>
                        <span className="price-level">{store.price_level}</span>
                      </div>
                    </div>
                    <button 
                      className="directions-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        getDirections(store);
                      }}
                    >
                      🚗 Directions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedStore && (
            <div className="store-modal">
              <div className="store-modal-content">
                <div className="store-modal-header">
                  <h3>{selectedStore.name}</h3>
                  <button 
                    className="close-modal"
                    onClick={() => setSelectedStore(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="store-modal-body">
                  <p><strong>Address:</strong> {selectedStore.address}</p>
                  <p><strong>Distance:</strong> {selectedStore.distance}</p>
                  <p><strong>Rating:</strong> ⭐ {selectedStore.rating}</p>
                  <p><strong>Price Level:</strong> {selectedStore.price_level}</p>
                  {selectedStore.hours && (
                    <p><strong>Hours:</strong> {selectedStore.hours}</p>
                  )}
                  {selectedStore.phone && (
                    <p><strong>Phone:</strong> {selectedStore.phone}</p>
                  )}
                  <div className="store-actions">
                    <button 
                      className="primary-btn"
                      onClick={() => getDirections(selectedStore)}
                    >
                      🚗 Get Directions
                    </button>
                    {selectedStore.phone && (
                      <button 
                        className="secondary-btn"
                        onClick={() => window.open(`tel:${selectedStore.phone}`, '_self')}
                      >
                        📞 Call Store
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 