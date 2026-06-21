import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

export default function AdminCategoriesNew() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !description.trim()) {
      setError('Пожалуйста, заполните название и описание категории')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      await api.createCategory({ name, description })
      navigate('/categories')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Кнопка возврата */}
      <button onClick={() => navigate('/categories')} style={styles.backLink}>
        ← К списку категорий
      </button>

      <div style={styles.card}>
        {/* Заголовок формы */}
        <div style={styles.header}>
          <div style={styles.adminBadge}>Панель администратора</div>
          <h2 style={styles.title}>Создать категорию</h2>
          <p style={styles.subtitle}>Добавьте новое направление для классификации ИИ-ассистентов</p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="category-name">
              Название категории <span style={styles.required}>*</span>
            </label>
            <input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Маркетинг, Разработка, Аналитика..."
              style={styles.input}
              disabled={loading}
              maxLength={100}
            />
            <span style={styles.hint}>Короткое и понятное имя для группы агентов</span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="category-desc">
              Описание <span style={styles.required}>*</span>
            </label>
            <textarea
              id="category-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите, какие задачи решают ассистенты из этой категории..."
              rows={4}
              style={styles.textarea}
              disabled={loading}
              maxLength={500}
            />
            <span style={styles.hint}>Детальное описание поможет пользователям сделать правильный выбор</span>
          </div>

          {/* Контейнер ошибки */}
          {error && <div style={styles.errorContainer}>{error}</div>}

          {/* Панель действий кнопки */}
          <div style={styles.actionsRow}>
            <button
              type="button"
              onClick={() => navigate('/categories')}
              style={styles.cancelButton}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
            >
              {loading ? 'Сохранение...' : 'Создать категорию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Премиальные минималистичные стили в духе современных ИИ-платформ
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '40px 24px',
    maxWidth: '100%',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#ffffff',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#71717a',
    fontSize: '14px',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '24px',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  card: {
    border: '1px solid #e4e4e7',
    borderRadius: '12px',
    padding: '32px',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.01), 0 10px 20px -12px rgba(0, 0, 0, 0.03)',
  },
  header: {
    marginBottom: '28px',
  },
  adminBadge: {
    display: 'inline-block',
    backgroundColor: '#f4f4f5',
    color: '#71717a',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#09090b',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#71717a',
    margin: 0,
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#18181b',
  },
  required: {
    color: '#df2c2c',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.15s ease',
  },
  hint: {
    fontSize: '12px',
    color: '#a1a1aa',
    marginTop: '2px',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#991b1b',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    border: '1px solid #e4e4e7',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    color: '#3f3f46',
    transition: 'all 0.15s ease',
  },
  submitButton: {
    backgroundColor: '#18181b',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  submitButtonDisabled: {
    backgroundColor: '#e4e4e7',
    color: '#a1a1aa',
    cursor: 'not-allowed',
  },
}