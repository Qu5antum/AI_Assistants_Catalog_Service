import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/api'

export default function AdminAssistantEdit() {
  const { id } = useParams()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [examplePrompt, setExamplePrompt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.getCategories().then((data) => setCategories(data || [])).catch(console.error)
    if (!id) return
    api.getAssistant(id)
      .then((assistant) => {
        setName(assistant.name)
        setDescription(assistant.description)
        setModel(assistant.model)
        setSystemPrompt(assistant.system_prompt)
        setExamplePrompt(assistant.example_prompt)
        setCategoryId(assistant.category_id)
        setIsActive(assistant.is_active)
      })
      .catch(console.error)
  }, [id])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!id) return
    if (!name.trim() || !description.trim() || !systemPrompt.trim() || !examplePrompt.trim() || !categoryId) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    setError(null)
    try {
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
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Edit Assistant</h2>
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
        <div style={{ marginBottom: 12 }}>
          <label>
            Active
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          </label>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
