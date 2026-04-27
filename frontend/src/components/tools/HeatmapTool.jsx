export default function HeatmapTool() {
  return (
    <div className="tools-workspace">
      <div className="tools-work-header">
        <div className="tools-work-title-area">
          <span className="tools-work-icon">{'\u{1F525}'}</span>
          <h3 className="tools-work-title">热图</h3>
        </div>
        <span className="tools-work-desc">基因表达热图聚类</span>
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
              <label>聚类方式</label>
              <select className="tools-select">
                <option value="both">行+列</option>
                <option value="row">仅行</option>
                <option value="col">仅列</option>
                <option value="none">不聚类</option>
              </select>
            </div>
            <div className="tools-config-field">
              <label>输出格式</label>
              <select className="tools-select">
                <option value="png">PNG 图片</option>
                <option value="svg">SVG 矢量图</option>
                <option value="pdf">PDF 文档</option>
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