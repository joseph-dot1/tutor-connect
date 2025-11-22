import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jfhdzzexzcgjurabpibx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGR6emV4emNnanVyYWJwaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Nzk0MDgsImV4cCI6MjA3OTE1NTQwOH0.OBeur7NtbA8RhhmBnvt0lHoW0nIUj7-beA8AnDS21bg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserMetadata() {
    console.log('Checking user metadata in database...\n')

    // Get the tutor
    const TUTOR_ID = '41ab3002-9152-498a-9e37-29323a281ee0'
    const { data: tutor } = await supabase
        .from('tutors')
        .select('user_id')
        .eq('id', TUTOR_ID)
        .single()

    if (!tutor) {
        console.log('Tutor not found')
        return
    }

    // Get the user profile
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', tutor.user_id)
        .single()

    console.log('User Profile Data:')
    console.log(JSON.stringify(profile, null, 2))

    console.log('\n⚠️ The full_name field should contain the name the user registered with.')
    console.log('If it\'s NULL, then the registration process is not saving the name correctly.')
}

checkUserMetadata()
