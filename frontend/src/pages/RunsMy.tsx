import { useEffect, useMemo, useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

const statusFilters = ['all', 'pending', 'success', 'failed'] as const
type StatusFilter = (typeof statusFilters)[number]

// Строгий интерфейс для запуска ИИ
interface AIRun {
  id: string | number
  assistant_id: string | number
  assistant_name?: string // Если бэкенд отдает имя, будет круто
  status: 'pending' | 'success' | 'failed'
  created_at: string
  user_prompt: string
}

export default function RunsMy() {
  const [runs, setRuns] = useState<AIRun[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const pageSize = 5

  useEffect(() => {
    setLoading(true)
    setError(null)
    api
      .getMyRuns()
      .then((data) => setRuns(data || []))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  // При смене фильтра сбрасываем страницу на первую
  const handleFilterChange = (newStatus: StatusFilter) => {
    setStatusFilter(newStatus)
    setPage(1)
  }

  const filtered = useMemo(() => {
    return runs.filter((run) => statusFilter === 'all' || run.status === statusFilter)
  }, [runs, statusFilter])

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))

  // Функция для отрисовки красивых статусов
  const renderStatusBadge = (status: AIRun['status']) => {
    const badgeStyles: Record<AIRun['status'], React.CSSProperties> = {
      pending: { backgroundColor: '#fef3c7', color: '#d97706' }, // Желтый
      success: { backgroundColor: '#dcfce7', color: '#15803d' }, // Зеленый
      failed: { backgroundColor: '#fee2e2', color: '#b91c1c' },  // Красный
    }

    const translate: Record<AIRun['status'], string> = {
      pending: 'В процессе',
      success: 'Успешно',
      failed: 'Ошибка',
    }

    return (
      <span style={{ ...styles.badge, ...badgeStyles[status] }}>
        {translate[status] || status}
      </span>
    )
  }

  return (
    <div style={styles.container}>
      {/* Заголовок */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>История запусков</h2>
          <p style={styles.subtitle}>Мониторинг запросов и ответов ваших ИИ-ассистентов</p>
        </div>
      </div>

      {/* Панель фильтрации */}
      <div style={styles.toolbar}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Статус:</span>
          <div style={styles.tabs}>
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                style={{
                  ...styles.tabButton,
                  ...(statusFilter === status ? styles.tabButtonActive : {}),
                }}
              >
                {status === 'all' ? 'Все' : status === 'pending' ? 'В процессе' : status === 'success' ? 'Успешно' : 'С ошибкой'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Вывод ошибок */}
      {error && <div style={styles.errorContainer}>Ошибка загрузки: {error}</div>}

      {/* Таблица / Состояние загрузки */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <span>Загрузка истории...</span>
        </div>
      ) : paged.length === 0 ? (
        <div style={styles.emptyState}>Запусков с таким статусом не найдено.</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ассистент</th>
                <th style={styles.th}>Статус</th>
                <th style={styles.th}>Дата и время</th>
                <th style={styles.th}>Промпт</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Действие</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((run) => (
                <tr key={run.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 500 }}>
                    ID: {run.assistant_id}
                  </td>
                  <td style={styles.td}>{renderStatusBadge(run.status)}</td>
                  <td style={{ ...styles.td, color: '#71717a' }}>
                    {new Date(run.created_at).toLocaleString('ru-RU')}
                  </td>
                  <td style={{ ...styles.td, color: '#4b5563', maxWidth: '300px' }}>
                    <div style={styles.promptTruncate}>
                      {run.user_prompt || <span style={{ color: '#a1a1aa', fontStyle: 'italic' }}>Пустой запрос</span>}
                    </div>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <button
                      onClick={() => navigate(`/assistants/${run.assistant_id}`)}
                      style={styles.openButton}
                    >
                      Открыть
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Пагинация */}
      {!loading && paged.length > 0 && (
        <div style={styles.pagination}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ ...styles.pagButton, ...(page <= 1 ? styles.pagButtonDisabled : {}) }}
          >
            ← Назад
          </button>
          <span style={styles.pagInfo}>
            Страница <strong>{page}</strong> из {pageCount}
          </span>
          <button
            disabled={page >= pageCount}
            onClick={() => setPage((p) => p + 1)}
            style={{ ...styles.pagButton, ...(page >= pageCount ? styles.pagButtonDisabled : {}) }}
          >
            Вперед →
          </button>
        </div>
      )}
    </div>
  )
}

// Профессиональные стили а-ля Shadcn UI / OpenAI Dashboard
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '40px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#09090b',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#71717a',
    margin: 0,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    backgroundColor: '#fafafa',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #f4f4f5',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  filterLabel: {
    fontSize: '14px',
    color: '#71717a',
    fontWeight: 500,
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#e4e4e7',
    padding: '3px',
    borderRadius: '6px',
    gap: '2px',
  },
  tabButton: {
    border: 'none',
    backgroundColor: 'transparent',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#52525b',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    color: '#09090b',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid #e4e4e7',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    textAlign: 'left',
  },
  th: {
    backgroundColor: '#fafafa',
    padding: '12px 16px',
    fontWeight: 500,
    color: '#71717a',
    borderBottom: '1px solid #e4e4e7',
    fontSize: '13px',
  },
  tr: {
    borderBottom: '1px solid #f4f4f5',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
    color: '#18181b',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block',
  },
  promptTruncate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  openButton: {
    backgroundColor: '#ffffff',
    border: '1px solid #e4e4e7',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    color: '#18181b',
    transition: 'all 0.2s',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px',
  },
  pagButton: {
    backgroundColor: '#ffffff',
    border: '1px solid #e4e4e7',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#18181b',
  },
  pagButtonDisabled: {
    color: '#a1a1aa',
    borderColor: '#f4f4f5',
    cursor: 'not-allowed',
  },
  pagInfo: {
    fontSize: '14px',
    color: '#71717a',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#71717a',
    padding: '48px',
    border: '1px dashed #e4e4e7',
    borderRadius: '8px',
    fontSize: '14px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '60px',
    color: '#71717a',
    fontSize: '14px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #e4e4e7',
    borderTopColor: '#18181b',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
}