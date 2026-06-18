import { useEffect, useMemo, useState } from 'react'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

const statusFilters = ['all', 'pending', 'success', 'failed'] as const

type StatusFilter = (typeof statusFilters)[number]

export default function RunsMy() {
  const [runs, setRuns] = useState<any[]>([])
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
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return runs.filter((run) => statusFilter === 'all' || run.status === statusFilter)
  }, [runs, statusFilter])

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))

  if (loading) return <div>Loading runs...</div>
  if (error) return <div>Error loading runs: {error}</div>

  return (
    <div>
      <h2>My Runs</h2>
      <div style={{ marginBottom: 12 }}>
        <label>
          Status:
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
      {paged.length === 0 ? (
        <div>No runs available.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Assistant</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Status</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Date</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Prompt</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((run) => (
              <tr key={run.id}>
                <td style={{ padding: '8px 4px' }}>{run.assistant?.name}</td>
                <td style={{ padding: '8px 4px' }}>{run.status}</td>
                <td style={{ padding: '8px 4px' }}>{new Date(run.created_at).toLocaleString()}</td>
                <td style={{ padding: '8px 4px' }}>{run.user_prompt.slice(0, 50)}</td>
                <td style={{ padding: '8px 4px' }}>
                  <button onClick={() => navigate(`/assistants/${run.assistant_id}`)}>Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: 12 }}>
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
