import React, { useState, useEffect } from "react";
import api from "../api";
import FullScreenBarcodeScanner from "./FullScreenBarcodeScanner";

export default function Inventory({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [productInfo, setProductInfo] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    quantity: 1,
    unit: "pieces",
    store: "",
    category: "food"
  });

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

  const removeOne = async (itemId) => {
    try {
      await api.delete(`/inventory/${itemId}`);
      fetchInventory();
    } catch (e) {
      console.error("Failed to remove item:", e);
    }
  };

  const handleBarcodeDetected = async (barcode) => {
    setBarcodeScannerOpen(false);
    setScannedBarcode(barcode);
    
    // Fetch real product info from the backend API
    try {
      const response = await api.get(`/product/${barcode}`);
      const productInfo = response.data;
      
      setProductInfo(productInfo);
      setProductForm({
        name: productInfo.name,
        price: "",
        quantity: 1,
        unit: "pieces",
        store: "",
        category: productInfo.category || "food"
      });
      setProductModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch product info:", error);
      // Fallback with basic info
      setProductInfo({ 
        name: `Product (UPC: ${barcode})`, 
        category: "food",
        upc: barcode 
      });
      setProductForm({
        name: `Product (UPC: ${barcode})`,
        price: "",
        quantity: 1,
        unit: "pieces",
        store: "",
        category: "food"
      });
      setProductModalOpen(true);
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.store) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const itemData = {
        name: productForm.name,
        category: productForm.category,
        quantity: parseFloat(productForm.quantity),
        unit: productForm.unit,
        purchase_price: parseFloat(productForm.price),
        store: productForm.store
      };

      await api.post("/inventory", itemData);
      fetchInventory();
      setProductModalOpen(false);
      setProductInfo(null);
      setProductForm({ name: "", price: "", quantity: 1, unit: "pieces", store: "", category: "food" });
      alert("Item added successfully!");
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("Failed to add item. Please try again.");
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return 'no-expiry';
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'expiring-soon';
    if (daysUntilExpiry <= 7) return 'expiring-week';
    return 'good';
  };

  const formatQuantity = (quantity, unit) => {
    return `${quantity} ${unit}`;
  };

  return (
    <>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <button className="save-btn" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', padding: '0.8rem 2rem' }} onClick={() => setBarcodeScannerOpen(true)}>
          <span role="img" aria-label="barcode" style={{ fontSize: '1.5rem' }}>📷</span>
          Scan Barcode (Fullscreen)
        </button>
        <span style={{ color: '#666', fontSize: '0.98rem' }}>Quickly add items by scanning their barcode</span>
      </div>
      
      <FullScreenBarcodeScanner
        isOpen={barcodeScannerOpen}
        onClose={() => setBarcodeScannerOpen(false)}
        onDetected={handleBarcodeDetected}
      />

      {/* Product Info Modal */}
      {productModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 className="card-title">Add Product to Inventory</h2>
            <div className="card-content">
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                Detected barcode: <strong>{scannedBarcode}</strong>
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
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
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
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
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={productForm.quantity}
                      onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Unit *
                    </label>
                    <select
                      value={productForm.unit}
                      onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="grams">Grams (g)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="pieces">Pieces</option>
                      <option value="slices">Slices</option>
                      <option value="cups">Cups</option>
                      <option value="tbsp">Tablespoons (tbsp)</option>
                      <option value="tsp">Teaspoons (tsp)</option>
                      <option value="oz">Ounces (oz)</option>
                      <option value="lbs">Pounds (lbs)</option>
                    </select>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Category
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="dairy">Dairy</option>
                      <option value="meat">Meat</option>
                      <option value="produce">Produce</option>
                      <option value="pantry">Pantry</option>
                      <option value="frozen">Frozen</option>
                      <option value="bread">Bread</option>
                      <option value="eggs">Eggs</option>
                      <option value="food">Other Food</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Store *
                  </label>
                  <input
                    type="text"
                    value={productForm.store}
                    onChange={(e) => setProductForm({...productForm, store: e.target.value})}
                    placeholder="e.g. Walmart, Kroger"
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
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  className="save-btn"
                  onClick={handleAddProduct}
                >
                  Add to Inventory
                </button>
                <button 
                  onClick={() => {
                    setProductModalOpen(false);
                    setProductInfo(null);
                    setProductForm({ name: "", price: "", quantity: 1, unit: "pieces", store: "", category: "food" });
                  }}
                  style={{
                    padding: '0.7rem 1.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Your Inventory</h2>
        <div className="card-content">
          {items.length === 0 && <p>No items in pantry yet. Scan a barcode to get started!</p>}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {items.map((item) => {
              const expiryStatus = getExpiryStatus(item.expiry_date);
              return (
                <div key={item.id} style={{
                  padding: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  background: expiryStatus === 'expired' ? '#fff5f5' : 
                             expiryStatus === 'expiring-soon' ? '#fff8e1' : '#fff',
                  borderLeft: expiryStatus === 'expired' ? '4px solid #f44336' :
                              expiryStatus === 'expiring-soon' ? '4px solid #ff9800' :
                              expiryStatus === 'expiring-week' ? '4px solid #ffc107' : '4px solid #4CAF50'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2E7D32' }}>{item.name}</h4>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                        {formatQuantity(item.remaining_quantity, item.unit)} remaining
                        {item.total_quantity !== item.remaining_quantity && (
                          <span style={{ color: '#999' }}> of {formatQuantity(item.total_quantity, item.unit)}</span>
                        )}
                      </p>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                        Category: {item.category} • Store: {item.store}
                      </p>
                      {item.expiry_date && (
                        <p style={{ margin: '0', fontSize: '0.9rem', color: expiryStatus === 'expired' ? '#f44336' : expiryStatus === 'expiring-soon' ? '#ff9800' : '#666' }}>
                          Expires: {new Date(item.expiry_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeOne(item.id)}
                      style={{
                        color: "#fff",
                        background: "#e74c3c",
                        border: "none",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
