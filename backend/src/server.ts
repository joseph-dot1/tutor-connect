import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import { createClient } from '@supabase/supabase-js'

// Import routes
import tutorRoutes from './routes/tutors'
import bookingRoutes from './routes/bookings'
import reviewRoutes from './routes/reviews'
import messageRoutes from './routes/messages'
import materialRoutes from './routes/materials'
import aiCurriculumRoutes from './routes/ai-curriculum'

// Load environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Routes
app.use('/api/tutors', tutorRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/materials', materialRoutes)
app.use('/api/ai-curriculum', aiCurriculumRoutes)

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})