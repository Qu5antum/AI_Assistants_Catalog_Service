import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()
  const auth = useAuth()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    try {
      setError(null)
      setIsLoading(true)
      await auth.login(email, password)
      navigate('/assistants')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Бренд-зона */}
        <div style={styles.header}>
          <h1 style={styles.title}>Добро пожаловать</h1>
          <p style={styles.subtitle}>Войдите в систему управления ИИ-ассистентами</p>
        </div>

        {/* Форма аутентификации */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label} htmlFor="password">Пароль</label>
              <a href="#forgot" style={styles.forgotLink}>Забыли пароль?</a>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          {error && <div style={styles.errorContainer}>{error}</div>}

          <button type="submit" disabled={isLoading}>{isLoading ? 'Вход...' : 'Продолжить'}</button>
        </form>

        <div style={styles.footer}>
          Нет аккаунта? <a href="#register" style={styles.footerLink}>Зарегистрироваться</a>
        </div>
      </div>
    </div>
  )
}

// Современные минималистичные стили в стиле SaaS/AI продуктов
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#fafafa', // Светлый чистый фон (для темной темы можно поменять на #0b0b0f)
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
    width: '100%',
    maxWidth: '420px',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    fontSize: '32px',
    color: '#1a1a1a',
    marginBottom: '16px',
    display: 'inline-block',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#111111',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666666',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'between',
    alignItems: 'center',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#333333',
    flexGrow: 1,
  },
  forgotLink: {
    fontSize: '13px',
    color: '#555555',
    textDecoration: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    color: '#000',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#111111', // Фирменный черный цвет в духе OpenAI/Anthropic
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '4px',
  },
  submitButtonDisabled: {
    backgroundColor: '#a3a3a3',
    cursor: 'not-allowed',
  },
  footer: {
    marginTop: '28px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#666666',
  },
  footerLink: {
    color: '#111111',
    fontWeight: 500,
    textDecoration: 'none',
  },
}