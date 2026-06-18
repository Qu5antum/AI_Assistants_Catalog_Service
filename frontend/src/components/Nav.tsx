import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
  const { token, role, logout } = useAuth()

  return (
    <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
      <Link to="/assistants" style={{ marginRight: 12 }}>Assistants</Link>
      <Link to="/runs/my" style={{ marginRight: 12 }}>My Runs</Link>
      <Link to="/categories" style={{ marginRight: 12 }}>Categories</Link>
      {token && role === 'admin' && (
        <>
          <Link to="/admin/categories/new" style={{ marginRight: 12 }}>New Category</Link>
          <Link to="/admin/assistants/new" style={{ marginRight: 12 }}>New Assistant</Link>
          <Link to="/admin/runs" style={{ marginRight: 12 }}>All Runs</Link>
        </>
      )}
      {token ? (
        <>
          <span style={{ marginRight: 12 }}>Role: {role?.toLowerCase()}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  )
}
