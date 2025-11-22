import { Router, Response } from 'express'
import { supabase } from '../server'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/bookings - Get all bookings for the current user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id

        // Check if user is a parent or tutor
        const { data: parent } = await supabase
            .from('parents')
            .select('id')
            .eq('user_id', userId)
            .single()

        const { data: tutor } = await supabase
            .from('tutors')
            .select('id')
            .eq('user_id', userId)
            .single()

        let query = supabase
            .from('sessions')
            .select(`
        *,
        tutor:tutors(
          id,
          user:auth.users(raw_user_meta_data)
        ),
        parent:parents(
          id,
          user:auth.users(raw_user_meta_data)
        )
      `)

        if (parent) {
            query = query.eq('parent_id', parent.id)
        } else if (tutor) {
            query = query.eq('tutor_id', tutor.id)
        } else {
            // If user is neither (e.g. new user not set up), return empty
            return res.json([])
        }

        const { data: sessions, error } = await query

        if (error) throw error

        res.json(sessions)
    } catch (error) {
        console.error('Error fetching bookings:', error)
        res.status(500).json({ error: 'Failed to fetch bookings' })
    }
})

// POST /api/bookings - Create a new booking
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id
        const { tutor_id, subject, scheduled_date, scheduled_start_time, scheduled_end_time, notes, price } = req.body

        // 1. Get parent_id for the current user
        const { data: parent, error: parentError } = await supabase
            .from('parents')
            .select('id')
            .eq('user_id', userId)
            .single()

        if (parentError || !parent) {
            return res.status(403).json({ error: 'Only registered parents can book sessions' })
        }

        // 2. Create session
        // Note: We need a child_id. For MVP, if not provided, we might need to handle it.
        // The schema requires child_id.
        // Let's check if the parent has children. If so, pick the first one or require it.
        // For now, let's assume the frontend sends child_id OR we pick one.
        // If the frontend doesn't send child_id, we'll try to find one.

        let child_id = req.body.child_id

        if (!child_id) {
            const { data: children } = await supabase
                .from('children')
                .select('id')
                .eq('parent_id', parent.id)
                .limit(1)

            if (children && children.length > 0) {
                child_id = children[0].id
            } else {
                // Create a dummy child if none exists (for MVP flow smoothness)
                // OR return error. Let's return error for correctness.
                return res.status(400).json({ error: 'Please add a child to your profile before booking' })
            }
        }

        // Mock location for now if not provided
        const location_address = req.body.location_address || 'Online'
        const location_lat = req.body.location_lat || 0
        const location_lng = req.body.location_lng || 0

        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
                tutor_id,
                parent_id: parent.id,
                child_id,
                subject,
                scheduled_date,
                scheduled_start_time,
                scheduled_end_time,
                notes,
                status: 'pending',
                location_address,
                location_lat,
                location_lng
            })
            .select()
            .single()

        if (sessionError) throw sessionError

        // 3. Send email notification to tutor
        // Fetch tutor's email and name
        const { data: tutorUser } = await supabase
            .from('user_profiles')
            .select('email, full_name')
            .eq('id', session.tutor_id) // session.tutor_id is the tutor table ID, we need user_id
        // Wait, session.tutor_id is the ID from 'tutors' table. 
        // We need to join to get the user email.
        // Let's do a separate query to be safe and clear.

        // Get tutor's user_id from tutors table
        const { data: tutorRecord } = await supabase
            .from('tutors')
            .select('user_id')
            .eq('id', tutor_id)
            .single()

        if (tutorRecord) {
            const { data: tutorProfile } = await supabase
                .from('user_profiles')
                .select('email, full_name')
                .eq('id', tutorRecord.user_id)
                .single()

            if (tutorProfile && tutorProfile.email) {
                // Import dynamically or at top level. Let's assume top level import is added.
                // We'll use dynamic import here to avoid changing top of file if possible, 
                // but better to add import at top. 
                // Since I can't easily add to top with this tool without reading whole file,
                // I'll use the multi_replace or just assume I can edit the whole block.
                // Actually, I'll use a dynamic import for safety in this specific block or just add the import in a separate step.
                // Let's try to do it all here if I can.

                const { sendBookingNotification } = require('../lib/email')

                // Get parent name
                const { data: parentProfile } = await supabase
                    .from('user_profiles')
                    .select('full_name')
                    .eq('id', userId)
                    .single()

                await sendBookingNotification({
                    tutorEmail: tutorProfile.email,
                    tutorName: tutorProfile.full_name || 'Tutor',
                    parentName: parentProfile?.full_name || 'Parent',
                    subject: subject,
                    scheduledDate: scheduled_date,
                    scheduledTime: `${scheduled_start_time} - ${scheduled_end_time}`,
                    price: price || 0
                })
            }
        }

        res.status(201).json(session)
    } catch (error) {
        console.error('Error creating booking:', error)
        // Log the request body to see what was sent
        console.error('Request body:', req.body)
        res.status(500).json({ error: 'Failed to create booking', details: error })
    }
})

export default router
