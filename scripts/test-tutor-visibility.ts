
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testVisibility() {
    console.log('Testing public visibility of tutors...')

    const { data: tutors, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('verification_status', 'approved')

    if (error) {
        console.error('Error fetching tutors:', error)
        return
    }

    console.log(`Found ${tutors?.length || 0} approved tutors.`)

    if (tutors && tutors.length > 0) {
        console.log('Sample tutor:', tutors[0])

        // Check if we can see the user profile for the first tutor
        const userId = tutors[0].user_id
        console.log(`Checking profile for user ${userId}...`)

        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (profileError) {
            console.error('Error fetching user profile:', profileError)
        } else {
            console.log('Found user profile:', profile)
        }
    } else {
        console.log('No approved tutors found. This might be correct if none are approved, or it might indicate RLS issues if you know there are approved tutors.')
    }
}

testVisibility()
