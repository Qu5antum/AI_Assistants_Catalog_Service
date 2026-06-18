import { useEffect, useState } from 'react'
import api from '../api/api'

export default function Categories() {
  const [cats, setCats] = useState<any[]>([])

  useEffect(() => {
    api.getCategories().then((r) => setCats(r || [])).catch(console.error)
  }, [])

  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {cats.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> — <span>{c.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
