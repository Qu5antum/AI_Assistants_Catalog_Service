import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const auth = useAuth()

  async function handleLogin() {
    try {
      setError(null)
      await auth.login(email, password)
      navigate('/assistants')
    } catch (err) {
      setError(String(err))
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <div style={{ marginBottom: 12 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
