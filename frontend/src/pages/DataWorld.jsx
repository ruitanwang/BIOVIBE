import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './DataWorld.css'

const fileIcons = {
  csv: '\u{1F4CA}',
  xlsx: '\u{1F4CA}',
  fasta: '\u{1F9EC}',
  json: '\u{1F4CB}',
  tsv: '\u{1F4CA}',
  txt: '\u{1F4C4}',
}

function parseCSV(text, separator = ',') {
  const lines = text.trim().split('\n')
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map(line => {
    return line.split(separator).map(cell => cell.trim().replace(/^"|"$/g, ''))
  })
  return { headers, rows }
}

function formatJSON(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

function DataWorld() {
  const [sidebarWidth, setSidebarWidth] = useState(20)
  const [isResizing, setIsResizing] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [fileContent, setFileContent] = useState(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError, setContentError] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const containerRef = useRef(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const currentUser = localStorage.getItem('username')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    navigate('/auth')
  }

  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/files', { headers: authHeaders() })
      const json = await res.json()
      if (json.code === 200) {
        setFiles(json.data)
      } else if (json.code === 401) {
        handleLogout()
      }
    } catch (e) {
      console.error('获取文件列表失败', e)
    }
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const loadFileContent = useCallback(async (file) => {
    setContentLoading(true)
    setContentError(null)
    setFileContent(null)
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(file.savedName)}/content`, {
        headers: authHeaders(),
      })
      const json = await res.json()
      if (json.code === 200) {
        setFileContent(json.data)
      } else if (json.code === 401) {
        handleLogout()
      } else {
        setContentError(json.message || '读取文件内容失败')
      }
    } catch (err) {
      setContentError('读取文件内容失败，请检查后端服务')
    } finally {
      setContentLoading(false)
    }
  }, [])

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    loadFileContent(file)
  }

  const requestDelete = (e, file) => {
    e.stopPropagation()
    setConfirmModal({ file })
  }

  const handleConfirmDelete = async () => {
    const file = confirmModal?.file
    if (!file) return
    setConfirmModal(null)

    setDeleting(true)
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(file.savedName)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (json.code === 200) {
        if (selectedFile?.savedName === file.savedName) {
          setSelectedFile(null)
          setFileContent(null)
        }
        setFiles((prev) => prev.filter((f) => f.savedName !== file.savedName))
      } else if (json.code === 401) {
        handleLogout()
      } else {
        alert(json.message || '删除失败')
      }
    } catch (err) {
      alert('删除失败，请检查后端服务')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setConfirmModal(null)
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

  const handleSelectClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: authHeaders(),
      })
      const json = await res.json()
      if (json.code === 200) {
        setFiles((prev) => [...prev, json.data])
      } else if (json.code === 401) {
        handleLogout()
      } else {
        alert(json.message || '上传失败')
      }
    } catch (err) {
      alert('上传失败，请检查后端服务是否启动')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const renderContent = () => {
    if (contentLoading) {
      return (
        <div className="dw-loading">
          <div className="dw-spinner" />
          <p>加载中...</p>
        </div>
      )
    }

    if (contentError) {
      return (
        <div className="dw-error">
          <span className="dw-error-icon">{String.fromCodePoint(0x26A0)}</span>
          <p>{contentError}</p>
        </div>
      )
    }

    if (!fileContent) return null

    const type = selectedFile?.type

    if (type === 'csv') {
      const { headers, rows } = parseCSV(fileContent, ',')
      return (
        <div className="dw-table-wrapper">
          <table className="dw-data-table">
            <thead>
              <tr>
                {headers.map((h, i) => <th key={i}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (type === 'tsv') {
      const { headers, rows } = parseCSV(fileContent, '\t')
      return (
        <div className="dw-table-wrapper">
          <table className="dw-data-table">
            <thead>
              <tr>
                {headers.map((h, i) => <th key={i}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (type === 'json') {
      return (
        <pre className="dw-code-block">{formatJSON(fileContent)}</pre>
      )
    }

    return (
      <pre className="dw-code-block">{fileContent}</pre>
    )
  }

  return (
    <div
      className="data-world"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv,.xlsx,.xls,.tsv,.json,.fasta,.fa,.fna,.txt"
        onChange={handleFileChange}
      />

      {confirmModal && (
        <div className="dw-modal-overlay" onClick={handleCancelDelete}>
          <div className="dw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dw-modal-icon">{String.fromCodePoint(0x26A0)}</div>
            <h3 className="dw-modal-title">确认删除</h3>
            <p className="dw-modal-message">
              你确定要删除文件 <strong>{confirmModal.file.name}</strong> 吗？
            </p>
            <div className="dw-modal-actions">
              <button className="dw-modal-cancel" onClick={handleCancelDelete}>取消</button>
              <button className="dw-modal-confirm" onClick={handleConfirmDelete}>确定删除</button>
            </div>
          </div>
        </div>
      )}

      <div className="data-world-header">
        <Link to="/features" className="dw-back-btn">← 返回</Link>
        <h2 className="dw-title">DATA WORLD</h2>
        <div className="dw-user-area">
          <span className="dw-username">{currentUser}</span>
          <button className="dw-logout-btn" onClick={handleLogout}>退出</button>
        </div>
      </div>

      <div className="data-world-body">
        <div className="dw-sidebar" style={{ width: `${sidebarWidth}%` }}>
          <div className="dw-sidebar-header">
            <span className="dw-sidebar-title">数据文件</span>
            <button
              className="dw-select-btn"
              onClick={handleSelectClick}
              disabled={uploading}
            >
              {uploading ? '上传中...' : '上传本地数据文件'}
            </button>
          </div>
          <div className="dw-file-list">
            {files.length === 0 ? (
              <div className="dw-file-empty">暂无文件，请选择文件上传</div>
            ) : (
              files.map((file) => (
                <div
                  key={file.savedName}
                  className={`dw-file-item ${selectedFile?.savedName === file.savedName ? 'active' : ''}`}
                  onClick={() => handleFileSelect(file)}
                >
                  <span className="dw-file-icon">{fileIcons[file.type] || '\u{1F4C4}'}</span>
                  <div className="dw-file-info">
                    <span className="dw-file-name">{file.name}</span>
                    <span className="dw-file-size">{file.size}</span>
                  </div>
                  <button
                    className="dw-delete-btn"
                    onClick={(e) => requestDelete(e, file)}
                    disabled={deleting}
                    title="删除文件"
                  >
                    {String.fromCodePoint(0x1F5D1)}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div
          className={`dw-resizer ${isResizing ? 'resizing' : ''}`}
          onMouseDown={handleMouseDown}
        />

        <div className="dw-main" style={{ width: `${100 - sidebarWidth}%` }}>
          {selectedFile ? (
            <div className="dw-content">
              <div className="dw-content-header">
                <h3>{selectedFile.name}</h3>
                <div className="dw-content-actions">
                  <span className="dw-content-meta">{selectedFile.size} | {selectedFile.type.toUpperCase()}</span>
                  <button
                    className="dw-content-delete-btn"
                    onClick={(e) => requestDelete(e, selectedFile)}
                    disabled={deleting}
                  >
                    删除文件
                  </button>
                </div>
              </div>
              <div className="dw-content-body">
                {renderContent()}
              </div>
            </div>
          ) : (
            <div className="dw-empty">
              <span className="dw-empty-icon">{String.fromCodePoint(0x1F4C1)}</span>
              <p>请从左侧选择数据文件</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataWorld
