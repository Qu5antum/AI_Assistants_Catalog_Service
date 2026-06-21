import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

const pageSize = 6

// Типизация для категорий
interface Category {
  id: string | number
  name: string
}

// Типизация для ИИ-Ассистента
interface Assistant {
  id: string | number
  name: string
  description?: string
  category_id?: string | number
  category?: { name: string }
  model: string
  is_active: boolean
}

export default function Assistants() {
  const { role } = useAuth()
  const [items, setItems] = useState<Assistant[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([api.getCategories(), api.getAssistants(includeInactive)])
      .then(([catData, assistantData]) => {
        setCategories(catData || [])
        setItems(assistantData || [])
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [includeInactive])

  // Сброс страницы при поиске
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const filtered = useMemo(() => {
    return items
      .filter((assistant) => (categoryId ? assistant.category_id === String(categoryId) || assistant.category_id === Number(categoryId) : true))
      .filter((assistant) => {
        if (!search.trim()) return true
        const query = search.toLowerCase()
        return (
          assistant.name?.toLowerCase().includes(query) ||
          assistant.description?.toLowerCase().includes(query)
        )
      })
  }, [items, categoryId, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  return (
    <div style={styles.container}>
      {/* Шапка */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>ИИ-Ассистенты</h2>
          <p style={styles.subtitle}>Библиотека специализированных агентов для ваших задач</p>
        </div>
      </div>

      {/* Панель фильтров и поиска */}
      <div style={styles.searchBar}>
        <div style={styles.inputWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Поиск по названию или описанию..."
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}
            style={styles.select}
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {role === 'admin' && (
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => { setIncludeInactive(e.target.checked); setPage(1); }}
                style={styles.checkbox}
              />
              Показать неактивные
            </label>
          )}
        </div>
      </div>

      {/* Состояние ошибки */}
      {error && <div style={styles.errorContainer}>Ошибка: {error}</div>}

      {/* Контентная зона (Загрузка / Пусто / Карточки) */}
      {loading ? (
        <div style={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} style={{ ...styles.card, ...styles.skeletonCard }}>
              <div style={styles.skeletonBadge}></div>
              <div style={styles.skeletonTitle}></div>
              <div style={styles.skeletonText}></div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div style={styles.emptyState}>Ассистенты не найдены. Попробуйте изменить параметры фильтра.</div>
      ) : (
        <div style={styles.grid}>
          {visible.map((assistant) => (
            <div key={assistant.id} style={styles.card}>
              <div>
                {/* Метки/Бэджи (Категория и Модель) */}
                <div style={styles.cardMetaRow}>
                  <span style={styles.categoryBadge}>
                    {assistant.category?.name || 'Без категории'}
                  </span>
                  <span style={styles.modelBadge}>{assistant.model}</span>
                </div>

                {/* Название */}
                <h3 style={styles.cardTitle}>
                  <Link to={`/assistants/${assistant.id}`} style={styles.cardLink}>
                    {assistant.name}
                  </Link>
                </h3>

                {/* Описание */}
                <p style={styles.cardDescription}>{assistant.description}</p>
              </div>

              {/* Футер карточки (Статус и кнопки действий) */}
              <div style={styles.cardFooter}>
                <span style={{
                  ...styles.statusIndicator,
                  color: assistant.is_active ? '#15803d' : '#71717a'
                }}>
                  <span style={{
                    ...styles.statusDot,
                    backgroundColor: assistant.is_active ? '#22c55e' : '#a1a1aa'
                  }} />
                  {assistant.is_active ? 'Активен' : 'Неактивен'}
                </span>

                <div style={styles.buttonGroup}>
                  {role === 'admin' && (
                    <Link to={`/admin/assistants/${assistant.id}/edit`} style={styles.editButton}>
                      Редактировать
                    </Link>
                  )}
                  <Link to={`/assistants/${assistant.id}`} style={styles.runButton}>
                    Запустить →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Пагинация */}
      {!loading && visible.length > 0 && (
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

// Премиальные UI стили (Сетка карточек, минималистичные бэджи)
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
  title: {
    fontSize: '28px',
    fontWeight: 600,
    color: '#09090b',
    margin: '0 0 6px 0',
    letterSpacing: '-0.6px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#71717a',
    margin: 0,
  },
  searchBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    maxWidth: '450px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#a1a1aa',
    fontSize: '14px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 36px',
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#3f3f46',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    cursor: 'pointer',
    accentColor: '#18181b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    border: '1px solid #e4e4e7',
    borderRadius: '12px',
    padding: '24px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
  },
  cardMetaRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: '#f4f4f5',
    color: '#18181b',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
  },
  modelBadge: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: 'monospace',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: '0 0 10px 0',
  },
  cardLink: {
    color: '#09090b',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#52525b',
    lineHeight: '1.5',
    margin: '0 0 24px 0',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardFooter: {
    borderTop: '1px solid #f4f4f5',
    paddingTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  buttonGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 500,
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  editButton: {
    backgroundColor: '#e2e8f0',
    color: '#0f172a',
    textDecoration: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background-color 0.2s, transform 0.2s',
  },
  editButtonHover: {
    backgroundColor: '#cbd5e1',
  },
  runButton: {
    backgroundColor: '#18181b',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '40px',
  },
  pagButton: {
    backgroundColor: '#ffffff',
    border: '1px solid #e4e4e7',
    padding: '8px 16px',
    borderRadius: '8px',
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
    fontSize: '14px',
    color: '#71717a',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#991b1b',
    padding: '14px',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#71717a',
    padding: '60px 20px',
    border: '1px dashed #e4e4e7',
    borderRadius: '12px',
    fontSize: '15px',
  },
  // Скелетоны для загрузки
  skeletonCard: {
    borderColor: '#f4f4f5',
    pointerEvents: 'none',
  },
  skeletonBadge: {
    height: '22px',
    width: '80px',
    backgroundColor: '#f4f4f5',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  skeletonTitle: {
    height: '24px',
    width: '140px',
    backgroundColor: '#f4f4f5',
    borderRadius: '4px',
    marginBottom: '12px',
  },
  skeletonText: {
    height: '50px',
    backgroundColor: '#f4f4f5',
    borderRadius: '4px',
  },
}