import React, { useState } from "react";
import api from "../api";

export default function EnhancedAddItem({ onItemAdded }) {
  const [upc, setUpc] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!upc || !price || !store) {
      alert("Please fill in UPC, price, and store fields");
      return;
    }

    try {
      await api.post("/inventory", {
        upc,
        name: name || undefined,
        purchase_price: parseFloat(price),
        store,
        quantity: parseInt(quantity),
        category: category || undefined
      });
      
      // Reset form
      setUpc("");
      setName("");
      setPrice("");
      setStore("");
      setQuantity(1);
      setCategory("");
      
      onItemAdded();
      alert("Item added successfully!");
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("Failed to add item. Please try again.");
    }
  };

  return (
    <div>
      <h3 style={{ color: '#495057', marginBottom: '15px' }}>➕ Add Item Manually</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          value={upc}
          onChange={(e) => setUpc(e.target.value)}
          placeholder="UPC/Barcode (required)"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
          required
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name (optional)"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Purchase price (required)"
          min="0"
          step="0.01"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
          required
        />
        <input
          type="text"
          value={store}
          onChange={(e) => setStore(e.target.value)}
          placeholder="Store name (required)"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
          required
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          min="1"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
        />
        <button 
          type="submit"
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Item
        </button>
      </form>
    </div>
  );
}