import { useEffect, useMemo, useState } from 'react'
import api from '../api/api'

const statusFilters = ['all', 'pending', 'success', 'failed'] as const
type StatusFilter = (typeof statusFilters)[number]

// Интерфейс для ассистента (для фильтра)
interface AssistantInfo {
  id: string | number
  name: string
}

// Интерфейс для глобального запуска в системе
interface AdminRun {
  id: string | number
  assistant_id: string | number
  user_id: string | number
  status: 'pending' | 'success' | 'failed'
  created_at: string
  user_prompt: string
  output?: string
  error?: string
}

export default function AdminRuns() {
  const [runs, setRuns] = useState<AdminRun[]>([])
  const [assistants, setAssistants] = useState<AssistantInfo[]>([])
  const [assistantFilter, setAssistantFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const pageSize = 5

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([api.getAdminRuns(), api.getAssistants()])
      .then(([runsData, assistantsData]) => {
        setRuns(runsData || [])
        setAssistants(assistantsData || [])
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  // Хелпер: мапим массив ассистентов в объект для мгновенного поиска по ID
  const assistantMap = useMemo(() => {
    const map: Record<string | number, string> = {}
    assistants.forEach((a) => {
      map[a.id] = a.name
    })
    return map
  }, [assistants])

  // Фильтрация с автоматическим сбросом на страницу 1 при изменении
  const filtered = useMemo(() => {
    return runs
      .filter((run) => assistantFilter === '' || String(run.assistant_id) === String(assistantFilter))
      .filter((run) => statusFilter === 'all' || run.status === statusFilter)
  }, [runs, assistantFilter, statusFilter])

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))

  const handleAssistantChange = (id: string) => {
    setAssistantFilter(id)
    setPage(1)
  }

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status)
    setPage(1)
  }

  // Отрисовка цветных бэджей для статуса
  const renderStatusBadge = (status: AdminRun['status']) => {
    const badgeStyles: Record<AdminRun['status'], React.CSSProperties> = {
      pending: { backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' },
      success: { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' },
      failed: { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' },
    }

    const labels: Record<AdminRun['status'], string> = {
      pending: 'Pending',
      success: 'Success',
      failed: 'Failed',
    }

    return (
      <span style={{ ...styles.badge, ...badgeStyles[status] }}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div style={styles.container}>
      {/* Шапка админки */}
      <div style={styles.header}>
        <div>
          <div style={styles.adminTag}>Панель администратора</div>
          <h2 style={styles.title}>Глобальный аудит запусков</h2>
          <p style={styles.subtitle}>Просмотр и логирование всех ИИ-запросов внутри системы в реальном времени</p>
        </div>
      </div>

      {/* Панель фильтров (Инструменты) */}
      <div style={styles.toolbar}>
        <div style={styles.filterGroup}>
          <div style={styles.selectControl}>
            <span style={styles.filterLabel}>Ассистент</span>
            <select
              value={assistantFilter}
              onChange={(e) => handleAssistantChange(e.target.value)}
              style={styles.select}
            >
              <option value="">Все ассистенты</option>
              {assistants.map((assistant) => (
                <option key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.selectControl}>
            <span style={styles.filterLabel}>Статус</span>
            <div style={styles.tabs}>
              {statusFilters.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  style={{
                    ...styles.tabButton,
                    ...(statusFilter === status ? styles.tabButtonActive : {}),
                  }}
                >
                  {status === 'all' ? 'Все' : status}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={styles.stats}>
          Найдено записей: <strong>{filtered.length}</strong>
        </div>
      </div>

      {/* Вывод критической ошибки бэкенда */}
      {error && <div style={styles.errorContainer}>Ошибка загрузки логов: {error}</div>}

      {/* Основная таблица логов */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <span>Синхронизация системных логов...</span>
        </div>
      ) : paged.length === 0 ? (
        <div style={styles.emptyState}>Логи по заданным фильтрам отсутствуют.</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ассистент</th>
                <th style={styles.th}>Пользователь (User ID)</th>
                <th style={styles.th}>Статус</th>
                <th style={styles.th}>Дата создания</th>
                <th style={styles.th}>Промпт (Запрос)</th>
                <th style={styles.th}>Результат выполнения</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((run) => (
                <tr key={run.id} style={styles.tr}>
                  {/* Имя ассистента или его ID */}
                  <td style={{ ...styles.td, fontWeight: 500, color: '#09090b' }}>
                    {assistantMap[run.assistant_id] ? (
                      <div>
                        <div>{assistantMap[run.assistant_id]}</div>
                        <div style={styles.subId}>ID: {run.assistant_id}</div>
                      </div>
                    ) : (
                      `ID: ${run.assistant_id}`
                    )}
                  </td>
                  
                  {/* ID пользователя */}
                  <td style={styles.td}>
                    <span style={styles.userIdBadge}>👤 {run.user_id}</span>
                  </td>
                  
                  {/* Статус */}
                  <td style={styles.td}>{renderStatusBadge(run.status)}</td>
                  
                  {/* Таймстемп */}
                  <td style={{ ...styles.td, color: '#71717a', whiteSpace: 'nowrap' }}>
                    {new Date(run.created_at).toLocaleString('ru-RU')}
                  </td>
                  
                  {/* Промпт */}
                  <td style={{ ...styles.td, maxWidth: '240px' }}>
                    <div style={styles.textTruncate} title={run.user_prompt}>
                      {run.user_prompt || <span style={styles.emptyText}>Пусто</span>}
                    </div>
                  </td>
                  
                  {/* Результат вывода бэка */}
                  <td style={{ ...styles.td, maxWidth: '280px' }}>
                    <div 
                      style={{ 
                        ...styles.textTruncate, 
                        ...styles.codeStyle,
                        color: run.error ? '#dc2626' : '#27272a'
                      }}
                      title={run.output ?? run.error}
                    >
                      {run.output ?? run.error ?? <span style={styles.emptyText}>Нет ответа</span>}
                    </div>
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
            ← Предыдущая
          </button>
          <span style={styles.pagInfo}>
            Страница <strong>{page}</strong> из {pageCount}
          </span>
          <button
            disabled={page >= pageCount}
            onClick={() => setPage((p) => p + 1)}
            style={{ ...styles.pagButton, ...(page >= pageCount ? styles.pagButtonDisabled : {}) }}
          >
            Следующая →
          </button>
        </div>
      )}
    </div>
  )
}

// Стили системной консоли корпоративного уровня
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '40px 24px',
    maxWidth: '100%',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: '32px',
  },
  adminTag: {
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
    fontSize: '26px',
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
    alignItems: 'flex-end',
    marginBottom: '24px',
    backgroundColor: '#fafafa',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    gap: '16px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  selectControl: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '12px',
    color: '#71717a',
    fontWeight: 500,
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e4e4e7',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    minWidth: '200px',
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#e4e4e7',
    padding: '2px',
    borderRadius: '6px',
    gap: '2px',
  },
  tabButton: {
    border: 'none',
    backgroundColor: 'transparent',
    padding: '6px 14px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#52525b',
    cursor: 'pointer',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    color: '#09090b',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  stats: {
    fontSize: '13px',
    color: '#52525b',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid #e4e4e7',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    textAlign: 'left',
  },
  th: {
    backgroundColor: '#fafafa',
    padding: '12px 16px',
    fontWeight: 500,
    color: '#71717a',
    borderBottom: '1px solid #e4e4e7',
  },
  tr: {
    borderBottom: '1px solid #f4f4f5',
    backgroundColor: '#ffffff',
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'top', // Верхнее выравнивание строк удобнее для логов с разной высотой текста
  },
  subId: {
    fontSize: '11px',
    color: '#a1a1aa',
    fontFamily: 'monospace',
    marginTop: '2px',
  },
  userIdBadge: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 500,
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  badge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  textTruncate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  codeStyle: {
    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '12px',
    backgroundColor: '#f8f9fa',
    padding: '2px 4px',
    borderRadius: '4px',
    border: '1px solid #f1f3f5',
  },
  emptyText: {
    color: '#a1a1aa',
    fontStyle: 'italic',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '28px',
  },
  pagButton: {
    backgroundColor: '#ffffff',
    border: '1px solid #e4e4e7',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#18181b',
    fontWeight: 500,
  },
  pagButtonDisabled: {
    color: '#a1a1aa',
    borderColor: '#f4f4f5',
    cursor: 'not-allowed',
  },
  pagInfo: {
    fontSize: '13px',
    color: '#71717a',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#71717a',
    padding: '64px 20px',
    border: '1px dashed #e4e4e7',
    borderRadius: '8px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '80px',
    color: '#71717a',
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