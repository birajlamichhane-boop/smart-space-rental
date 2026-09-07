import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'

// Pages
import { LandingPage } from './pages/LandingPage'
import { PropertiesPage } from './pages/PropertiesPage'
import { PropertyDetailPage } from './pages/PropertyDetailPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardRouter } from './pages/dashboard/DashboardRouter'
import { MyBookingsPage } from './pages/bookings/MyBookingsPage'
import { BookingConfirmPage } from './pages/bookings/BookingConfirmPage'
import { ManagePropertiesPage } from './pages/properties/ManagePropertiesPage'
import { PropertyApprovalsPage } from './pages/properties/PropertyApprovalsPage'
import { WishlistPage } from './pages/WishlistPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'

// Hooks & Protection
import { useAuth } from './hooks/useAuth'
import { useRole } from './hooks/useRole'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, profile, loading } = useAuth()
  const role = profile?.role ?? null

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#E11D2E] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#0A0A0B] text-[#F5F5F5]">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/:id/confirm"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'owner', 'admin', 'staff']}>
                    <BookingConfirmPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage/properties"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'admin']}>
                    <ManagePropertiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage/approvals"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PropertyApprovalsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
