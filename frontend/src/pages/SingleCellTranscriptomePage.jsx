import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import scOverview from './sc-overview.md?raw'
import './SingleCellTranscriptomePage.css'

function SingleCellTranscriptomePage() {
  const [expandedMenu, setExpandedMenu] = useState(null)
  const [activeAnalysis, setActiveAnalysis] = useState('单细胞转录组分析')
  const [activeTab, setActiveTab] = useState('workspace')
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleMouseDown = (e) => {
    const startX = e.clientX
    const startWidth = sidebarWidth

    const handleMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX)
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const menuItems = [
    {
      name: '概览',
      subItems: ['项目信息', '数据概览', '分析流程']
    },
    {
      name: '数据质控',
      subItems: ['线粒体基因过滤', '基因数过滤', '双细胞检测']
    },
    {
      name: '数据标准化',
      subItems: ['SCTransform', 'LogNormalize', 'CLR']
    },
    {
      name: '降维分析',
      subItems: ['PCA', 't-SNE', 'UMAP']
    },
    {
      name: '细胞聚类',
      subItems: ['Louvain', 'Leiden', '层次聚类']
    },
    {
      name: '细胞类型注释',
      subItems: ['Marker基因', '自动注释', '手动注释']
    },
    {
      name: '差异分析',
      subItems: ['FindMarkers', 'FindAllMarkers', 'GSEA']
    },
    {
      name: '轨迹分析',
      subItems: ['Monocle', 'Slingshot', 'PAGA']
    }
  ]

  const toggleMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName)
  }

  return (
    <div className="sc-page">
      <header className="sc-header">
        <h1 className="sc-title">单细胞转录组分析</h1>
        <Link to="/features" className="back-button">← 返回</Link>
      </header>
      
      <div className="sc-content">
        <nav className={`sc-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ width: sidebarCollapsed ? '40px' : `${sidebarWidth}px`, minWidth: sidebarCollapsed ? '40px' : `${sidebarWidth}px` }}>
          {!sidebarCollapsed && (
            <>
              <div className="sidebar-header">
                <div className="sidebar-title">分析方法</div>
                <button className="collapse-button" onClick={toggleSidebar}>◀</button>
              </div>
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
              <div className="resize-handle" onMouseDown={handleMouseDown}></div>
            </>
          )}
          {sidebarCollapsed && (
            <button className="expand-button-collapsed" onClick={toggleSidebar}>▶</button>
          )}
        </nav>
        
        <main className="sc-workspace">
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
              <div className="description-panel markdown-content">
                {activeAnalysis === '概览 - 项目信息' ? (
                  <ReactMarkdown>{scOverview}</ReactMarkdown>
                ) : (
                  <>
                    <h3>{activeAnalysis} - 方法说明</h3>
                    <p>这里是 {activeAnalysis} 的详细说明文档</p>
                  </>
                )}
              </div>
            ) : (
              <div className="workspace-panel">
                <p className="workspace-placeholder">
                  欢迎使用 {activeAnalysis} 工作区
                </p>
                <div className="workspace-info">
                  <p>请从左侧导航栏选择分析方法开始分析</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default SingleCellTranscriptomePage
