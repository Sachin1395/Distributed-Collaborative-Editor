import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: "sync",
      title: "Real-Time Collaboration",
      description: "Edit together with conflict-free CRDT technology"
    },
    {
      icon: "offline",
      title: "Offline First",
      description: "Keep working without internet, syncs automatically"
    },
    {
      icon: "history",
      title: "Version History",
      description: "Never lose work with automatic snapshots"
    },
    {
      icon: "shield",
      title: "Secure & Private",
      description: "Enterprise-grade authentication and encryption"
    },
    {
      icon: "bolt",
      title: "Lightning Fast",
      description: "Powered by Yjs and optimized WebSocket sync"
    },
    {
      icon: "edit",
      title: "Rich Text Editor",
      description: "Full formatting, images, links, and more"
    }
  ]

  const getIconSVG = (type) => {
    const icons = {
      sync: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>,
      offline: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>,
      history: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      bolt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
      edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    }
    return icons[type]
  }

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            {/* Logo */}
            <div className="logo-section">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <polyline points="14 2 14 8 20 8" fill="white"/>
                </svg>
              </div>
              <span className="logo-text">CollabEdit</span>
            </div>

            {/* Desktop Navigation */}
            <div className="nav-links">
              <a href="#home" className="nav-link">Home</a>
              <a href="#features" className="nav-link">Features</a>
              <a href="#about" className="nav-link">About</a>
              <a href="#pricing" className="nav-link">Pricing</a>
            </div>

            {/* Auth Buttons */}
            <div className="auth-buttons">
              <button className="lang-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                EN
              </button>
              <button
                onClick={() => navigate('/login')}
                className="signin-button"
              >
                Sign In
              </button>
              <button className="menu-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Badge Pills */}
          <div className="badge-pills">
            <span className="badge badge-blue">
              Powered by CRDT
            </span>
            <span className="badge badge-purple">
              Enterprise Ready
            </span>
            <span className="badge badge-green">
              100% Secure
            </span>
          </div>

          {/* Main Headline */}
          <div className="hero-content">
            <h1 className="hero-title">
              Effortless Collaboration.
              <br />
              <span className="gradient-text">
                Brilliant Documents.
              </span>
            </h1>
            
            <p className="hero-subtitle">
              Experience the ultimate collaborative editing platform with CollabEdit.
              <br className="desktop-break" />
              Real-time document collaboration that just works.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/login')}
              className="cta-button"
            >
              <span>Get Started Free</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>

            <p className="hero-note">
              No credit card required. Cancel anytime.
            </p>
          </div>

          {/* Tech Stack Logos */}
          <div className="tech-stack">
            <div className="tech-item">
              <div className="tech-logo"></div>
              <span className="tech-name">Supabase</span>
            </div>
            <div className="tech-item">
              <div className="tech-logo"></div>
              <span className="tech-name">Yjs</span>
            </div>
            <div className="tech-item">
              <div className="tech-logo"></div>
              <span className="tech-name">Redis</span>
            </div>
            <div className="tech-item">
              <div className="tech-logo"></div>
              <span className="tech-name">WebSocket</span>
            </div>
            <div className="tech-item">
              <div className="tech-logo"></div>
              <span className="tech-name">TipTap</span>
            </div>
            <div className="tech-item">
              <div className="tech-logo"></div>
              <span className="tech-name">Grafana</span>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="gallery-section">
        <div className="gallery-container">
          <div className="gallery-grid">
            <div className="gallery-item gradient-blue">
              <div className="gallery-content">
                <div className="gallery-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                </div>
                <div className="gallery-text">Real-time Sync</div>
              </div>
            </div>
            <div className="gallery-item gradient-purple">
              <div className="gallery-content">
                <div className="gallery-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <div className="gallery-text">Rich Editor</div>
              </div>
            </div>
            <div className="gallery-item gradient-pink">
              <div className="gallery-content">
                <div className="gallery-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div className="gallery-text">Collaboration</div>
              </div>
            </div>
            <div className="gallery-item gradient-green">
              <div className="gallery-content">
                <div className="gallery-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="gallery-text">Version History</div>
              </div>
            </div>
            <div className="gallery-item gradient-orange">
              <div className="gallery-content">
                <div className="gallery-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>
                  </svg>
                </div>
                <div className="gallery-text">Offline Mode</div>
              </div>
            </div>
            <div className="gallery-item gradient-red">
              <div className="gallery-content">
                <div className="gallery-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <div className="gallery-text">Analytics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              Everything You Need for
              <br />
              <span className="features-title-accent">Seamless Collaboration</span>
            </h2>
            <p className="features-subtitle">
              Built with cutting-edge technology to deliver the best collaborative editing experience
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {getIconSVG(feature.icon)}
                </div>
                <h3 className="feature-title">
                  {feature.title}
                </h3>
                <p className="feature-description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">
            Ready to Start Collaborating?
          </h2>
          <p className="cta-subtitle">
            Join thousands of teams building better documents together.
            <br />
            No credit card required. Start for free today.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="cta-button-white"
          >
            <span>Get Started Free</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-section">
              <div className="footer-logo">
                <div className="logo-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <polyline points="14 2 14 8 20 8" fill="white"/>
                  </svg>
                </div>
                <span className="logo-text">CollabEdit</span>
              </div>
              <p className="footer-description">
                The modern collaborative editing platform built for teams.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Product</h4>
              <ul className="footer-list">
                <li><a href="#" className="footer-link">Features</a></li>
                <li><a href="#" className="footer-link">Pricing</a></li>
                <li><a href="#" className="footer-link">Security</a></li>
                <li><a href="#" className="footer-link">Roadmap</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-list">
                <li><a href="#" className="footer-link">About</a></li>
                <li><a href="#" className="footer-link">Blog</a></li>
                <li><a href="#" className="footer-link">Careers</a></li>
                <li><a href="#" className="footer-link">Contact</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-list">
                <li><a href="#" className="footer-link">Documentation</a></li>
                <li><a href="#" className="footer-link">API Reference</a></li>
                <li><a href="#" className="footer-link">Tutorials</a></li>
                <li><a href="#" className="footer-link">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-text">
              © 2024 CollabEdit. Built with React, Yjs, TipTap, Supabase, and Redis.
            </p>
            <div className="footer-links">
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}