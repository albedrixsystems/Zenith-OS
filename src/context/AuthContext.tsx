import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User, UserRole } from '../types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role?: UserRole) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEMO_USERS: User[] = [
  { id: 'u1', name: 'Divya Menon', email: 'admin@zenithcreative.in', role: 'super_admin', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'u2', name: 'Rahul Iyer', email: 'team@zenithcreative.in', role: 'team_member', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'u3', name: 'Arjun Sharma', email: 'client@novatech.com', role: 'client', createdAt: '2024-01-01T00:00:00Z' },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, _password: string, role?: UserRole) => {
    await new Promise(r => setTimeout(r, 800))
    let found = DEMO_USERS.find(u => u.email === email)
    if (!found && role) {
      found = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0]
    }
    setUser(found || DEMO_USERS[0])
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
