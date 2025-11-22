import { supabase } from '../lib/supabase'

export async function updateUserProfile(updates: {
    full_name?: string
    phone?: string
    avatar_url?: string
}) {
    if (!supabase) {
        throw new Error('Supabase client not initialized')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        throw new Error('Not authenticated')
    }

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
        data: {
            ...user.user_metadata,
            ...updates
        }
    })

    if (updateError) {
        throw updateError
    }

    return { success: true }
}

export async function getUserProfile() {
    if (!supabase) {
        throw new Error('Supabase client not initialized')
    }

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error('Not authenticated')
    }

    return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        role: user.user_metadata?.role || ''
    }
}

