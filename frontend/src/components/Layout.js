import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Layout({ children }) {
  return (
    <div className="layout-root">
      <nav className="navbar modern-navbar">
        <div className="navbar-logo">
          <span className="leaf" role="img" aria-label="leaf">🌱</span>
          PantryPilot
        </div>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/inventory">Inventory</Link>
          <Link to="/portion-tracker">Portion Tracker</Link>
          <Link to="/budget">Budget</Link>
          <Link to="/mealplan">Meal Plan</Link>
          <Link to="/map">Map</Link>
          <Link to="/tips">Tips</Link>
          <Link to="/whatcanieat">What Can I Eat?</Link>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
} 