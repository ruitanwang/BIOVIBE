import { Link, useNavigate } from 'react-router-dom'
import './FeaturesPage.css'

function FeaturesPage() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')
  const username = localStorage.getItem('username')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    navigate('/auth')
  }

  return (
    <div className="features-page">
      <div className="section-decorations">
        <span className="section-deco deco-1">🧩</span>
        <span className="section-deco deco-2">🧫</span>
        <span className="section-deco deco-3">🧪</span>
        <span className="section-deco deco-4">🧬</span>
        <span className="section-deco deco-5">🦠</span>
        <span className="section-deco deco-6">🎯</span>
      </div>
      <div className="fp-header">
        <Link to="/" className="back-button">← 返回首页</Link>
        <h2 className="section-title">BIOVIBE WORLD</h2>
        <div className="fp-auth-area">
          {isLoggedIn ? (
            <>
              <span className="fp-username">{username}</span>
              <button className="fp-logout-btn" onClick={handleLogout}>退出</button>
            </>
          ) : (
            <Link to="/auth" className="fp-login-btn">登录 / 注册</Link>
          )}
        </div>
      </div>
      
      <div className="features-content">
        <div className="layout-row layout-row-1">
          <Link to="/data-world" className="world-card card-large card-data">
            <div className="card-logo">{String.fromCodePoint(0x1F4CB)}</div>
            <h3>DATA WORLD</h3>
          </Link>
        </div>

        <div className="layout-row layout-row-2">
          <div className="world-card card-medium card-workflow">
            <div className="card-logo">
              <svg viewBox="0 0 120 90" width="64" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00b894"/>
                    <stop offset="100%" stopColor="#55efc4"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1.5" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <path d="M8 12 C8 12 50 12 60 12 C70 12 70 22 70 27 C70 32 70 37 60 37 C50 37 8 37 8 37 C8 37 -2 37 -2 47 C-2 57 -2 62 8 62 C18 62 60 62 70 62 C80 62 80 72 80 77 C80 82 80 82 90 82 L112 82" stroke="url(#pipeGrad)" strokeWidth="5" strokeLinecap="round" filter="url(#glow)"/>
                <circle cx="8" cy="12" r="4.5" fill="#00b894" filter="url(#glow)"/>
                <circle cx="112" cy="82" r="4.5" fill="#55efc4" filter="url(#glow)"/>
                <circle cx="35" cy="12" r="2.8" fill="white" opacity="0.8"/>
                <circle cx="35" cy="37" r="2.8" fill="white" opacity="0.8"/>
                <circle cx="35" cy="62" r="2.8" fill="white" opacity="0.8"/>
                <path d="M106 76 L114 82 L106 88" stroke="#55efc4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
              </svg>
            </div>
            <h3>WORKFLOW</h3>
          </div>
          <Link to="/tools" className="world-card card-medium card-tools">
            <div className="card-logo">🔧</div>
            <h3>TOOLS</h3>
          </Link>
          <div className="world-card card-medium card-agents">
            <div className="card-logo">🤖</div>
            <h3>AGENTS</h3>
          </div>
        </div>

        <div className="layout-row layout-row-3">
          <div className="world-card card-large card-result">
            <div className="card-logo">📊</div>
            <h3>RESULT REPO</h3>
          </div>
        </div>

        <div className="layout-row layout-row-4">
          <div className="world-card card-large card-literature">
            <div className="card-logo">📚</div>
            <h3>LITERATURE EXPLANATION</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturesPage
