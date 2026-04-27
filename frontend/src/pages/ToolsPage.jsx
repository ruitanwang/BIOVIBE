import { useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './ToolsPage.css'

import PCATool from '../components/tools/PCATool'
import VolcanoTool from '../components/tools/VolcanoTool'
import HeatmapTool from '../components/tools/HeatmapTool'
import MAPlotTool from '../components/tools/MAPlotTool'
import BoxplotTool from '../components/tools/BoxplotTool'
import ViolinTool from '../components/tools/ViolinTool'
import BubbleTool from '../components/tools/BubbleTool'
import CircosTool from '../components/tools/CircosTool'
import DiffAnalysisTool from '../components/tools/DiffAnalysisTool'
import EnrichmentTool from '../components/tools/EnrichmentTool'
import GSEATool from '../components/tools/GSEATool'
import WGCNATool from '../components/tools/WGCNATool'
import SurvivalTool from '../components/tools/SurvivalTool'
import CorrelationTool from '../components/tools/CorrelationTool'

const analysisMethods = [
  { id: 'diff-analysis', name: '差异分析', icon: '\u{1F4CA}', desc: 'DESeq2 / edgeR 差异表达基因分析' },
  { id: 'enrichment', name: '富集分析', icon: '\u{1F9EC}', desc: 'GO / KEGG 功能富集分析' },
  { id: 'gsea', name: 'GSEA分析', icon: '\u{1F50D}', desc: '基因集富集分析' },
  { id: 'wgcna', name: 'WGCNA', icon: '\u{1F517}', desc: '加权基因共表达网络分析' },
  { id: 'survival', name: '生存分析', icon: '\u{23F0}', desc: 'Kaplan-Meier / Cox 回归分析' },
  { id: 'correlation', name: '相关性分析', icon: '\u{1F517}', desc: 'Pearson / Spearman 相关性分析' },
]

const plotModules = [
  { id: 'pca', name: 'PCA', icon: '\u{1F4C8}', desc: '主成分分析降维可视化' },
  { id: 'volcano', name: '火山图', icon: '\u{1F30B}', desc: '差异表达基因火山图' },
  { id: 'heatmap', name: '热图', icon: '\u{1F525}', desc: '基因表达热图聚类' },
  { id: 'ma-plot', name: 'MA图', icon: '\u{1F4C9}', desc: 'M-A 散点图' },
  { id: 'boxplot', name: '箱线图', icon: '\u{1F4E6}', desc: '基因表达分布箱线图' },
  { id: 'violin', name: '小提琴图', icon: '\u{1F3BB}', desc: '数据分布小提琴图' },
  { id: 'bubble', name: '气泡图', icon: '\u{1FAE7}', desc: '富集分析气泡图' },
  { id: 'circos', name: 'Circos图', icon: '\u{1F300}', desc: '基因组圈图可视化' },
]

const TOOL_COMPONENTS = {
  'pca': PCATool,
  'volcano': VolcanoTool,
  'heatmap': HeatmapTool,
  'ma-plot': MAPlotTool,
  'boxplot': BoxplotTool,
  'violin': ViolinTool,
  'bubble': BubbleTool,
  'circos': CircosTool,
  'diff-analysis': DiffAnalysisTool,
  'enrichment': EnrichmentTool,
  'gsea': GSEATool,
  'wgcna': WGCNATool,
  'survival': SurvivalTool,
  'correlation': CorrelationTool,
}

function ToolsPage() {
  const [sidebarWidth, setSidebarWidth] = useState(20)
  const [isResizing, setIsResizing] = useState(false)
  const [activeTab, setActiveTab] = useState('analysis')
  const [selectedTool, setSelectedTool] = useState(null)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  const currentUser = localStorage.getItem('username')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    navigate('/auth')
  }

  const handleMouseDown = useCallback(() => {
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
    const rightWidth = 100 - newWidth
    const maxLeftWidth = rightWidth / 3
    const clampedWidth = Math.max(10, Math.min(newWidth, maxLeftWidth))
    setSidebarWidth(clampedWidth)
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  const currentItems = activeTab === 'analysis' ? analysisMethods : plotModules

  const handleToolClick = (tool) => {
    setSelectedTool(tool)
  }

  const renderWorkArea = () => {
    if (!selectedTool) {
      return (
        <div className="tools-empty">
          <span className="tools-empty-icon">{'\u{1F527}'}</span>
          <p>请从左侧选择分析工具或绘图模块</p>
        </div>
      )
    }

    const ToolComponent = TOOL_COMPONENTS[selectedTool.id]
    if (ToolComponent) {
      return <ToolComponent />
    }

    return (
      <div className="tools-workspace">
        <div className="tools-work-header">
          <div className="tools-work-title-area">
            <span className="tools-work-icon">{selectedTool.icon}</span>
            <h3 className="tools-work-title">{selectedTool.name}</h3>
          </div>
          <span className="tools-work-desc">{selectedTool.desc}</span>
        </div>
        <div className="tools-work-body">
          <div className="tools-config-panel">
            <h4 className="tools-config-title">参数配置</h4>
            <div className="tools-config-form">
              <div className="tools-config-field">
                <label>输入数据</label>
                <div className="tools-data-select">
                  <span className="tools-data-placeholder">从 DATA WORLD 选择数据文件</span>
                  <button className="tools-data-btn">选择文件</button>
                </div>
              </div>
              <div className="tools-config-field">
                <label>分析参数</label>
                <input type="text" className="tools-input" placeholder="默认参数" />
              </div>
              <div className="tools-config-field">
                <label>输出格式</label>
                <select className="tools-select">
                  <option value="png">PNG</option>
                  <option value="svg">SVG</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <button className="tools-run-btn">开始运行</button>
            </div>
          </div>
          <div className="tools-result-panel">
            <h4 className="tools-config-title">运行结果</h4>
            <div className="tools-result-placeholder">
              <span className="tools-result-icon">{'\u{23F3}'}</span>
              <p>该模块正在开发中，敬请期待</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="tools-page"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="tools-header">
        <Link to="/features" className="tools-back-btn">← 返回</Link>
        <h2 className="tools-title">TOOLS</h2>
        <div className="tools-user-area">
          <span className="tools-username">{currentUser}</span>
          <button className="tools-logout-btn" onClick={handleLogout}>退出</button>
        </div>
      </div>

      <div className="tools-body">
        <div className="tools-sidebar" style={{ width: `${sidebarWidth}%` }}>
          <div className="tools-tabs">
            <button
              className={`tools-tab ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => { setActiveTab('analysis'); setSelectedTool(null) }}
            >
              <span className="tools-tab-icon">{'\u{1F52C}'}</span>
              分析方法
            </button>
            <button
              className={`tools-tab ${activeTab === 'plot' ? 'active' : ''}`}
              onClick={() => { setActiveTab('plot'); setSelectedTool(null) }}
            >
              <span className="tools-tab-icon">{'\u{1F3A8}'}</span>
              绘图模块
            </button>
          </div>

          <div className="tools-method-list">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className={`tools-method-item ${selectedTool?.id === item.id ? 'active' : ''}`}
                onClick={() => handleToolClick(item)}
              >
                <span className="tools-method-icon">{item.icon}</span>
                <div className="tools-method-info">
                  <span className="tools-method-name">{item.name}</span>
                  <span className="tools-method-desc">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`tools-resizer ${isResizing ? 'resizing' : ''}`}
          onMouseDown={handleMouseDown}
        />

        <div className="tools-main" style={{ width: `${100 - sidebarWidth}%` }}>
          {renderWorkArea()}
        </div>
      </div>
    </div>
  )
}

export default ToolsPage