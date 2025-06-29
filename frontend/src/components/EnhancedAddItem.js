import React, { useState } from "react";
import api from "../api";

export default function EnhancedAddItem({ onItemAdded }) {
  const [upc, setUpc] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!upc.trim()) {
      newErrors.upc = "UPC/Barcode is required";
    }
    
    if (!price || parseFloat(price) <= 0) {
      newErrors.price = "Please enter a valid price greater than 0";
    }
    
    if (!store.trim()) {
      newErrors.store = "Store name is required";
    }
    
    if (!quantity || quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Sending item data:", {
        upc: upc.trim(),
        name: name.trim() || undefined,
        purchase_price: parseFloat(price),
        store: store.trim(),
        quantity: parseInt(quantity),
        category: category.trim() || undefined
      });
      
      const response = await api.post("/inventory", {
        upc: upc.trim(),
        name: name.trim() || undefined,
        purchase_price: parseFloat(price),
        store: store.trim(),
        quantity: parseInt(quantity),
        category: category.trim() || undefined
      });
      
      console.log("Response received:", response.data);
      
      // Reset form
      setUpc("");
      setName("");
      setPrice("");
      setStore("");
      setQuantity(1);
      setCategory("");
      setErrors({});
      
      onItemAdded();
      alert("Item added successfully!");
    } catch (error) {
      console.error("Failed to add item:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Provide more specific error messages
      let errorMessage = "Failed to add item. Please try again.";
      if (error.response?.status === 422) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else if (error.response?.status === 400) {
        errorMessage = "Bad request. Please check your inputs.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 style={{ color: '#495057', marginBottom: '15px' }}>➕ Add Item Manually</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <input
            type="text"
            value={upc}
            onChange={(e) => setUpc(e.target.value)}
            placeholder="UPC/Barcode (required)"
            style={{ 
              width: '100%',
              padding: '8px', 
              borderRadius: '4px', 
              border: errors.upc ? '1px solid #dc3545' : '1px solid #ced4da' 
            }}
            required
          />
          {errors.upc && (
            <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
              {errors.upc}
            </div>
          )}
        </div>
        
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name (optional)"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
        />
        
        <div>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Purchase price (required)"
            min="0.01"
            step="0.01"
            style={{ 
              width: '100%',
              padding: '8px', 
              borderRadius: '4px', 
              border: errors.price ? '1px solid #dc3545' : '1px solid #ced4da' 
            }}
            required
          />
          {errors.price && (
            <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
              {errors.price}
            </div>
          )}
        </div>
        
        <div>
          <input
            type="text"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="Store name (required)"
            style={{ 
              width: '100%',
              padding: '8px', 
              borderRadius: '4px', 
              border: errors.store ? '1px solid #dc3545' : '1px solid #ced4da' 
            }}
            required
          />
          {errors.store && (
            <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
              {errors.store}
            </div>
          )}
        </div>
        
        <div>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
            min="1"
            style={{ 
              width: '100%',
              padding: '8px', 
              borderRadius: '4px', 
              border: errors.quantity ? '1px solid #dc3545' : '1px solid #ced4da' 
            }}
          />
          {errors.quantity && (
            <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
              {errors.quantity}
            </div>
          )}
        </div>
        
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
        />
        
        <button 
          type="submit"
          disabled={isSubmitting}
          style={{
            background: isSubmitting ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? 'Adding...' : 'Add Item'}
        </button>
      </form>
    </div>
  );
}