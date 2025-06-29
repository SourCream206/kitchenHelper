import React, { useState, useEffect } from "react";
import api from "../api";

export default function ScanResultModal({ isOpen, upc, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [foundInstantly, setFoundInstantly] = useState(false);

  // Fetch product info when modal opens with a UPC
  useEffect(() => {
    if (isOpen && upc) {
      fetchProductInfo();
    }
  }, [isOpen, upc]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setPrice("");
      setStore("");
      setQuantity(1);
      setCategory("");
      setErrors({});
      setProductInfo(null);
      setFoundInstantly(false);
    }
  }, [isOpen]);

  const fetchProductInfo = async () => {
    if (!upc) return;
    
    setLoading(true);
    setProductInfo(null); // Clear previous product info
    
    try {
      console.log(`Fetching product info for UPC: ${upc}`);
      
      // Add timeout to the API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000) // Reduced timeout to 5 seconds
      );
      
      const apiPromise = api.get(`/product/${upc}`);
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      if (response.data.found) {
        console.log("Product found:", response.data);
        setProductInfo(response.data);
        
        // Auto-populate form fields
        setName(response.data.name || "");
        setCategory(response.data.category || "");
        
        // Show success message
        console.log(`✅ Auto-populated: ${response.data.name}`);
        setFoundInstantly(true);
      } else {
        console.log("Product not found in database");
        setProductInfo({ 
          found: false,
          error: "Product not found in database",
          name: `Product (UPC: ${upc})`,
          category: "food",
          upc: upc
        });
      }
    } catch (error) {
      console.error("Error fetching product info:", error);
      const errorMessage = error.message === 'Request timeout' 
        ? "Request timed out. Please try again."
        : "Failed to fetch product information. Please check your internet connection.";
      
      setProductInfo({ 
        found: false,
        error: errorMessage,
        name: `Product (UPC: ${upc})`,
        category: "food",
        upc: upc
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!price || parseFloat(price) <= 0) {
      newErrors.price = "Please enter a valid price greater than 0";
    }
    
    if (!store.trim()) {
      newErrors.store = "Please enter a store name";
    }
    
    if (!quantity || quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Ensure correct data types
    const itemData = {
      upc: upc,
      name: name.trim() || undefined,
      purchase_price: parseFloat(price), // Ensure it's a float
      store: store.trim(),
      quantity: parseInt(quantity), // Ensure it's an integer
      category: category.trim() || undefined
    };

    console.log("Sending item data with types:", {
      ...itemData,
      purchase_price_type: typeof itemData.purchase_price,
      quantity_type: typeof itemData.quantity
    });

    onSave(itemData);
  };

  const handleCancel = () => {
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ 
          color: '#495057', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          📦 Add Scanned Item
        </h3>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <strong>UPC/Barcode:</strong> {upc}
          {loading && (
            <div style={{ 
              marginTop: '10px', 
              color: '#6c757d', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #dee2e6',
                borderTop: '2px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              {foundInstantly ? 'Product found instantly!' : 'Looking up product information...'}
            </div>
          )}
          {productInfo && productInfo.found && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: '#d4edda', 
              border: '1px solid #c3e6cb', 
              borderRadius: '6px',
              color: '#155724'
            }}>
              ✅ Found: {productInfo.name}
              {productInfo.brand && <div style={{ fontSize: '12px', marginTop: '4px' }}>Brand: {productInfo.brand}</div>}
              
              {/* Show nutritional information if available */}
              {productInfo.nutrition && Object.keys(productInfo.nutrition).length > 0 && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #c3e6cb' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Nutrition (per serving):</div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                    gap: '5px',
                    fontSize: '11px'
                  }}>
                    {Object.entries(productInfo.nutrition).slice(0, 6).map(([key, value]) => (
                      <div key={key} style={{ 
                        background: 'rgba(255,255,255,0.7)', 
                        padding: '3px 6px', 
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{key}</div>
                        <div>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {productInfo && productInfo.error && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: '#f8d7da', 
              border: '1px solid #f5c6cb', 
              borderRadius: '6px',
              color: '#721c24'
            }}>
              ⚠️ {productInfo.error}
              <button
                onClick={fetchProductInfo}
                disabled={loading}
                style={{
                  marginLeft: '10px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
              Product Name {productInfo && productInfo.found && <span style={{ color: '#28a745', fontSize: '12px' }}>(Auto-filled)</span>}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              style={{ 
                width: '100%',
                padding: '10px', 
                borderRadius: '6px', 
                border: productInfo && productInfo.found ? '2px solid #28a745' : '1px solid #ced4da',
                fontSize: '14px',
                background: productInfo && productInfo.found ? '#f8fff9' : 'white'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
              Purchase Price *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
              style={{ 
                width: '100%',
                padding: '10px', 
                borderRadius: '6px', 
                border: errors.price ? '1px solid #dc3545' : '1px solid #ced4da',
                fontSize: '14px'
              }}
            />
            {errors.price && (
              <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                {errors.price}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
              Store Name *
            </label>
            <input
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Enter store name"
              required
              style={{ 
                width: '100%',
                padding: '10px', 
                borderRadius: '6px', 
                border: errors.store ? '1px solid #dc3545' : '1px solid #ced4da',
                fontSize: '14px'
              }}
            />
            {errors.store && (
              <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                {errors.store}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              style={{ 
                width: '100%',
                padding: '10px', 
                borderRadius: '6px', 
                border: errors.quantity ? '1px solid #dc3545' : '1px solid #ced4da',
                fontSize: '14px'
              }}
            />
            {errors.quantity && (
              <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                {errors.quantity}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057' }}>
              Category {productInfo && productInfo.found && <span style={{ color: '#28a745', fontSize: '12px' }}>(Auto-filled)</span>}
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Dairy, Produce, Pantry"
              style={{ 
                width: '100%',
                padding: '10px', 
                borderRadius: '6px', 
                border: productInfo && productInfo.found ? '2px solid #28a745' : '1px solid #ced4da',
                fontSize: '14px',
                background: productInfo && productInfo.found ? '#f8fff9' : 'white'
              }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '20px'
          }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                flex: 1,
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Add to Pantry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 