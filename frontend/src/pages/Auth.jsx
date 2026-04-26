import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('请填写用户名和密码')
      return
    }

    if (!isLogin && password.length < 6) {
      setError('密码长度不能少于6位')
      return
    }

    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin
        ? { username, password }
        : { username, password, email }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()

      if (json.code === 200) {
        localStorage.setItem('token', json.data.token)
        localStorage.setItem('userId', json.data.userId)
        localStorage.setItem('username', json.data.username)
        navigate('/features')
      } else {
        setError(json.message || (isLogin ? '登录失败' : '注册失败'))
      }
    } catch (err) {
      setError('网络错误，请检查后端服务')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setUsername('')
    setPassword('')
    setEmail('')
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container">
        <div className="auth-logo">
          <h1>BIOVIBE</h1>
          <p>WORLD</p>
        </div>

        <div className="auth-card">
          <h2 className="auth-title">{isLogin ? '登录' : '注册'}</h2>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? '请输入密码' : '请输入密码（至少6位）'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            {!isLogin && (
              <div className="auth-field">
                <label>邮箱（选填）</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  autoComplete="email"
                />
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? '处理中...' : (isLogin ? '登 录' : '注 册')}
            </button>
          </form>

          <div className="auth-switch">
            <span>{isLogin ? '还没有账号？' : '已有账号？'}</span>
            <button onClick={switchMode}>
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </div>
        </div>

        <Link to="/" className="auth-back">← 返回首页</Link>
      </div>
    </div>
  )
}

export default AuthPage
