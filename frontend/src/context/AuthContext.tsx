import React, { createContext, useContext, useEffect, useState } from 'react'
import api, { getRole as apiGetRole, logout as apiLogout } from '../api/api'

type AuthContextType = {
  token: string | null
  role: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'))
  const [role, setRole] = useState<string | null>(() => apiGetRole())

  useEffect(() => {
    setToken(localStorage.getItem('access_token'))
    setRole(apiGetRole())
  }, [])

  async function login(email: string, password: string) {
    await api.login(email, password)
    setToken(localStorage.getItem('access_token'))
    setRole(apiGetRole())
  }

  function logout() {
    apiLogout()
    setToken(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
