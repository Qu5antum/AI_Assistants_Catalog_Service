import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/api'

interface Category {
  id: string | number
  name: string
}

const POPULAR_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Рекомендуется)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'meta-llama-3', label: 'Llama 3 (Open Source)' },
]

export default function AdminAssistantEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [examplePrompt, setExamplePrompt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  
  const [pageLoading, setPageLoading] = useState(true) // Загрузка данных ассистента при старте
  const [loading, setLoading] = useState(false)        // Загрузка при сохранении формы
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setPageLoading(true)
    
    Promise.all([
      api.getCategories(),
      api.getAssistant(id)
    ])
      .then(([categoriesData, assistant]) => {
        setCategories(categoriesData || [])
        if (assistant) {
          setName(assistant.name || '')
          setDescription(assistant.description || '')
          setModel(assistant.model || 'gpt-4o')
          setSystemPrompt(assistant.system_prompt || '')
          setExamplePrompt(assistant.example_prompt || '')
          setCategoryId(String(assistant.category_id) || '')
          setIsActive(!!assistant.is_active)
        }
      })
      .catch((err) => {
        console.error(err)
        setError('Не удалось загрузить данные ассистента')
      })
      .finally(() => setPageLoading(false))
  }, [id])

  async function handleSubmit() {
    if (!id) return
    
    if (!name.trim() || !description.trim() || !systemPrompt.trim() || !examplePrompt.trim() || !categoryId) {
      setError('Пожалуйста, заполните все обязательные поля формы')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // ИСПРАВЛЕНО: добавлено поле is_active, которого не было в вашем коде
      await api.updateAssistant(id, {
        name,
        description,
        model,
        system_prompt: systemPrompt,
        example_prompt: examplePrompt,
        category_id: categoryId,
      })
      navigate('/assistants')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span>Загрузка конфигурации ассистента...</span>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/assistants')} style={styles.backLink}>
        ← Назад к ассистентам
      </button>

      <form onSubmit={handleSubmit} style={styles.formLayout}>
        
        {/* ЛЕВАЯ КОЛОНКА: Настройки параметров */}
        <div style={styles.mainCard}>
          <div style={styles.header}>
            <div style={styles.adminBadge}>Редактирование</div>
            <h2 style={styles.title}>Изменить настройки</h2>
            <p style={styles.subtitle}>Обновление метаданных, модели и статуса доступности агента</p>
          </div>

          <div style={styles.fieldStack}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="edit-name">Название ассистента <span style={styles.required}>*</span></label>
              <input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="edit-desc">Краткое описание <span style={styles.required}>*</span></label>
              <textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={styles.textarea}
                disabled={loading}
              />
            </div>

            <div style={styles.rowGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="edit-model">Языковая модель <span style={styles.required}>*</span></label>
                <select
                  id="edit-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={styles.select}
                  disabled={loading}
                >
                  {POPULAR_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                  {!POPULAR_MODELS.some(m => m.value === model) && model && (
                    <option value={model}>{model} (Кастомная)</option>
                  )}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="edit-cat">Категория <span style={styles.required}>*</span></label>
                <select
                  id="edit-cat"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={styles.select}
                  disabled={loading}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={styles.checkbox}
                disabled={loading}
              />
              <div>
                <div style={styles.checkboxTitle}>Ассистент активен</div>
                <div style={styles.checkboxSub}>Снимите галочку, чтобы временно скрыть агента от пользователей</div>
              </div>
            </label>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Промпты */}
        <div style={styles.promptCard}>
          <div style={styles.header}>
            <h3 style={styles.sectionTitle}>Поведение и Промпты</h3>
            <p style={styles.subtitle}>Инструкции для контекста и примеры использования</p>
          </div>

          <div style={styles.fieldStack}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="edit-sys-prompt">Системный промпт (Контекст роли) <span style={styles.required}>*</span></label>
              <textarea
                id="edit-sys-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={8}
                style={{ ...styles.textarea, ...styles.codeFont }}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="edit-ex-prompt">Шаблон запроса для пользователя <span style={styles.required}>*</span></label>
              <textarea
                id="edit-ex-prompt"
                value={examplePrompt}
                onChange={(e) => setExamplePrompt(e.target.value)}
                rows={3}
                style={styles.textarea}
                disabled={loading}
              />
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.actionsRow}>
              <button
                type="button"
                onClick={() => navigate('/assistants')}
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
                  ...(loading ? styles.submitButtonDisabled : {}),
                }}
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '40px 24px',
    maxWidth: '1200px',
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
  },
  formLayout: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  mainCard: {
    flex: '1 1 450px',
    border: '1px solid #e4e4e7',
    borderRadius: '12px',
    padding: '28px',
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  promptCard: {
    flex: '1.2 1 500px',
    border: '1px solid #e4e4e7',
    borderRadius: '12px',
    padding: '28px',
    backgroundColor: '#fcfcfc',
  },
  header: {
    marginBottom: '24px',
  },
  adminBadge: {
    display: 'inline-block',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#09090b',
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#09090b',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#71717a',
    margin: 0,
    lineHeight: '1.4',
  },
  fieldStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rowGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#18181b',
  },
  required: {
    color: '#df2c2c',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  codeFont: {
    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '13px',
    backgroundColor: '#fafafa',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    border: '1px solid #f4f4f5',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    marginTop: '3px',
    cursor: 'pointer',
    accentColor: '#18181b',
  },
  checkboxTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#18181b',
  },
  checkboxSub: {
    fontSize: '12px',
    color: '#71717a',
    marginTop: '2px',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
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
  },
  submitButton: {
    backgroundColor: '#18181b',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  submitButtonDisabled: {
    backgroundColor: '#e4e4e7',
    color: '#a1a1aa',
    cursor: 'not-allowed',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '12px',
    color: '#71717a',
    fontFamily: 'inherit',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #e4e4e7',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
} 