/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// For demo purposes, we'll create a mock client if no credentials are provided
// OR if we explicitly want to force mock mode (e.g. when Supabase is having issues)
const FORCE_MOCK_MODE = false

export const supabase = (supabaseUrl && supabaseAnonKey && !FORCE_MOCK_MODE)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isMockMode = !supabase || FORCE_MOCK_MODE

// Mock authentication function for demo
export const mockAuth = {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock validation
        if (email && password.length >= 6) {
            // Determine role from email for demo
            const role = email.includes('tutor') ? 'tutor' : 'parent'

            const user = {
                id: 'mock-user-id',
                email,
                full_name: email.split('@')[0],
                role: role as 'tutor' | 'parent' | 'admin'
            }

            localStorage.setItem('mockUser', JSON.stringify(user))

            return {
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        user_metadata: {
                            full_name: user.full_name,
                            role: user.role,
                        }
                    },
                    session: {
                        access_token: 'mock-token',
                    }
                },
                error: null
            }
        }

        return {
            data: { user: null, session: null },
            error: { message: 'Invalid credentials' }
        }
    },

    signIn(email: string, password: string, role: 'tutor' | 'parent') {
        // Simple mock validation
        if (email && password.length >= 6) {
            const user = {
                id: 'mock-user-id',
                email,
                full_name: email.split('@')[0],
                role: role
            }

            localStorage.setItem('mockUser', JSON.stringify(user))

            return { error: null }
        }

        return { error: { message: 'Invalid credentials' } }
    },

    getCurrentUser() {
        const mockUserStr = localStorage.getItem('mockUser')
        if (mockUserStr) {
            return JSON.parse(mockUserStr)
        }
        return null
    },

    async signOut() {
        await new Promise(resolve => setTimeout(resolve, 500))
        localStorage.removeItem('mockUser')
        return { error: null }
    }
}
