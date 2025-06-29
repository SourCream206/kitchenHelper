import React, { useState, useEffect } from "react";
import api from "../api";

// Typing effect component
const TypingText = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: '#495057' }}>
      {displayedText}
      {currentIndex < text.length && <span className="typing-cursor">|</span>}
    </div>
  );
};

// Meal plan formatter
const formatMealPlan = (planData) => {
  try {
    console.log("Raw meal plan data:", planData);
    
    // If it's already a nicely formatted string, return it as-is
    if (typeof planData === 'string') {
      // Check if it looks like a formatted meal plan (contains "DAY" or meal names)
      if (planData.includes('DAY') || planData.includes('Breakfast') || planData.includes('Lunch') || planData.includes('Dinner')) {
        return planData;
      }
      
      // Try to extract JSON if it's embedded in text
      const jsonMatch = planData.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[0]);
          return formatStandardMealPlan(data);
        } catch (e) {
          // If JSON parsing fails, return the original text
          return planData;
        }
      }
      
      // If it's just plain text, return it
      return planData;
    }
    
    // If it's an object, try to format it
    if (typeof planData === 'object') {
      if (planData.days && Array.isArray(planData.days)) {
        return formatStandardMealPlan(planData);
      } else if (planData.meal_plan) {
        return formatMealPlan(planData.meal_plan);
      } else {
        return formatGenericMealPlan(planData);
      }
    }
    
    // Fallback
    return `🤖 AI Generated Meal Plan\n\n${String(planData)}`;
    
  } catch (error) {
    console.error("Error formatting meal plan:", error);
    console.error("Raw data that caused error:", planData);
    
    // Return a fallback format
    if (typeof planData === 'string') {
      return `🤖 AI Generated Meal Plan\n\n${planData}`;
    } else {
      return `🤖 AI Generated Meal Plan\n\n${JSON.stringify(planData, null, 2)}`;
    }
  }
};

const formatStandardMealPlan = (data) => {
  let formattedPlan = "";
  
  data.days.forEach((day, dayIndex) => {
    formattedPlan += `📅 Day ${day.day}\n`;
    formattedPlan += "=".repeat(20) + "\n\n";
    
    if (day.meals && Array.isArray(day.meals)) {
      day.meals.forEach((meal, mealIndex) => {
        formattedPlan += `🍽️ ${meal.name}\n`;
        if (meal.estimated_cost !== undefined) {
          formattedPlan += `💰 Estimated Cost: $${meal.estimated_cost?.toFixed(2) || 'N/A'}\n`;
        }
        if (meal.servings !== undefined) {
          formattedPlan += `👥 Servings: ${meal.servings}\n`;
        }
        formattedPlan += "\n";
        
        if (meal.ingredients && Array.isArray(meal.ingredients)) {
          formattedPlan += "📋 Ingredients:\n";
          meal.ingredients.forEach((ingredient, ingIndex) => {
            const quantity = ingredient.quantity || 1;
            const unit = ingredient.unit || 'piece';
            formattedPlan += `  • ${ingredient.item}: ${quantity} ${unit}\n`;
          });
        }
        
        if (meal.instructions) {
          formattedPlan += `\n👨‍🍳 Instructions:\n${meal.instructions}\n`;
        }
        
        formattedPlan += "\n" + "-".repeat(30) + "\n\n";
      });
    }
  });
  
  return formattedPlan;
};

const formatGenericMealPlan = (data) => {
  let formattedPlan = "🤖 AI Generated Meal Plan\n\n";
  
  // Try to extract any useful information
  if (data.meals) {
    data.meals.forEach((meal, index) => {
      formattedPlan += `🍽️ ${meal.name || `Meal ${index + 1}`}\n`;
      if (meal.ingredients) {
        formattedPlan += "📋 Ingredients:\n";
        meal.ingredients.forEach(ing => {
          formattedPlan += `  • ${ing.item || ing.name || 'Unknown'}\n`;
        });
      }
      formattedPlan += "\n";
    });
  } else {
    // Just stringify the data
    formattedPlan += JSON.stringify(data, null, 2);
  }
  
  return formattedPlan;
};

export default function MealPlan() {
  const [days, setDays] = useState(7);
  const [members, setMembers] = useState(1);
  const [plan, setPlan] = useState("");
  const [formattedPlan, setFormattedPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const fetchPlan = async () => {
    setIsLoading(true);
    setPlan("");
    setFormattedPlan("");
    setIsTyping(false);
    
    try {
      const resp = await api.post("/mealplan", { days, members });
      console.log("Full API response:", resp.data);
      
      // Handle different response structures
      let rawPlan;
      if (resp.data.meal_plan) {
        rawPlan = resp.data.meal_plan;
      } else if (resp.data) {
        rawPlan = resp.data;
      } else {
        throw new Error("No meal plan data received");
      }
      
      setPlan(rawPlan);
      
      // Format the plan
      const formatted = formatMealPlan(rawPlan);
      setFormattedPlan(formatted);
      setIsTyping(true);
    } catch (e) {
      console.error("Failed to fetch meal plan:", e);
      console.error("Error details:", e.response?.data || e.message);
      alert("Failed to generate meal plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">🍽️ AI Meal Planner</h2>
      <div className="card-content">
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Get personalized meal plans based on your inventory and preferences.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Number of Days
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(+e.target.value)}
                min="1"
                max="14"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Household Members
              </label>
              <input
                type="number"
                value={members}
                onChange={(e) => setMembers(+e.target.value)}
                min="1"
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
          
          <button 
            onClick={fetchPlan} 
            className="save-btn"
            disabled={isLoading}
            style={{ alignSelf: 'flex-start' }}
          >
            {isLoading ? "Generating..." : "Generate Meal Plan"}
          </button>
        </div>
        
        {formattedPlan && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)', 
            borderRadius: '12px', 
            border: '1px solid #dee2e6',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              marginBottom: '1rem', 
              color: '#3cb371', 
              fontSize: '1.3rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🤖 Your AI-Generated Meal Plan
            </h3>
            <div style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              border: '1px solid #e9ecef',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: '#374151'
            }}>
              {isTyping ? (
                <TypingText text={formattedPlan} speed={20} />
              ) : (
                <div style={{ 
                  whiteSpace: 'pre-line', 
                  lineHeight: '1.6', 
                  color: '#374151',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  {formattedPlan}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
