import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Nav from './components/Nav'
import Login from './pages/Login'
import Assistants from './pages/Assistants'
import AssistantPage from './pages/AssistantPage'
import Categories from './pages/Categories'
import RunsMy from './pages/RunsMy'
import AdminCategoriesNew from './pages/AdminCategoriesNew'
import AdminAssistantsNew from './pages/AdminAssistantsNew'
import AdminAssistantEdit from './pages/AdminAssistantEdit'
import AdminRuns from './pages/AdminRuns'
import NotFound from './pages/NotFound'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <main style={{ padding: 16 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/assistants" replace />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/assistants"
              element={
                <ProtectedRoute>
                  <Assistants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistants/:id"
              element={
                <ProtectedRoute>
                  <AssistantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/runs/my"
              element={
                <ProtectedRoute>
                  <RunsMy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories/new"
              element={
                <AdminRoute>
                  <AdminCategoriesNew />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/assistants/new"
              element={
                <AdminRoute>
                  <AdminAssistantsNew />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/assistants/:id/edit"
              element={
                <AdminRoute>
                  <AdminAssistantEdit />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/runs"
              element={
                <AdminRoute>
                  <AdminRuns />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
