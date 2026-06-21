import { useEffect, useState } from 'react'
import api from '../api/api'

// Определяем интерфейс категории для строгой типизации
interface Category {
  id: string | number
  name: string
  description?: string
  icon?: string // На будущее, если бэкенд будет отдавать эмодзи или имя иконки
}

export default function Categories() {
  const [cats, setCats] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    api.getCategories()
      .then((r) => {
        setCats(r || [])
      })
      .catch((err) => {
        console.error(err)
        setError('Не удалось загрузить категории. Пожалуйста, обновите страницу.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <div style={styles.container}>
      {/* Заголовок секции */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Категории ассистентов</h2>
          <p style={styles.subtitle}>Выберите направление для создания или настройки вашего ИИ-агента</p>
        </div>
        {/* Кнопка на будущее, часто бывает на официальных страницах */}
        <button style={styles.actionButton}>+ Добавить</button>
      </div>

      {/* Состояние ошибки */}
      {error && <div style={styles.errorContainer}>{error}</div>}

      {/* Состояние загрузки (Скелетоны) */}
      {isLoading && (
        <div style={styles.grid}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ ...styles.card, ...styles.skeletonCard }}>
              <div style={styles.skeletonTitle}></div>
              <div style={styles.skeletonText}></div>
            </div>
          ))}
        </div>
      )}

      {/* Основной контент */}
      {!isLoading && !error && (
        cats.length === 0 ? (
          <div style={styles.emptyState}>Категории пока не созданы.</div>
        ) : (
          <div style={styles.grid}>
            {cats.map((c) => (
              <div key={c.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  {/* Дефолтная иконка-сфера, если с бэкенда ничего не пришло */}
                  <span style={styles.cardIcon}>{c.icon || '🔮'}</span>
                  <h3 style={styles.cardTitle}>{c.name}</h3>
                </div>
                <p style={styles.cardDescription}>
                  {c.description || 'Описание для этой категории ИИ-ассистентов не задано.'}
                </p>
                <div style={styles.cardFooter}>
                  <span style={styles.cardLink}>Обзор шаблонов →</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

// Стили в стиле современных AI дашбордов (минимализм, серая гамма, тонкие границы)
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '40px 24px',
    maxWidth: '100%',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#ffffff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f4f4f5',
    paddingBottom: '24px',
    marginBottom: '32px',
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
  actionButton: {
    backgroundColor: '#18181b',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #e4e4e7',
    borderRadius: '12px',
    padding: '24px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  cardIcon: {
    fontSize: '20px',
    backgroundColor: '#f4f4f5',
    padding: '6px',
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#18181b',
    margin: 0,
  },
  cardDescription: {
    fontSize: '14px',
    color: '#71717a',
    lineHeight: '1.5',
    margin: '0 0 20px 0',
    flexGrow: 1,
  },
  cardFooter: {
    borderTop: '1px solid #f4f4f5',
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  cardLink: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#18181b',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#991b1b',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#71717a',
    padding: '40px',
    border: '1px dashed #e4e4e7',
    borderRadius: '12px',
  },
  // Стили для скелетонов (эффект загрузки)
  skeletonCard: {
    borderColor: '#f4f4f5',
    pointerEvents: 'none',
  },
  skeletonTitle: {
    height: '20px',
    backgroundColor: '#f4f4f5',
    borderRadius: '4px',
    marginBottom: '16px',
    width: '60%',
  },
  skeletonText: {
    height: '40px',
    backgroundColor: '#f4f4f5',
    borderRadius: '4px',
    width: '100%',
  },
}