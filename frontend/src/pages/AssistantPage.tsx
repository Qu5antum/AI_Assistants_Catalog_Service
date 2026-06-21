import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/api'

// Описание интерфейса ассистента
interface Assistant {
  id: string | number
  name: string
  description?: string
  category_id?: string | number
  category?: { name: string }
  model: string
  example_prompt?: string
}

// Описание интерфейса ответа от API
interface RunResult {
  output?: string
  error?: string
  [key: string]: unknown
}

export default function AssistantPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [assistant, setAssistant] = useState<Assistant | null>(null)
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<RunResult | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [runError, setRunError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    api.getAssistant(id)
      .then((r) => setAssistant(r))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [id])

  async function handleRun() {
    if (!id || !prompt.trim()) return
    setRunError(null)
    setIsRunning(true)
    setResult(null) // Сбрасываем старый результат перед новым запуском
    
    try {
      const r = await api.runAssistant(id, prompt)
      setResult(r)
    } catch (err) {
      setRunError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsRunning(false)
    }
  }

  // При клике на пример — подставляем его в поле ввода
  const applyExamplePrompt = () => {
    if (assistant?.example_prompt) {
      setPrompt(assistant.example_prompt)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span>Инициализация ассистента...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h3>Ошибка загрузки</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/assistants')} style={styles.backButton}>Вернуться к списку</button>
      </div>
    )
  }

  if (!assistant) {
    return (
      <div style={styles.emptyContainer}>
        <p>Ассистент не найден</p>
        <button onClick={() => navigate('/assistants')} style={styles.backButton}>Назад</button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Ссылка назад */}
      <button onClick={() => navigate('/assistants')} style={styles.backLink}>
        ← К списку ассистентов
      </button>

      {/* Лейаут из двух колонок: слева информация, справа инпуты и вывод */}
      <div style={styles.layout}>
        
        {/* Левая колонка: Описание и параметры */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <h1 style={styles.title}>{assistant.name}</h1>
            <p style={styles.description}>{assistant.description || 'Описание не заполнено.'}</p>
          </div>

          <div style={styles.metaGrid}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Модель</span>
              <span style={styles.metaValue}>{assistant.model}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Категория</span>
              <span style={styles.metaValue}>
                {assistant.category?.name || assistant.category_id || 'Общая'}
              </span>
            </div>
          </div>

          {assistant.example_prompt && (
            <div style={styles.exampleSection}>
              <div style={styles.exampleHeader}>
                <span style={styles.metaLabel}>Пример промпта</span>
                <button onClick={applyExamplePrompt} style={styles.applyButton}>
                  Использовать
                </button>
              </div>
              <div style={styles.exampleBox}>{assistant.example_prompt}</div>
            </div>
          )}
        </div>

        {/* Правая колонка: Среда выполнения (Workspace) */}
        <div style={styles.workspace}>
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="prompt-input">Ваш запрос (Prompt)</label>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Введите инструкции или вопрос для ИИ..."
              rows={6}
              style={styles.textarea}
              disabled={isRunning}
            />
          </div>

          <div style={styles.actionRow}>
            <button
              onClick={handleRun}
              disabled={isRunning || !prompt.trim()}
              style={{
                ...styles.runButton,
                ...((isRunning || !prompt.trim()) ? styles.runButtonDisabled : {})
              }}
            >
              {isRunning ? 'Выполнение запроса...' : 'Запустить ассистента'}
            </button>
          </div>

          {/* Ошибка во время выполнения */}
          {runError && (
            <div style={styles.runErrorBox}>
              <strong>Ошибка выполнения:</strong> {runError}
            </div>
          )}

          {/* Блок вывода результата */}
          {(isRunning || result) && (
            <div style={styles.resultContainer}>
              <h3 style={styles.resultTitle}>Результат генерации</h3>
              
              {isRunning ? (
                <div style={styles.resultLoading}>
                  <div style={styles.inlineSpinner}></div>
                  <span>ИИ генерирует ответ...</span>
                </div>
              ) : (
                <pre style={styles.outputPre}>
                  {result?.output ?? result?.error ?? JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// Премиальные стили в стиле OpenAI Playground / Anthropic Console
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '32px 24px',
    maxWidth: '1280px',
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
  layout: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
  },
  sidebar: {
    flex: '1 1 300px',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sidebarSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '28px',
    fontWeight: 600,
    color: '#09090b',
    margin: '0 0 12px 0',
    letterSpacing: '-0.6px',
  },
  description: {
    fontSize: '15px',
    color: '#52525b',
    lineHeight: '1.6',
    margin: 0,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fafafa',
    borderRadius: '10px',
    border: '1px solid #f4f4f5',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metaLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metaValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#18181b',
  },
  exampleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  exampleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applyButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: 0,
  },
  exampleBox: {
    backgroundColor: '#fafafa',
    border: '1px dashed #e4e4e7',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#52525b',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  workspace: {
    flex: '2 2 500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#18181b',
  },
  textarea: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    fontSize: '15px',
    lineHeight: '1.5',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.2s',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  runButton: {
    backgroundColor: '#18181b',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  runButtonDisabled: {
    backgroundColor: '#e4e4e7',
    color: '#a1a1aa',
    cursor: 'not-allowed',
  },
  runErrorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  resultContainer: {
    marginTop: '12px',
    border: '1px solid #e4e4e7',
    borderRadius: '10px',
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  resultTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#18181b',
    padding: '12px 16px',
    borderBottom: '1px solid #e4e4e7',
    margin: 0,
    backgroundColor: '#ffffff',
  },
  resultLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    color: '#71717a',
    fontSize: '14px',
  },
  outputPre: {
    margin: 0,
    padding: '16px',
    fontSize: '14px',
    color: '#09090b',
    fontFamily: 'JetBrains Mono, Fira Code, Menlo, Monaco, Consolas, monospace',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    gap: '12px',
    color: '#71717a',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px',
    color: '#991b1b',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '40px',
    color: '#71717a',
  },
  backButton: {
    marginTop: '16px',
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #e4e4e7',
    cursor: 'pointer',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #e4e4e7',
    borderTopColor: '#18181b',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  inlineSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #e4e4e7',
    borderTopColor: '#18181b',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
}