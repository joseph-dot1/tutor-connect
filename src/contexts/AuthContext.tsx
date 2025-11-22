import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, mockAuth, isMockMode } from '../lib/supabase'

interface User {
    id: string
    email: string
    full_name: string
    role: 'tutor' | 'parent' | 'admin'
}

interface AuthContextType {
    user: User | null
    session: any | null
    loading: boolean
    signIn: (email: string, password: string, role: 'tutor' | 'parent') => Promise<{ error: any }>
    signOut: () => Promise<void>
    isMockMode: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for existing session
        checkUser()

        // Listen for auth changes
        if (!isMockMode && supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: session.user.user_metadata.full_name,
                        role: session.user.user_metadata.role,
                    })
                    setSession(session)
                } else {
                    setUser(null)
                    setSession(null)
                }
                setLoading(false)
            })

            return () => subscription.unsubscribe()
        }
    }, [])

    async function checkUser() {
        try {
            if (isMockMode) {
                const mockUser = mockAuth.getCurrentUser()
                setUser(mockUser)
                // Create a mock session object for API calls
                if (mockUser) {
                    setSession({
                        access_token: 'mock-token',
                        user: mockUser
                    })
                }
                setLoading(false)
            } else {
                const { data: { session } } = await supabase!.auth.getSession()
                if (session) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: session.user.user_metadata.full_name,
                        role: session.user.user_metadata.role,
                    })
                    setSession(session)
                }
                setLoading(false)
            }
        } catch (error) {
            console.error('Error checking user:', error)
            setLoading(false)
        }
    }

    async function signIn(email: string, password: string, role: 'tutor' | 'parent') {
        if (isMockMode) {
            const result = mockAuth.signIn(email, password, role)
            if (!result.error) {
                const mockUser = mockAuth.getCurrentUser()
                setUser(mockUser)
                // Create mock session
                if (mockUser) {
                    setSession({
                        access_token: 'mock-token',
                        user: mockUser
                    })
                }
            }
            return result
        } else {
            const { data, error } = await supabase!.auth.signInWithPassword({
                email,
                password,
            })

            if (error) return { error }

            if (data.user) {
                setUser({
                    id: data.user.id,
                    email: data.user.email!,
                    full_name: data.user.user_metadata.full_name,
                    role: data.user.user_metadata.role,
                })
                setSession(data.session)
            }

            return { error: null }
        }
    }

    async function signOut() {
        if (isMockMode) {
            localStorage.removeItem('mockUser')
            setUser(null)
            setSession(null)
        } else {
            await supabase!.auth.signOut()
            setUser(null)
            setSession(null)
        }
    }

    const value = {
        user,
        session,
        loading,
        signIn,
        signOut,
        isMockMode,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
