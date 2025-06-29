import React, { useState, useEffect } from "react";
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

const sdgGoals = [
  {
    goal: "2.1",
    title: "End Hunger",
    description: "By 2030, end hunger and ensure access by all people to safe, nutritious and sufficient food all year round"
  },
  {
    goal: "2.2",
    title: "End Malnutrition",
    description: "By 2030, end all forms of malnutrition, including achieving internationally agreed targets on stunting and wasting in children under 5 years of age"
  },
  {
    goal: "2.3",
    title: "Double Agricultural Productivity",
    description: "By 2030, double the agricultural productivity and incomes of small-scale food producers"
  },
  {
    goal: "2.4",
    title: "Sustainable Food Production",
    description: "By 2030, ensure sustainable food production systems and implement resilient agricultural practices"
  }
];

export default function LandingPage() {
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % statistics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing fade-in">
      {/* Hero Section */}
      <section className="plant-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <span className="plant-icon" role="img" aria-label="plant">🌱</span>
        <h1 className="hero-title">
          PantryPilot
        </h1>
        <p className="hero-tagline">
          Empowering Sustainable Food Security
        </p>
        <p className="hero-subtitle">
          Scan it, plan it, don't waste it.
        </p>
        <div className="hero-buttons">
          <a href="/inventory" className="get-started-btn">
            Get Started
          </a>
          <a href="#sdg-section" className="learn-more-btn">
            Learn About SDG 2
          </a>
        </div>
      </section>

      {/* UN SDG Goal 2 Section */}
      <section id="sdg-section" className="sdg-section">
        <div className="sdg-header">
          <div className="sdg-logo">
            <span className="sdg-number">2</span>
          </div>
          <div className="sdg-content">
            <h2>UN Sustainable Development Goal</h2>
            <h3>"Zero Hunger"</h3>
            <p>
              End hunger, achieve food security and improved nutrition and promote sustainable agriculture
            </p>
          </div>
        </div>
        
        <div className="sdg-targets">
          <h3>Key Targets for 2030</h3>
          <div className="targets-grid">
            {sdgGoals.map((target, index) => (
              <div className="target-card" key={index}>
                <div className="target-number">{target.goal}</div>
                <h4>{target.title}</h4>
                <p>{target.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics-section">
        <h2>The Global Food Crisis</h2>
        <div className="statistics-grid">
          {statistics.map((stat, index) => (
            <div 
              className={`stat-card fade-in ${index === currentStat ? 'active' : ''}`} 
              key={index} 
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="stat-number">
                {stat.number}
              </div>
              <div className="stat-label">
                {stat.label}
              </div>
              <div className="stat-description">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
        <div className="statistics-callout">
          <h3>How PantryPilot Contributes to Zero Hunger</h3>
          <p>
            Every household that reduces food waste contributes to solving this global crisis. 
            Our AI-powered platform helps families worldwide stretch their food budget, 
            reduce waste, and make every ingredient count. Together, we can create a more 
            sustainable and equitable food system that supports the UN's vision of Zero Hunger by 2030.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <h2>Our Mission</h2>
        <p className="mission-desc">
          To empower every household to eat better, waste less, and save more—using the power of AI and smart food management.
          We're committed to creating a world where no one goes hungry.
        </p>
        <div className="mission-pillars">
          <div className="pillar">
            <div className="pillar-icon">🌍</div>
            <h4>Global Impact</h4>
            <p>Supporting sustainable development through local action</p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">🤖</div>
            <h4>AI-Powered</h4>
            <p>Smart technology for better decisions</p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">💚</div>
            <h4>Sustainable</h4>
            <p>Reducing waste, protecting our planet</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card fade-in" key={f.title} style={{ animationDelay: `${0.1 * i}s` }}>
              {f.icon}
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>Join the Movement</h2>
        <p>Be part of the solution to global hunger. Start your sustainable food journey today.</p>
        <div className="cta-buttons">
          <a href="/inventory" className="cta-primary">
            Start Using PantryPilot
          </a>
          <a href="https://sdgs.un.org/goals/goal2" target="_blank" rel="noopener noreferrer" className="cta-secondary">
            Learn More About Zero Hunger
          </a>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} PantryPilot. Built for the GDG Hackathon. Supporting sustainable development.</p>
      </footer>
    </div>
  );
} 