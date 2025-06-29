import React, { useState, useEffect } from "react";
import api from "../api";

export default function SpendingAnalysis({ refreshKey }) {
  const [budgetData, setBudgetData] = useState({});
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBudgetData();
  }, [refreshKey]);

  const fetchBudgetData = async () => {
    try {
      const resp = await api.get("/budget");
      setBudgetData(resp.data);
    } catch (e) {
      console.error("Failed to fetch budget data:", e);
    }
  };

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const resp = await api.get("/spending-analysis");
      setAnalysis(resp.data.analysis);
    } catch (e) {
      console.error("Failed to fetch analysis:", e);
      setAnalysis("Failed to load spending analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!budgetData.monthly_budget) return 0;
    return Math.min((budgetData.spent_this_month / budgetData.monthly_budget) * 100, 100);
  };

  const getBudgetStatus = () => {
    const percentage = getProgressPercentage();
    if (percentage > 90) return { color: '#dc3545', status: 'Over Budget!' };
    if (percentage > 75) return { color: '#ffc107', status: 'Close to Limit' };
    return { color: '#28a745', status: 'On Track' };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="card">
      <h2 className="card-title">💰 Budget Analysis</h2>
      <div className="card-content">
        {budgetData.monthly_budget ? (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px',
              border: `2px solid ${budgetStatus.color}`
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: budgetStatus.color }}>
                {budgetStatus.status}
              </h4>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Monthly Budget:</strong> ${budgetData.monthly_budget?.toFixed(2)}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Spent This Month:</strong> ${budgetData.spent_this_month?.toFixed(2)}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Remaining:</strong> ${budgetData.remaining_budget?.toFixed(2)}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Daily Average:</strong> ${budgetData.cost_per_day?.toFixed(2)}
              </div>
              
              {/* Progress Bar */}
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${getProgressPercentage()}%`,
                  height: '100%',
                  backgroundColor: budgetStatus.color,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <small style={{ color: '#6c757d' }}>
                {getProgressPercentage().toFixed(1)}% of budget used
              </small>
            </div>

            <button 
              onClick={fetchAnalysis}
              disabled={loading}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '15px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Analyzing...' : '🤖 Get AI Analysis'}
            </button>

            {analysis && (
              <div style={{ 
                marginTop: '15px',
                padding: '15px',
                background: '#e8f4fd',
                borderRadius: '8px',
                border: '1px solid #bee5eb'
              }}>
                <h4 style={{ color: '#0c5460', marginBottom: '10px' }}>AI Insights:</h4>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontSize: '0.9rem',
                  color: '#495057',
                  margin: 0
                }}>
                  {analysis}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: '#6c757d' }}>Set a monthly budget to see spending analysis.</p>
        )}
      </div>
    </div>
  );
}