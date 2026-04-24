import { Link } from 'react-router-dom'
import './FeaturesPage.css'

function FeaturesPage() {
  const features = [
    { name: 'Bulk转录组分析', icon: '🧬', path: '/bulk-transcriptome' },
    { name: '单细胞转录组分析', icon: '🔬', path: '/single-cell-transcriptome' },
    { name: '空间转录组分析', icon: '🗺️', path: '/spatial' },
    { name: '蛋白质组学分析', icon: '🧪', path: '/proteomics' },
    { name: '代谢组学分析', icon: '⚗️', path: '/metabolomics' },
    { name: '表观基因组分析', icon: '🧫', path: '/epigenomics' },
    { name: '基因组变异检测', icon: '🧩', path: '/variation' },
    { name: '微生物组分析', icon: '🦠', path: '/microbiome' },
    { name: '药物靶点预测', icon: '💊', path: '/drug-target' },
    { name: '生物网络构建', icon: '🕸️', path: '/network' },
    { name: '通路富集分析', icon: '🛤️', path: '/enrichment' },
    { name: '疾病关联分析', icon: '🏥', path: '/disease' }
  ]

  return (
    <div className="features-page">
      <div className="section-decorations">
        <span className="section-deco deco-1">🧬</span>
        <span className="section-deco deco-2">🔬</span>
        <span className="section-deco deco-3">🧪</span>
        <span className="section-deco deco-4">🧫</span>
        <span className="section-deco deco-5">🦠</span>
        <span className="section-deco deco-6">⚗️</span>
      </div>
      <Link to="/" className="back-button">← 返回首页</Link>
      <h2 className="section-title">BIOVIBE WORLD</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <Link key={index} to={feature.path} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-name">{feature.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default FeaturesPage