import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jfhdzzexzcgjurabpibx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGR6emV4emNnanVyYWJwaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Nzk0MDgsImV4cCI6MjA3OTE1NTQwOH0.OBeur7NtbA8RhhmBnvt0lHoW0nIUj7-beA8AnDS21bg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAllTutorNames() {
    console.log('Checking all tutor accounts...\n')

    const { data: tutors } = await supabase
        .from('tutors')
        .select('id, user_id')
        .eq('verification_status', 'approved')

    for (const tutor of tutors || []) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, email, full_name')
            .eq('id', tutor.user_id)
            .single()

        console.log(`Tutor ID: ${tutor.id}`)
        console.log(`Email: ${profile?.email}`)
        console.log(`Current Name: ${profile?.full_name || 'NULL'}`)
        console.log('---')
    }

    console.log('\nℹ️ To fix missing names, you need to:')
    console.log('1. Open Supabase SQL Editor')
    console.log('2. Run the fix_profile_complete.sql script')
    console.log('3. Update the name in the script to match what you registered with')
}

checkAllTutorNames()
