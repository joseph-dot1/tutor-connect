import { Router, Response } from 'express'
import { supabase } from '../server'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// POST /api/reviews - Create a new review
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { tutor_id, rating, comment, tags } = req.body
        const parent_id = req.user?.id

        if (!parent_id) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (!tutor_id || !rating) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // In a real app, we should verify that the parent has actually had a session with the tutor
        // For now, we'll allow any authenticated parent to review any tutor

        // 1. Get the parent record ID from the auth user ID
        const { data: parent, error: parentError } = await supabase
            .from('parents')
            .select('id')
            .eq('user_id', parent_id)
            .single()

        if (parentError || !parent) {
            // If using mock auth, we might not have a parent record. 
            // For demo purposes, if we can't find a parent record, we'll just proceed if it's a mock user
            if (req.user?.email === 'testparent@example.com') {
                // Mock success for demo
                return res.json({
                    id: 'mock-review-id',
                    message: 'Review submitted successfully (Mock Mode)'
                })
            }
            return res.status(404).json({ error: 'Parent profile not found' })
        }

        // 2. Insert the review
        const { data: review, error: reviewError } = await supabase
            .from('reviews')
            .insert({
                tutor_id,
                parent_id: parent.id,
                rating,
                comment,
                // tags are not in the schema yet, so we'll ignore them for the DB insert
                // or we could add a JSONB column for tags later
            })
            .select()
            .single()

        if (reviewError) {
            console.error('Supabase error:', reviewError)
            return res.status(500).json({ error: 'Failed to submit review' })
        }

        res.json(review)

    } catch (error) {
        console.error('Error submitting review:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
