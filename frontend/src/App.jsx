import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FeaturesPage from './pages/FeaturesPage'
import BulkTranscriptomePage from './pages/BulkTranscriptomePage'
import SingleCellTranscriptomePage from './pages/SingleCellTranscriptomePage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/bulk-transcriptome" element={<BulkTranscriptomePage />} />
          <Route path="/single-cell-transcriptome" element={<SingleCellTranscriptomePage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App