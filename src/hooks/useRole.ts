import { useAuth } from './useAuth'

export function useRole() {
  const { profile, loading } = useAuth()

  const role = profile?.role ?? null

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isOwner: role === 'owner',
    isStaff: role === 'staff',
    isCustomer: role === 'customer',
  }
}
