import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase/mobile'
import type { User } from '@supabase/supabase-js'

interface UseAuthOptions {
    /** If true, redirects to login when not authenticated (default: true) */
    redirectOnUnauthenticated?: boolean
    /** Custom redirect path (default: '/auth/login') */
    redirectPath?: string
}

interface UseAuthReturn {
    /** The authenticated user, or null if not logged in */
    user: User | null
    /** User ID for convenience */
    userId: string | null
    /** Whether the auth check is still in progress */
    loading: boolean
    /** Whether the user is authenticated */
    isAuthenticated: boolean
    /** Force refresh the auth state */
    refresh: () => Promise<void>
    /** Sign out the user */
    signOut: () => Promise<void>
}

/**
 * Hook for managing authentication state
 * Automatically checks auth status and optionally redirects to login
 * 
 * @example
 * ```tsx
 * const { user, userId, loading } = useAuth()
 * 
 * if (loading) return <LoadingSpinner />
 * // user is guaranteed to be authenticated here (or redirected)
 * ```
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
    const {
        redirectOnUnauthenticated = true,
        redirectPath = '/auth/login',
    } = options

    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const checkAuth = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error || !user) {
                setUser(null)
                if (redirectOnUnauthenticated) {
                    router.replace(redirectPath)
                }
            } else {
                setUser(user)
            }
        } catch (error) {
            console.error('Auth check error:', error)
            setUser(null)
            if (redirectOnUnauthenticated) {
                router.replace(redirectPath)
            }
        } finally {
            setLoading(false)
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
            router.replace('/auth/login')
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    useEffect(() => {
        checkAuth()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    setUser(null)
                    if (redirectOnUnauthenticated) {
                        router.replace(redirectPath)
                    }
                } else if (session?.user) {
                    setUser(session.user)
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return {
        user,
        userId: user?.id ?? null,
        loading,
        isAuthenticated: !!user,
        refresh: checkAuth,
        signOut,
    }
}

/**
 * Hook that only returns the current user without redirect
 * Useful for optional auth checks
 */
export function useCurrentUser() {
    return useAuth({ redirectOnUnauthenticated: false })
}
