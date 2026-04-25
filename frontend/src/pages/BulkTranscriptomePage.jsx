import { useState } from 'react'
import { Link } from 'react-router-dom'
import './BulkTranscriptomePage.css'

function BulkTranscriptomePage() {
  const [expandedMenu, setExpandedMenu] = useState(null)
  const [activeAnalysis, setActiveAnalysis] = useState('Bulk转录组分析')
  const [activeTab, setActiveTab] = useState('workspace')

  const menuItems = [
    {
      name: '差异分析',
      subItems: ['DESeq2', 'limma', 'edgeR']
    },
    {
      name: '富集分析',
      subItems: ['KEGG', 'GO', 'Reactome']
    },
    {
      name: '聚类分析',
      subItems: ['K-means', '层次聚类', 'PCA']
    },
    {
      name: '降维分析',
      subItems: ['t-SNE', 'UMAP', 'PCA']
    }
  ]

  const toggleMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName)
  }

  return (
    <div className="bulk-page">
      <header className="bulk-header">
        <h1 className="bulk-title">Bulk转录组分析</h1>
        <Link to="/features" className="back-button">← 返回</Link>
      </header>
      
      <div className="bulk-content">
        <nav className="bulk-sidebar">
          <div className="sidebar-title">分析方法</div>
          <ul className="menu-list">
            {menuItems.map((item, index) => (
              <li key={index} className="menu-item">
                <div 
                  className={`menu-item-header ${expandedMenu === item.name ? 'expanded' : ''}`}
                  onClick={() => toggleMenu(item.name)}
                >
                  <span className="menu-icon">{expandedMenu === item.name ? '▼' : '▶'}</span>
                  <span className="menu-name">{item.name}</span>
                </div>
                {expandedMenu === item.name && (
                  <ul className="submenu-list">
                    {item.subItems.map((subItem, subIndex) => (
                      <li 
                        key={subIndex} 
                        className="submenu-item"
                        onClick={() => setActiveAnalysis(`${item.name} - ${subItem}`)}
                      >
                        {subItem}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        
        <main className="bulk-workspace">
          <div className="workspace-header">
            <h2>{activeAnalysis}</h2>
            <div className="workspace-tabs">
              <button 
                className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                方法说明
              </button>
              <button 
                className={`tab-button ${activeTab === 'workspace' ? 'active' : ''}`}
                onClick={() => setActiveTab('workspace')}
              >
                工作区块
              </button>
            </div>
          </div>
          <div className="workspace-content">
            {activeTab === 'description' ? (
              <div className="description-panel">
                <h3>{activeAnalysis} - 方法说明</h3>
                <p>这里是 {activeAnalysis} 的详细说明文档</p>
              </div>
            ) : (
              <>
                <p className="workspace-placeholder">
                  欢迎使用 {activeAnalysis} 工作区
                </p>
                <div className="workspace-info">
                  <p>请从左侧导航栏选择分析方法开始分析</p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default BulkTranscriptomePage