import { supabase } from './supabase'

// Database types
export interface TutorProfile {
    bio: string
    subjects: string[]
    experience_years: number
    highest_qualification: string
    languages_spoken?: string[]
    teaching_methodology?: string
    preferred_age_groups?: string[]
    specializations?: string[]
    teaching_mode?: 'online' | 'in-person' | 'both'
    location_areas: string[]
    availability_schedule?: any
    hourly_rate_min?: number
    hourly_rate_max?: number
    verification_status?: 'pending' | 'approved' | 'rejected'
}

export interface ParentProfile {
    location_address: string
    location_lat?: number
    location_lng?: number
    preferred_subjects?: string[]
    preferred_schedule?: any
    budget_min?: number
    budget_max?: number
}

/**
 * Create a tutor profile for a newly registered user
 */
export async function createTutorProfile(userId: string, data: Partial<TutorProfile>) {
    if (!supabase) throw new Error('Supabase client not initialized')

    const tutorData: any = {
        user_id: userId,
        bio: data.bio || 'New tutor - bio coming soon!',
        subjects: data.subjects || [],
        experience_years: data.experience_years || 0,
        highest_qualification: data.highest_qualification || 'Not specified',
        languages_spoken: data.languages_spoken || ['English'],
        location_areas: data.location_areas || [],
        verification_status: 'pending',
    }

    // Add optional fields if provided
    if (data.teaching_methodology) tutorData.teaching_methodology = data.teaching_methodology
    if (data.preferred_age_groups) tutorData.preferred_age_groups = data.preferred_age_groups
    if (data.availability_schedule) tutorData.availability_schedule = data.availability_schedule
    if (data.hourly_rate_min !== undefined) tutorData.hourly_rate_min = data.hourly_rate_min
    if (data.hourly_rate_max !== undefined) tutorData.hourly_rate_max = data.hourly_rate_max

    const { data: tutor, error } = await supabase
        .from('tutors')
        .insert([tutorData])
        .select()
        .single()

    if (error) {
        console.error('Error creating tutor profile:', error)
        throw error
    }

    return tutor
}

/**
 * Create a parent profile for a newly registered user
 */
export async function createParentProfile(userId: string, data: Partial<ParentProfile>) {
    if (!supabase) throw new Error('Supabase client not initialized')

    const parentData: any = {
        user_id: userId,
        location_address: data.location_address || 'Not specified',
    }

    // Add optional fields if provided
    if (data.location_lat !== undefined) parentData.location_lat = data.location_lat
    if (data.location_lng !== undefined) parentData.location_lng = data.location_lng
    if (data.preferred_subjects) parentData.preferred_subjects = data.preferred_subjects
    if (data.preferred_schedule) parentData.preferred_schedule = data.preferred_schedule
    if (data.budget_min !== undefined) parentData.budget_min = data.budget_min
    if (data.budget_max !== undefined) parentData.budget_max = data.budget_max

    const { data: parent, error } = await supabase
        .from('parents')
        .insert([parentData])
        .select()
        .single()

    if (error) {
        console.error('Error creating parent profile:', error)
        throw error
    }

    return parent
}

/**
 * Get complete user profile with role-specific data
 */
export async function getUserProfile(userId: string) {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching user profile:', error)
        throw error
    }

    return data
}

/**
 * Get tutor profile by user ID
 */
export async function getTutorProfile(userId: string) {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error) {
        console.error('Error fetching tutor profile:', error)
        return null
    }

    return data
}

/**
 * Get parent profile by user ID
 */
export async function getParentProfile(userId: string) {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error) {
        console.error('Error fetching parent profile:', error)
        return null
    }

    return data
}

/**
 * Get children for a parent
 */
export async function getChildren(parentId: string) {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching children:', error)
        throw error
    }

    return data
}

/**
 * Update tutor profile - uses upsert to create if doesn't exist
 */
export async function updateTutorProfile(userId: string, updates: Partial<TutorProfile>) {
    if (!supabase) throw new Error('Supabase client not initialized')

    // Prepare the data with user_id for upsert
    const tutorData: any = {
        user_id: userId,
        ...updates
    }

    console.log('[updateTutorProfile] Attempting upsert with data:', tutorData)

    try {
        // Use upsert to create or update the profile
        const { data, error } = await supabase
            .from('tutors')
            .upsert(tutorData, {
                onConflict: 'user_id',
                ignoreDuplicates: false
            })
            .select()
            .single()

        if (error) {
            console.error('[updateTutorProfile] Upsert error:', error)
            throw error
        }

        console.log('[updateTutorProfile] Upsert successful:', data)
        return data
    } catch (error: any) {
        console.error('[updateTutorProfile] Caught error:', error)
        console.error('[updateTutorProfile] Error message:', error.message)

        // Check for schema cache error or missing column error
        if (error.message?.includes('schema cache') || error.message?.includes('specializations') || error.message?.includes('teaching_mode')) {
            console.warn('[updateTutorProfile] Schema mismatch detected. Retrying without new columns...')

            // Create a copy without the new columns
            const { specializations, teaching_mode, ...safeData } = tutorData

            console.log('[updateTutorProfile] Retry attempt with safe data:', safeData)

            const { data, error: retryError } = await supabase
                .from('tutors')
                .upsert(safeData, {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                })
                .select()
                .single()

            if (retryError) {
                console.error('[updateTutorProfile] Retry failed:', retryError)
                throw retryError
            }

            console.log('[updateTutorProfile] Retry successful:', data)
            return data
        }

        throw error
    }
}

/**
 * Update parent profile
 */
export async function updateParentProfile(userId: string, updates: Partial<ParentProfile>) {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
        .from('parents')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error updating parent profile:', error)
        throw error
    }

    return data
}


/**
 * Search tutors with filters
 */
export async function searchTutors(filters: {
    subject?: string
    location?: string
    minRating?: number
    minPrice?: number
    maxPrice?: number
    searchQuery?: string
}) {
    if (!supabase) throw new Error('Supabase client not initialized')

    let query = supabase
        .from('tutors')
        .select('*')
        .eq('verification_status', 'approved')

    if (filters.subject) {
        query = query.contains('subjects', [filters.subject])
    }

    if (filters.location) {
        query = query.contains('location_areas', [filters.location])
    }

    if (filters.minRating) {
        query = query.gte('rating_average', filters.minRating)
    }

    if (filters.minPrice) {
        query = query.gte('hourly_rate_min', filters.minPrice)
    }

    if (filters.maxPrice) {
        query = query.lte('hourly_rate_max', filters.maxPrice)
    }

    const { data: tutors, error } = await query

    if (error) {
        console.error('Error searching tutors:', error)
        console.error('Query details:', { filters })
        throw error
    }

    if (!tutors || tutors.length === 0) return []

    // Fetch user details for these tutors
    const userIds = tutors.map(t => t.user_id)
    const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .in('id', userIds)

    if (profilesError) {
        console.error('Error fetching tutor profiles:', profilesError)
        return tutors // Return tutors without names if profile fetch fails
    }

    // Combine data
    return tutors.map(tutor => {
        const profile = profiles?.find(p => p.id === tutor.user_id)
        return {
            ...tutor,
            user: {
                raw_user_meta_data: {
                    full_name: profile?.full_name || 'Unknown Tutor',
                    avatar_url: null
                }
            }
        }
    })
}
