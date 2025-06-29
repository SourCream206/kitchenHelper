import React, { useState, useEffect } from 'react';
import api from '../api';
import './PortionTracker.css';

export default function PortionTracker({ refreshKey }) {
  const [inventory, setInventory] = useState([]);
  const [mealSuggestions, setMealSuggestions] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [usePortionModal, setUsePortionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [portionForm, setPortionForm] = useState({
    quantity_used: '',
    meal_name: '',
    servings_made: 1,
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [mealHistory, setMealHistory] = useState([]);

  useEffect(() => {
    loadInventory();
    loadMealHistory();
  }, [refreshKey]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventory');
      setInventory(response.data);
      
      // Load meal suggestions
      const suggestionsResponse = await api.get('/what-can-i-eat');
      setMealSuggestions(suggestionsResponse.data.meal_suggestions || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMealHistory = async () => {
    try {
      const response = await api.get('/meal-history');
      setMealHistory(response.data.meals || []);
    } catch (error) {
      console.error('Error loading meal history:', error);
    }
  };

  const handleUsePortion = (item) => {
    setSelectedItem(item);
    setPortionForm({
      quantity_used: '',
      meal_name: '',
      servings_made: 1,
      notes: ''
    });
    setUsePortionModal(true);
  };

  const submitPortionUsage = async (e) => {
    e.preventDefault();
    if (!portionForm.quantity_used || !portionForm.meal_name) {
      alert('Please fill in quantity used and meal name');
      return;
    }

    try {
      await api.post('/use-portion', {
        item_id: selectedItem.id,
        quantity_used: parseFloat(portionForm.quantity_used),
        meal_name: portionForm.meal_name,
        servings_made: parseInt(portionForm.servings_made),
        notes: portionForm.notes
      });

      setUsePortionModal(false);
      setSelectedItem(null);
      loadInventory();
      loadMealHistory();
      alert('Portion usage recorded successfully!');
    } catch (error) {
      console.error('Error using portion:', error);
      alert('Failed to record portion usage. Please try again.');
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

  const calculateUsagePercentage = (item) => {
    return ((item.total_quantity - item.remaining_quantity) / item.total_quantity * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="portion-tracker-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portion-tracker-container">
      <div className="tracker-header">
        <h2>🍽️ Portion Tracker</h2>
        <p>Track your food usage and see what meals you can make with available portions</p>
      </div>

      {/* Meal Suggestions */}
      {mealSuggestions.length > 0 && (
        <div className="meal-suggestions-section">
          <h3>🎯 What Can You Make?</h3>
          <div className="meal-suggestions-grid">
            {mealSuggestions.map((suggestion, index) => (
              <div key={index} className="meal-suggestion-card">
                <h4>{suggestion.meal}</h4>
                <div className="portions-needed">
                  <strong>Portions needed:</strong>
                  <ul>
                    {suggestion.portions_needed.map((portion, pIndex) => (
                      <li key={pIndex}>
                        {portion.item}: {portion.quantity} {portion.unit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="meal-details">
                  <span className="estimated-cost">~${suggestion.estimated_cost.toFixed(2)}</span>
                  <span className="servings">{suggestion.servings} serving{suggestion.servings > 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory with Portion Tracking */}
      <div className="inventory-section">
        <h3>📦 Available Portions</h3>
        {inventory.length === 0 ? (
          <div className="empty-inventory">
            <span className="empty-icon">📭</span>
            <p>No items in inventory. Add some food items to start tracking portions!</p>
          </div>
        ) : (
          <div className="inventory-grid">
            {inventory.map((item) => {
              const expiryStatus = getExpiryStatus(item.expiry_date);
              const usagePercentage = calculateUsagePercentage(item);
              
              return (
                <div key={item.id} className={`inventory-card ${expiryStatus}`}>
                  <div className="item-header">
                    <h4>{item.name}</h4>
                    <span className={`expiry-badge ${expiryStatus}`}>
                      {expiryStatus === 'expired' && '⚠️ Expired'}
                      {expiryStatus === 'expiring-soon' && '🚨 Expiring Soon'}
                      {expiryStatus === 'expiring-week' && '⚠️ Expiring This Week'}
                      {expiryStatus === 'good' && '✅ Good'}
                      {expiryStatus === 'no-expiry' && '📅 No Expiry'}
                    </span>
                  </div>
                  
                  <div className="item-details">
                    <div className="quantity-info">
                      <span className="remaining">
                        {formatQuantity(item.remaining_quantity, item.unit)}
                      </span>
                      <span className="total">
                        of {formatQuantity(item.total_quantity, item.unit)}
                      </span>
                    </div>
                    
                    <div className="usage-bar">
                      <div 
                        className="usage-fill" 
                        style={{ width: `${usagePercentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="usage-stats">
                      <span className="usage-percentage">{usagePercentage}% used</span>
                      <span className="category">{item.category}</span>
                    </div>
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      className="use-portion-btn"
                      onClick={() => handleUsePortion(item)}
                      disabled={item.remaining_quantity <= 0}
                    >
                      🍽️ Use Portion
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Meal History */}
      <div className="meal-history-section">
        <h3>📊 Recent Meals</h3>
        {mealHistory.length === 0 ? (
          <div className="empty-history">
            <span className="empty-icon">🍽️</span>
            <p>No meals recorded yet. Start using portions to track your meals!</p>
          </div>
        ) : (
          <div className="meal-history-list">
            {mealHistory.slice(0, 5).map((meal) => (
              <div key={meal.id} className="meal-history-item">
                <div className="meal-info">
                  <h4>{meal.name}</h4>
                  <span className="meal-date">
                    {new Date(meal.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="meal-portions">
                  {meal.portions_used.map((portion, index) => (
                    <span key={index} className="portion-tag">
                      {portion.item_name}: {portion.quantity_used} {portion.unit}
                    </span>
                  ))}
                </div>
                <div className="meal-cost">
                  ${meal.total_cost.toFixed(2)} • {meal.servings_made} serving{meal.servings_made > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Use Portion Modal */}
      {usePortionModal && selectedItem && (
        <div className="modal-overlay">
          <div className="use-portion-modal">
            <div className="modal-header">
              <h3>Use Portion: {selectedItem.name}</h3>
              <button 
                className="close-modal"
                onClick={() => setUsePortionModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={submitPortionUsage} className="portion-form">
              <div className="form-group">
                <label>Quantity Used ({selectedItem.unit}):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={selectedItem.remaining_quantity}
                  value={portionForm.quantity_used}
                  onChange={(e) => setPortionForm({...portionForm, quantity_used: e.target.value})}
                  placeholder={`Max: ${selectedItem.remaining_quantity}`}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Meal Name:</label>
                <input
                  type="text"
                  value={portionForm.meal_name}
                  onChange={(e) => setPortionForm({...portionForm, meal_name: e.target.value})}
                  placeholder="e.g., Breakfast, Lunch, Dinner, Snack"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Servings Made:</label>
                <input
                  type="number"
                  min="1"
                  value={portionForm.servings_made}
                  onChange={(e) => setPortionForm({...portionForm, servings_made: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Notes (optional):</label>
                <textarea
                  value={portionForm.notes}
                  onChange={(e) => setPortionForm({...portionForm, notes: e.target.value})}
                  placeholder="Any additional notes about this meal..."
                  rows="2"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setUsePortionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  🍽️ Record Usage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 