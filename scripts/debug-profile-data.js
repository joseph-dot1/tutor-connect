
import { createClient } from '@supabase/supabase-js'

// Using the credentials from the previous scripts/files
const supabaseUrl = 'https://jfhdzzexzcgjurabpibx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGR6emV4emNnanVyYWJwaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Nzk0MDgsImV4cCI6MjA3OTE1NTQwOH0.OBeur7NtbA8RhhmBnvt0lHoW0nIUj7-beA8AnDS21bg'

const supabase = createClient(supabaseUrl, supabaseKey)

const TUTOR_ID = '41ab3002-9152-498a-9e37-29323a281ee0'

async function debugProfileData() {
    console.log('--- Starting Debug ---')

    // 1. Get Tutor to find User ID
    const { data: tutor, error: tutorError } = await supabase
        .from('tutors')
        .select('id, user_id')
        .eq('id', TUTOR_ID)
        .single()

    if (tutorError) {
        console.error('❌ Error fetching tutor:', tutorError)
        return
    }
    console.log('✅ Found Tutor:', tutor)

    // 2. Try to fetch from user_profiles view
    console.log(`\nFetching profile for user_id: ${tutor.user_id}`)
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', tutor.user_id)
        .single()

    if (profileError) {
        console.error('❌ Error fetching from user_profiles:', profileError)
        console.log('Possible causes: View does not exist, permissions denied, or row missing.')
    } else {
        console.log('✅ Found user_profiles record:', profile)
        if (!profile.full_name) {
            console.warn('⚠️ full_name is NULL! This explains "Unknown Tutor".')
        } else {
            console.log('👍 full_name is present:', profile.full_name)
        }
    }

    // 3. Check if we can see ANY profiles (to verify view permissions)
    const { data: anyProfiles, error: listError } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .limit(3)

    if (listError) {
        console.error('\n❌ Error listing user_profiles:', listError)
    } else {
        console.log('\nℹ️ Sample of other profiles visible:', anyProfiles)
    }
}

debugProfileData()
