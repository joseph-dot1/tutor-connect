
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jfhdzzexzcgjurabpibx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGR6emV4emNnanVyYWJwaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Nzk0MDgsImV4cCI6MjA3OTE1NTQwOH0.OBeur7NtbA8RhhmBnvt0lHoW0nIUj7-beA8AnDS21bg'

const supabase = createClient(supabaseUrl, supabaseKey)

const TUTOR_ID = '41ab3002-9152-498a-9e37-29323a281ee0'

async function debugProfileLink() {
    console.log(`Checking tutor with ID: ${TUTOR_ID}`)

    // 1. Fetch tutor
    const { data: tutor, error: tutorError } = await supabase
        .from('tutors')
        .select('*')
        .eq('id', TUTOR_ID)
        .single()

    if (tutorError) {
        console.error('Error fetching tutor:', tutorError)
        return
    }

    console.log('Found tutor:', {
        id: tutor.id,
        user_id: tutor.user_id,
        verification_status: tutor.verification_status
    })

    if (!tutor.user_id) {
        console.error('Tutor has no user_id!')
        return
    }

    // 2. Fetch user profile
    console.log(`Fetching user profile for user_id: ${tutor.user_id}`)
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', tutor.user_id)
        .single()

    if (profileError) {
        console.error('Error fetching user profile:', profileError)

        // Try fetching all profiles to see if any exist
        const { count } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true })
        console.log(`Total user_profiles count: ${count}`)
    } else {
        console.log('Found user profile:', profile)
    }
}

debugProfileLink()
