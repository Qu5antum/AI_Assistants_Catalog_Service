import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

export default function AdminAssistantsNew() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('gpt-4')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [examplePrompt, setExamplePrompt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.getCategories().then((data) => setCategories(data || [])).catch(console.error)
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !description.trim() || !systemPrompt.trim() || !examplePrompt.trim() || !categoryId) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.createAssistant({ name, description, model, system_prompt: systemPrompt, example_prompt: examplePrompt, category_id: categoryId, is_active: isActive })
      navigate('/assistants')
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>New Assistant</h2>
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
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Model
            <input value={model} onChange={(e) => setModel(e.target.value)} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Category
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Active
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            System Prompt
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={4} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Example Prompt
            <textarea value={examplePrompt} onChange={(e) => setExamplePrompt(e.target.value)} rows={4} />
          </label>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Create Assistant'}
        </button>
      </form>
    </div>
  )
}
