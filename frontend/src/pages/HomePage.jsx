import { Link } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  return (
    <div className="home-page">
      <div className="floating-decorations">
        <span className="decoration decoration-1">🧬</span>
        <span className="decoration decoration-2">🔬</span>
        <span className="decoration decoration-3">🧪</span>
        <span className="decoration decoration-4">🧫</span>
        <span className="decoration decoration-5">🦠</span>
        <span className="decoration decoration-6">⚗️</span>
      </div>
      <div className="hero-content">
        <h1 className="hero-title">BIOVIBE</h1>
        <div className="hero-subtitle">
          <p>BIOCODE is cheap</p>
          <p>BIOIDEA is expensive</p>
          <p>BIOAGENT is future</p>
          <Link to="/features" className="start-button">Start Now</Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage