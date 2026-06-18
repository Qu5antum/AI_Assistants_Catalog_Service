import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

const pageSize = 6

export default function Assistants() {
  const { role } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
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
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [includeInactive])

  const filtered = useMemo(() => {
    return items
      .filter((assistant) => (categoryId ? assistant.category_id === categoryId : true))
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

  if (loading) return <div>Loading assistants...</div>
  if (error) return <div>Error loading assistants: {error}</div>

  return (
    <div>
      <h2>Assistants</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <label>
          Search
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or description" />
        </label>
        <label>
          Category
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        {role === 'ADMIN' && (
          <label>
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
            />
            Show inactive
          </label>
        )}
      </div>
      {visible.length === 0 ? (
        <div>No assistants found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Name</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Description</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Category</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Model</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((assistant) => (
              <tr key={assistant.id}>
                <td style={{ padding: '8px 4px' }}>
                  <Link to={`/assistants/${assistant.id}`}>{assistant.name}</Link>
                </td>
                <td style={{ padding: '8px 4px' }}>{assistant.description}</td>
                <td style={{ padding: '8px 4px' }}>{assistant.category?.name || assistant.category_id}</td>
                <td style={{ padding: '8px 4px' }}>{assistant.model}</td>
                <td style={{ padding: '8px 4px' }}>{assistant.is_active ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: 16 }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span style={{ margin: '0 12px' }}>
          Page {page} of {pageCount}
        </span>
        <button disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}
