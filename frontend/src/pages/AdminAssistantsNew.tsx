import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

// Интерфейс для списка категорий
interface Category {
  id: string | number
  name: string
}

// Пресеты популярных LLM-моделей на выбор
const POPULAR_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Рекомендуется)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'meta-llama-3', label: 'Llama 3 (Open Source)' },
]

export default function AdminAssistantsNew() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('gpt-4o')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [examplePrompt, setExamplePrompt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.getCategories()
      .then((data) => setCategories(data || []))
      .catch((err) => console.error('Ошибка загрузки категорий:', err))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    
    if (
      !name.trim() || 
      !description.trim() || 
      !systemPrompt.trim() || 
      !examplePrompt.trim() || 
      !categoryId
    ) {
      setError('Пожалуйста, заполните все обязательные поля формы')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await api.createAssistant({
        name,
        description,
        model,
        system_prompt: systemPrompt,
        example_prompt: examplePrompt,
        category_id: categoryId,
        is_active: isActive,
      })
      navigate('/assistants')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Кнопка возврата */}
      <button onClick={() => navigate('/assistants')} style={styles.backLink}>
        ← Вернуться к ассистентам
      </button>

      <form onSubmit={handleSubmit} style={styles.formLayout}>
        
        {/* ЛЕВАЯ КОЛОНКА: Метаданные ассистента */}
        <div style={styles.mainCard}>
          <div style={styles.header}>
            <div style={styles.adminBadge}>Панель администратора</div>
            <h2 style={styles.title}>Новый ассистент</h2>
            <p style={styles.subtitle}>Конфигурация базовых параметров и видимости агента</p>
          </div>

          <div style={styles.fieldStack}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="assistant-name">
                Название ассистента <span style={styles.required}>*</span>
              </label>
              <input
                id="assistant-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: AI Копирайтер, SQL Оптимизатор..."
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="assistant-desc">
                Краткое описание <span style={styles.required}>*</span>
              </label>
              <textarea
                id="assistant-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите роль ассистента для пользователей..."
                rows={3}
                style={styles.textarea}
                disabled={loading}
              />
            </div>

            <div style={styles.rowGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="assistant-model">
                  Языковая модель (LLM) <span style={styles.required}>*</span>
                </label>
                <select
                  id="assistant-model"
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
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="assistant-cat">
                  Категория <span style={styles.required}>*</span>
                </label>
                <select
                  id="assistant-cat"
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

            {/* Статус активности */}
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={styles.checkbox}
                disabled={loading}
              />
              <div>
                <div style={styles.checkboxTitle}>Активен и доступен пользователям</div>
                <div style={styles.checkboxSub}>Неактивные ассистенты скрыты из общего каталога</div>
              </div>
            </label>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Инженерия промптов (Prompt Engineering) */}
        <div style={styles.promptCard}>
          <div style={styles.header}>
            <h3 style={styles.sectionTitle}>Настройка контекста ИИ</h3>
            <p style={styles.subtitle}>Системные инструкции, определяющие логику работы LLM</p>
          </div>

          <div style={styles.fieldStack}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="system-prompt">
                Системный промпт (System Instructions) <span style={styles.required}>*</span>
              </label>
              <textarea
                id="system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Ты — опытный ИИ-ассистент. Твоя задача... Отвечай в строгом формате..."
                rows={7}
                style={{ ...styles.textarea, ...styles.codeFont }}
                disabled={loading}
              />
              <span style={styles.hint}>Главные правила, ограничения и системная роль агента.</span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="example-prompt">
                Пример пользовательского запроса <span style={styles.required}>*</span>
              </label>
              <textarea
                id="example-prompt"
                value={examplePrompt}
                onChange={(e) => setExamplePrompt(e.target.value)}
                placeholder="Напиши пост для блога про новинки React 19 в деловом стиле..."
                rows={4}
                style={styles.textarea}
                disabled={loading}
              />
              <span style={styles.hint}>Этот текст отобразится пользователю в качестве шаблона-подсказки.</span>
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
                {loading ? 'Создание...' : 'Создать ассистента'}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  )
}

// Профессиональные SaaS-стили консоли управления
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
    backgroundColor: '#fcfcfc', // Легкое выделение инженерной зоны промптов
  },
  header: {
    marginBottom: '24px',
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
  hint: {
    fontSize: '12px',
    color: '#a1a1aa',
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
}