import { useState, useCallback } from 'react'
import { useApi } from '../../hooks/useApi'
import { useFileSelector } from '../../hooks/useFileSelector'

export default function PCATool() {
  const [normalization, setNormalization] = useState('auto')
  const [scaleData, setScaleData] = useState('TRUE')
  const [maxComponents, setMaxComponents] = useState(10)
  const [outputFormat, setOutputFormat] = useState('png')

  const [result, setResult] = useState(null)
  const [detecting, setDetecting] = useState(false)
  const [detectedInfo, setDetectedInfo] = useState(null)

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmQuestion, setConfirmQuestion] = useState('')
  const [confirmOptions, setConfirmOptions] = useState([])
  const [pendingAction, setPendingAction] = useState(null)

  const { post, loading: apiLoading, error, clearError } = useApi()
  const {
    selectedFile,
    showFileSelector,
    userFiles,
    loading: filesLoading,
    openFileSelector,
    closeFileSelector,
    selectFile,
    clearFile
  } = useFileSelector()

  const handleSelectFile = useCallback((file) => {
    selectFile(file)
    setDetectedInfo(null)
    setResult(null)
    clearError()
  }, [selectFile, clearError])

  const handleDetectFormat = async () => {
    if (!selectedFile) return
    setDetecting(true)
    clearError()
    try {
      await post('/api/pca/detect', { fileName: selectedFile.savedName })
      setDetectedInfo({ detectedFormat: 'auto', message: '检测完成' })
    } catch {
    } finally {
      setDetecting(false)
    }
  }

  const handleRunPCA = async () => {
    if (!selectedFile) return
    setResult(null)
    clearError()
    try {
      const data = await post('/api/pca/run', {
        fileName: selectedFile.savedName,
        normalization,
        scale: scaleData,
        maxComponents: parseInt(maxComponents)
      })
      if (data.needsConfirmation) {
        setConfirmQuestion(data.confirmationQuestion)
        setConfirmOptions(data.confirmationOptions || [])
        setPendingAction({ type: 'run_pca', data })
        setShowConfirmDialog(true)
      } else {
        setResult(data)
      }
    } catch {
    }
  }

  const handleConfirmAction = async (choice) => {
    setShowConfirmDialog(false)
    if (pendingAction?.type === 'run_pca') {
      try {
        const data = await post('/api/pca/run', {
          fileName: selectedFile.savedName,
          normalization: choice || normalization,
          scale: scaleData,
          maxComponents: parseInt(maxComponents)
        })
        setResult(data)
      } catch {
      }
    }
  }

  const running = apiLoading

  const renderFileSelector = () => {
    if (!showFileSelector) return null
    const filteredFiles = userFiles.filter(f =>
      ['csv', 'txt', 'tsv', 'xlsx', 'xls'].includes(f.type?.toLowerCase())
    )

    return (
      <div className="tools-modal-overlay" onClick={closeFileSelector}>
        <div className="tools-modal" onClick={(e) => e.stopPropagation()}>
          <div className="tools-modal-header">
            <h3>选择数据文件</h3>
            <button className="tools-modal-close" onClick={closeFileSelector}>×</button>
          </div>
          <div className="tools-modal-body">
            {filteredFiles.length === 0 ? (
              <div className="tools-file-empty">
                <p>暂无可用的数据文件</p>
              </div>
            ) : (
              <div className="tools-file-list">
                {filteredFiles.map(file => (
                  <div
                    key={file.savedName}
                    className={`tools-file-item ${selectedFile?.savedName === file.savedName ? 'selected' : ''}`}
                    onClick={() => handleSelectFile(file)}
                  >
                    <span className="tools-file-icon">
                      {file.type === 'csv' ? '\u{1F4CA}' : '\u{1F4C4}'}
                    </span>
                    <div className="tools-file-info">
                      <span className="tools-file-name">{file.name}</span>
                      <span className="tools-file-meta">{file.size} · {file.uploadTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderConfirmDialog = () => {
    if (!showConfirmDialog) return null
    return (
      <div className="tools-modal-overlay" onClick={() => setShowConfirmDialog(false)}>
        <div className="tools-modal tools-confirm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="tools-modal-header">
            <h3>{'\u{1F914}'} 智能体询问</h3>
          </div>
          <div className="tools-modal-body">
            <p className="tools-confirm-question">{confirmQuestion}</p>
            <div className="tools-confirm-options">
              {confirmOptions.map((opt, i) => (
                <button
                  key={i}
                  className="tools-confirm-btn"
                  onClick={() => handleConfirmAction(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tools-workspace">
      <div className="tools-work-header">
        <div className="tools-work-title-area">
          <span className="tools-work-icon">{'\u{1F4C8}'}</span>
          <h3 className="tools-work-title">PCA - 主成分分析</h3>
        </div>
        <span className="tools-work-desc">智能数据格式识别 + 降维可视化</span>
      </div>
      <div className="tools-work-body">
        <div className="tools-config-panel">
          <h4 className="tools-config-title">参数配置</h4>
          <div className="tools-config-form">
            <div className="tools-config-field">
              <label>输入数据 <span className="tools-required">*</span></label>
              {selectedFile ? (
                <div className="tools-file-selected">
                  <span className="tools-file-icon-small">
                    {selectedFile.type === 'csv' ? '\u{1F4CA}' : '\u{1F4C4}'}
                  </span>
                  <span className="tools-file-selected-name" title={selectedFile.name}>{selectedFile.name}</span>
                  <button className="tools-file-change-btn" onClick={openFileSelector}>更换</button>
                </div>
              ) : (
                <div className="tools-data-select">
                  <span className="tools-data-placeholder">从 DATA WORLD 选择数据文件</span>
                  <button className="tools-data-btn" onClick={openFileSelector}>选择文件</button>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="tools-config-field">
                <label>数据格式检测</label>
                <button
                  className="tools-detect-btn"
                  onClick={handleDetectFormat}
                  disabled={detecting}
                >
                  {detecting ? '\u{23F3} 检测中...' : '\u{1F50D} 智能检测格式'}
                </button>
                {detectedInfo && (
                  <div className="tools-detect-result">
                    <span className="tools-detect-badge">{detectedInfo.detectedFormat}</span>
                    <p className="tools-detect-message">{detectedInfo.message}</p>
                  </div>
                )}
              </div>
            )}

            <div className="tools-config-field">
              <label>归一化方法</label>
              <select className="tools-select" value={normalization} onChange={(e) => setNormalization(e.target.value)}>
                <option value="auto">自动检测（推荐）</option>
                <option value="log2">Log2(x+1)</option>
                <option value="log10">Log10(x+1)</option>
                <option value="zscore">Z-Score标准化</option>
                <option value="none">不处理（原始数据）</option>
              </select>
            </div>

            <div className="tools-config-field">
              <label>数据缩放</label>
              <select className="tools-select" value={scaleData} onChange={(e) => setScaleData(e.target.value)}>
                <option value="TRUE">启用（推荐）</option>
                <option value="FALSE">禁用</option>
              </select>
            </div>

            <div className="tools-config-field">
              <label>最大主成分数</label>
              <input
                type="number"
                className="tools-input"
                value={maxComponents}
                min={2}
                max={50}
                onChange={(e) => setMaxComponents(e.target.value)}
              />
            </div>

            <div className="tools-config-field">
              <label>输出格式</label>
              <select className="tools-select" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                <option value="png">PNG 图片</option>
                <option value="svg">SVG 矢量图</option>
                <option value="pdf">PDF 文档</option>
              </select>
            </div>

            <button
              className={`tools-run-btn ${running ? 'running' : ''}`}
              onClick={handleRunPCA}
              disabled={running || !selectedFile}
            >
              {running ? '\u{23F3} 分析运行中...' : '\u{1F680} 开始运行 PCA'}
            </button>
          </div>
        </div>

        <div className="tools-result-panel">
          <h4 className="tools-config-title">运行结果</h4>
          {error && (
            <div className="tools-error-box">
              <span className="tools-error-icon">⚠</span>
              <p>{error}</p>
            </div>
          )}
          {!result && !error && (
            <div className="tools-result-placeholder">
              <span className="tools-result-icon">{'\u{23F3}'}</span>
              <p>选择文件并配置参数后点击"开始运行"</p>
            </div>
          )}
          {result && result.status === 'success' && (
            <div className="tools-result-content">
              <div className="tools-result-status">
                <span className="tools-success-badge">✓ 分析完成</span>
                {result.dataFormat && (
                  <div className="tools-result-meta">
                    <span>检测格式: {result.dataFormat.detectedFormat}</span>
                    <span>基因数: {result.dataFormat.nGenes}</span>
                    <span>样本数: {result.dataFormat.nSamples}</span>
                  </div>
                )}
              </div>

              {result.plotBase64 && (
                <div className="tools-plot-area">
                  <h5 className="tools-plot-title">PCA 可视化结果</h5>
                  <img src={result.plotBase64} alt="PCA Plot" className="tools-plot-img" />
                </div>
              )}

              {result.varianceData && (
                <div className="tools-variance-table">
                  <h5 className="tools-plot-title">方差解释率</h5>
                  <table>
                    <thead>
                      <tr>
                        <th>主成分</th>
                        <th>方差</th>
                        <th>解释率(%)</th>
                        <th>累计(%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        try {
                          const varData = JSON.parse(result.varianceData)
                          return varData.map((row, i) => (
                            <tr key={i}>
                              <td>{row.PC}</td>
                              <td>{row.Variance}</td>
                              <td>{row.VariancePct}</td>
                              <td>{row.CumulativePct}</td>
                            </tr>
                          ))
                        } catch {
                          return <tr><td colSpan="4">数据解析中...</td></tr>
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              )}

              {result.dataFormat?.issues && result.dataFormat.issues.length > 0 && (
                <div className="tools-issues-box">
                  <h5>{'\u{1F4A1}'} 智能处理记录</h5>
                  <ul>
                    {result.dataFormat.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {renderFileSelector()}
      {renderConfirmDialog()}
    </div>
  )
}