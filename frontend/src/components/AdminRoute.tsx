import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, role } = useAuth()

  if (!token) return <Navigate to="/login" replace />
  if (role !== 'admin') return <Navigate to="/assistants" replace />
  return <>{children}</>
}
