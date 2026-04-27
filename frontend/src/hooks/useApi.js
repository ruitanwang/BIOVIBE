import { useState, useCallback } from 'react'
import axios from 'axios'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getToken = useCallback(() => {
    return localStorage.getItem('token')
  }, [])

  const apiRequest = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
      const response = await axios({
        method,
        url,
        data,
        headers
      })
      return response.data
    } catch (e) {
      const errorMessage = e.response?.data?.message || e.message || '请求失败'
      setError(errorMessage)
      throw e
    } finally {
      setLoading(false)
    }
  }, [getToken])

  const get = useCallback((url, config = {}) => {
    return apiRequest('get', url, null, config)
  }, [apiRequest])

  const post = useCallback((url, data, config = {}) => {
    return apiRequest('post', url, data, config)
  }, [apiRequest])

  return {
    loading,
    error,
    get,
    post,
    clearError: () => setError(null)
  }
}