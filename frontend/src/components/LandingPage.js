import React from "react";
import "../App.css";

const features = [
  {
    title: "Smart Food Budgeting",
    desc: "Track your food spending, inventory value, and cost-per-meal in real time.",
    icon: <div className="feature-icon budget-icon" />,
  },
  {
    title: "Barcode Pantry Management",
    desc: "Scan groceries to auto-add to your pantry with expiry and nutrition info.",
    icon: <div className="feature-icon scan-icon" />,
  },
  {
    title: "AI Meal Planning",
    desc: "Get meal plans that maximize nutrition, minimize waste, and fit your budget.",
    icon: <div className="feature-icon meal-icon" />,
  },
  {
    title: "Interactive Food Map",
    desc: "Find nearby grocery stores, compare prices, and get directions to the best deals.",
    icon: <div className="feature-icon map-icon" />,
  },
  {
    title: "Waste Reduction Tips",
    desc: "AI-powered tips to reuse, preserve, and save more food.",
    icon: <div className="feature-icon tips-icon" />,
  },
  {
    title: "Location-Aware Price Optimization",
    desc: "Find cheaper local alternatives and smart substitutions.",
    icon: <div className="feature-icon location-icon" />,
  },
  {
    title: '"What Can I Eat?" Recommender',
    desc: "See meals you can make now, with recipes and missing ingredient suggestions.",
    icon: <div className="feature-icon eat-icon" />,
  },
];

const statistics = [
  {
    number: "33%",
    label: "of all food produced globally goes to waste",
    description: "While 828 million people worldwide face hunger daily"
  },
  {
    number: "$1.3T",
    label: "annual global cost of food waste",
    description: "Enough to feed 2 billion people for a year"
  },
  {
    number: "811M",
    label: "people go to bed hungry every night",
    description: "That's 1 in 10 people on our planet"
  },
  {
    number: "25%",
    label: "reduction in food costs possible",
    description: "Through smart meal planning and waste prevention"
  }
];

export default function LandingPage() {
  return (
    <div className="landing fade-in">
      <section className="plant-hero">
        <span className="plant-icon" role="img" aria-label="plant">🌱</span>
        <h1 className="hero-title" style={{ color: '#3cb371', textAlign: 'center', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem' }}>
          PantryPilot
        </h1>
        <p className="hero-tagline" style={{ color: '#388e3c', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', marginBottom: '1rem', textAlign: 'center', fontWeight: 600 }}>
          Scan it, plan it, don't can it
        </p>
        <p className="hero-subtitle" style={{ color: '#388e3c', fontSize: 'clamp(1rem, 2vw, 1.3rem)', marginBottom: '2.5rem', textAlign: 'center', opacity: 0.9 }}>
          Grow your savings, shrink your waste.<br />
          The nature-inspired, AI-powered pantry and meal planner.
        </p>
        <a href="/inventory" className="get-started-btn" style={{ background: '#3cb371', color: '#fff', borderRadius: '2rem', fontWeight: 700, fontSize: 'clamp(1rem, 2vw, 1.15rem)', padding: 'clamp(0.8rem, 2vw, 0.9rem) clamp(1.8rem, 4vw, 2.2rem)', textDecoration: 'none', boxShadow: '0 2px 16px rgba(60,179,113,0.10)', transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s', border: 'none' }}>
          Get Started
        </a>
      </section>

      <section className="statistics-section">
        <h2 className="statistics-title" style={{ color: '#3cb371', fontSize: 'clamp(1.5rem, 3vw, 2rem)', textAlign: 'center', marginBottom: '2rem' }}>
          The Global Food Crisis
        </h2>
        <div className="statistics-grid">
          {statistics.map((stat, index) => (
            <div className="stat-card fade-in" key={index} style={{ animationDelay: `${0.1 * index}s` }}>
              <div className="stat-number" style={{ color: '#3cb371', fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '0.5rem' }}>
                {stat.number}
              </div>
              <div className="stat-label" style={{ color: '#388e3c', fontSize: 'clamp(1rem, 2vw, 1.1rem)', fontWeight: 600, marginBottom: '0.5rem' }}>
                {stat.label}
              </div>
              <div className="stat-description" style={{ color: '#388e3c', fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', opacity: 0.8 }}>
                {stat.description}
              </div>
            </div>
          ))}
        </div>
        <div className="statistics-callout" style={{ background: '#e8f5e9', padding: 'clamp(1.5rem, 3vw, 2rem)', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: '#3cb371', fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)', marginBottom: '1rem' }}>
            How PantryPilot Makes a Difference
          </h3>
          <p style={{ color: '#388e3c', fontSize: 'clamp(1rem, 2vw, 1.1rem)', lineHeight: '1.6' }}>
            Every household that reduces food waste contributes to solving this global crisis. 
            Our AI-powered platform helps families worldwide stretch their food budget, 
            reduce waste, and make every ingredient count. Together, we can create a more 
            sustainable and equitable food system.
          </p>
        </div>
      </section>

      <section className="mission-section">
        <h2 className="mission-title" style={{ color: '#388e3c', fontSize: 'clamp(1.5rem, 3vw, 2rem)', textAlign: 'center' }}>Our Mission</h2>
        <p className="mission-desc" style={{ color: '#388e3c', fontSize: 'clamp(1rem, 2vw, 1.1rem)', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          To empower every household to eat better, waste less, and save more—using the power of AI and smart food management.
        </p>
      </section>
      <section className="features-section">
        <h2 className="features-title" style={{ color: '#3cb371', fontSize: 'clamp(1.5rem, 3vw, 2rem)', textAlign: 'center' }}>Features</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card fade-in" key={f.title} style={{ animationDelay: `${0.1 * i}s` }}>
              {f.icon}
              <h3 style={{ color: '#3cb371', fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)' }}>{f.title}</h3>
              <p style={{ color: '#388e3c', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="landing-footer" style={{ background: '#e8f5e9', color: '#388e3c', borderTop: '1px solid #c8e6c9', textAlign: 'center', padding: '1rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
        <p>© {new Date().getFullYear()} PantryPilot. Built for the GDG Hackathon.</p>
      </footer>
    </div>
  );
} 