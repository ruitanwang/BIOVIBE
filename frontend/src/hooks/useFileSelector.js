import { useState, useCallback } from 'react'
import axios from 'axios'

const ALLOWED_FILE_TYPES = ['csv', 'txt', 'tsv', 'xlsx', 'xls']

export function useFileSelector() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [showFileSelector, setShowFileSelector] = useState(false)
  const [userFiles, setUserFiles] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchUserFiles = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/files', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUserFiles(res.data.data || [])
    } catch (e) {
      console.error('Failed to fetch files:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const openFileSelector = useCallback(() => {
    fetchUserFiles()
    setShowFileSelector(true)
  }, [fetchUserFiles])

  const closeFileSelector = useCallback(() => {
    setShowFileSelector(false)
  }, [])

  const selectFile = useCallback((file) => {
    setSelectedFile(file)
    setShowFileSelector(false)
  }, [])

  const clearFile = useCallback(() => {
    setSelectedFile(null)
  }, [])

  const getAllowedFiles = useCallback(() => {
    return userFiles.filter(f => ALLOWED_FILE_TYPES.includes(f.type?.toLowerCase()))
  }, [userFiles])

  return {
    selectedFile,
    showFileSelector,
    userFiles,
    loading,
    openFileSelector,
    closeFileSelector,
    selectFile,
    clearFile,
    getAllowedFiles,
    ALLOWED_FILE_TYPES
  }
}