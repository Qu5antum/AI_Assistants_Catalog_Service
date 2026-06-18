const BASE = "http://127.0.0.1:8000"

function getToken() {
  return localStorage.getItem('access_token')
}

function setToken(token: string) {
  localStorage.setItem('access_token', token)
}

function getRole() {
  return (localStorage.getItem('role') || null)
}

function setRole(role: string) {
  localStorage.setItem('role', role)
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('role')
}

async function request(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  }

  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText} - ${text}`)
  }
  return res.json()
}

export async function login(email: string, password: string) {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)

  const res = await fetch(`${BASE}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Login failed: ${text}`)
  }

  const data = await res.json()
  setToken(data.access_token)
  setRole(data.role ?? 'user')
  return data
}

export async function register(user: { email: string; password: string; role: string }) {
  return request('/api/user/register', { method: 'POST', body: JSON.stringify(user) })
}

export { getRole }

export async function getAssistants(includeInactive = false) {
  const params = includeInactive ? '?includeInactive=true' : ''
  return request(`/api/assistants${params}`)
}

export async function getAssistant(id: string) {
  return request(`/api/assistant/${id}`)
}

export async function searchAssistant(name: string, includeInactive = false) {
  const params = includeInactive ? '?includeInactive=true' : ''
  return request(`/api/assistant/search/${encodeURIComponent(name)}${params}`)
}

export async function getAssistantsByCategory(categoryId: string, includeInactive = false) {
  const params = includeInactive ? '?includeInactive=true' : ''
  return request(`/api/assistant/category/${categoryId}${params}`)
}

export async function runAssistant(assistantId: string, user_prompt: string) {
  return request(`/api/assistants/${assistantId}/run`, {
    method: 'POST',
    body: JSON.stringify({ user_prompt }),
  })
}

export async function getMyRuns() {
  return request('/api/runs/my')
}

export async function getCategories() {
  return request('/api/categories')
}

export async function createCategory(category: { name: string; description: string }) {
  return request('/api/admin/category/create', {
    method: 'POST',
    body: JSON.stringify(category),
  })
}

export async function createAssistant(assistant: {
  name: string
  description: string
  model: string
  system_prompt: string
  example_prompt: string
  category_id: string
  is_active?: boolean
}) {
  return request('/api/admin/create/assistant', {
    method: 'POST',
    body: JSON.stringify(assistant),
  })
}

export async function updateAssistant(assistantId: string, assistant: {
  name?: string
  description?: string
  model?: string
  system_prompt?: string
  example_prompt?: string
  category_id?: string
}) {
  return request(`/api/admin/update/assistant/${assistantId}`, {
    method: 'PUT',
    body: JSON.stringify(assistant),
  })
}

export async function getAdminRuns() {
  return request('/api/admin/runs')
}

export default {
  register,
  login,
  getAssistants,
  getAssistant,
  searchAssistant,
  getAssistantsByCategory,
  runAssistant,
  getMyRuns,
  getCategories,
  createCategory,
  createAssistant,
  updateAssistant,
  getAdminRuns,
}
