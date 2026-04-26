import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FeaturesPage from './pages/FeaturesPage'
import DataWorld from './pages/DataWorld'
import ToolsPage from './pages/ToolsPage'
import AuthPage from './pages/Auth'
import './App.css'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/auth" replace />
  }
  return children
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/features" element={<PrivateRoute><FeaturesPage /></PrivateRoute>} />
          <Route path="/data-world" element={<PrivateRoute><DataWorld /></PrivateRoute>} />
          <Route path="/tools" element={<PrivateRoute><ToolsPage /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
