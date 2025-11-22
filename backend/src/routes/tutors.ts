import { Router, Response } from 'express'
import { supabase } from '../server'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// Mock data for fallback
const MOCK_TUTORS = [
    {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
        user_id: 'mock-tutor-1',
        bio: 'Passionate math tutor with 5 years of experience helping students achieve their best.',
        subjects: ['Mathematics', 'Physics', 'Calculus'],
        experience_years: 5,
        highest_qualification: 'MSc in Mathematics',
        languages_spoken: ['English', 'Spanish'],
        hourly_rate_min: 40,
        hourly_rate_max: 60,
        rating_average: 4.8,
        total_reviews: 12,
        verification_status: 'approved',
        location_areas: ['New York', 'Online'],
        user: {
            raw_user_meta_data: {
                full_name: 'Sarah Jenkins',
                avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
            }
        }
    },
    {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0852',
        user_id: 'mock-tutor-2',
        bio: 'Native French speaker and certified language instructor.',
        subjects: ['French', 'Spanish', 'English Literature'],
        experience_years: 8,
        highest_qualification: 'BA in Linguistics',
        languages_spoken: ['English', 'French', 'Spanish'],
        hourly_rate_min: 35,
        hourly_rate_max: 50,
        rating_average: 4.9,
        total_reviews: 28,
        verification_status: 'approved',
        location_areas: ['London', 'Online'],
        user: {
            raw_user_meta_data: {
                full_name: 'Jean-Pierre Dubois',
                avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
            }
        }
    },
    {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0853',
        user_id: 'mock-tutor-3',
        bio: 'Chemistry and Biology expert. I make science fun and understandable.',
        subjects: ['Chemistry', 'Biology', 'General Science'],
        experience_years: 3,
        highest_qualification: 'BSc in Chemistry',
        languages_spoken: ['English'],
        hourly_rate_min: 30,
        hourly_rate_max: 45,
        rating_average: 4.7,
        total_reviews: 8,
        verification_status: 'approved',
        location_areas: ['Online'],
        user: {
            raw_user_meta_data: {
                full_name: 'Emily Chen',
                avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80'
            }
        }
    }
]

// GET /api/tutors - List all tutors (with filters)
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { subject, minPrice, maxPrice, rating } = req.query

        let query = supabase
            .from('tutors')
            .select('*')
            .eq('verification_status', 'approved')

        // Apply filters
        if (subject) {
            query = query.contains('subjects', [subject])
        }
        if (minPrice) {
            query = query.gte('hourly_rate_min', minPrice)
        }
        if (maxPrice) {
            query = query.lte('hourly_rate_max', maxPrice)
        }
        if (rating) {
            query = query.gte('rating_average', rating)
        }

        const { data: tutors, error } = await query

        if (error) {
            console.error('Supabase error:', error)
            // Fallback to mock data if DB error (e.g. connection issue)
            return res.json(MOCK_TUTORS)
        }

        // If no tutors found in DB, return mock data for demo purposes
        if (!tutors || tutors.length === 0) {
            return res.json(MOCK_TUTORS)
        }

        // Fetch user profiles for all tutors
        const tutorIds = tutors.map(t => t.user_id)
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('id, full_name, avatar_url, email')
            .in('id', tutorIds)

        // Create a map for quick lookup
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

        // Combine tutor data with user profiles
        const enrichedTutors = tutors.map(tutor => {
            const profile = profileMap.get(tutor.user_id)
            let displayName = profile?.full_name || 'Unknown Tutor'

            // Generate fallback name from email if needed
            if (!profile?.full_name && profile?.email) {
                const emailPrefix = profile.email.split('@')[0]
                displayName = emailPrefix
                    .replace(/[._-]/g, ' ')
                    .split(' ')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
            }

            return {
                ...tutor,
                user: {
                    raw_user_meta_data: {
                        full_name: displayName,
                        avatar_url: profile?.avatar_url
                    }
                }
            }
        })

        res.json(enrichedTutors)
    } catch (error) {
        console.error('Error fetching tutors:', error)
        res.status(500).json({ error: 'Failed to fetch tutors' })
    }
})

// GET /api/tutors/:id - Get tutor details
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params

        // Check mock data first if ID matches mock format
        const mockTutor = MOCK_TUTORS.find(t => t.id === id)
        if (mockTutor) {
            return res.json(mockTutor)
        }

        // 1. Fetch tutor details
        const { data: tutor, error } = await supabase
            .from('tutors')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching tutor:', error)
            return res.status(404).json({
                error: 'Tutor not found',
                details: error,
                queriedId: id
            })
        }

        // 2. Fetch user profile for name/avatar
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('full_name, avatar_url, email')
            .eq('id', tutor.user_id)
            .single()

        if (profileError) {
            console.warn('Error fetching user profile:', profileError)
        }

        // Generate fallback name from email if full_name is missing
        let displayName = profile?.full_name || 'Unknown Tutor'
        if (!profile?.full_name && profile?.email) {
            // Extract name from email (e.g., "john.doe@example.com" -> "John Doe")
            const emailPrefix = profile.email.split('@')[0]
            displayName = emailPrefix
                .replace(/[._-]/g, ' ')
                .split(' ')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        }

        // 3. Fetch reviews (optional, can be separate call or separate query)
        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select(`
                id, rating, comment, created_at,
                parent:parents(user_id)
            `)
            .eq('tutor_id', id)

        // Note: For reviews, we might need to fetch parent names separately too if joins fail
        // For now, let's just return what we have

        // Combine data
        const result = {
            ...tutor,
            user: {
                raw_user_meta_data: {
                    full_name: displayName,
                    avatar_url: profile?.avatar_url
                }
            },
            reviews: reviews || []
        }

        res.json(result)
    } catch (error) {
        console.error('Error fetching tutor details:', error)
        res.status(500).json({ error: 'Failed to fetch tutor details' })
    }
})

export default router
