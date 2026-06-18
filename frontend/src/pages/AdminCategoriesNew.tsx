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
      setError('Name and description are required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.createCategory({ name, description })
      navigate('/categories')
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>New Category</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </label>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Create Category'}
        </button>
      </form>
    </div>
  )
}
