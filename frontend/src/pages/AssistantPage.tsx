import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'

export default function AssistantPage() {
  const { id } = useParams()
  const [assistant, setAssistant] = useState<any | null>(null)
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [runError, setRunError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    api.getAssistant(id)
      .then((r) => setAssistant(r))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [id])

  async function handleRun() {
    if (!id) return
    setRunError(null)
    try {
      const r = await api.runAssistant(id, prompt)
      setResult(r)
    } catch (err) {
      setRunError(String(err))
    }
  }

  if (loading) return <div>Loading assistant...</div>
  if (error) return <div>Error loading assistant: {error}</div>
  if (!assistant) return <div>No assistant found.</div>

  return (
    <div>
      <h2>{assistant.name}</h2>
      <p>{assistant.description}</p>
      <p>
        <strong>Category:</strong> {assistant.category?.name || assistant.category_id}
      </p>
      <p>
        <strong>Model:</strong> {assistant.model}
      </p>
      <p>
        <strong>Example prompt:</strong>
      </p>
      <pre style={{ background: '#f7f7f7', padding: 12 }}>{assistant.example_prompt}</pre>
      <div style={{ marginTop: 12 }}>
        <label>
          Your prompt
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} cols={70} />
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleRun}>Run</button>
      </div>
      {runError && <div style={{ color: 'red', marginTop: 12 }}>Error running assistant: {runError}</div>}
      {result && (
        <div style={{ marginTop: 12 }}>
          <h3>Result</h3>
          <pre>{result.output ?? result.error ?? JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
