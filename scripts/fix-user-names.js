import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jfhdzzexzcgjurabpibx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGR6emV4emNnanVyYWJwaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Nzk0MDgsImV4cCI6MjA3OTE1NTQwOH0.OBeur7NtbA8RhhmBnvt0lHoW0nIUj7-beA8AnDS21bg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixMissingNames() {
    console.log('🔍 Finding tutors with missing names...\n')

    // Get all tutors
    const { data: tutors, error: tutorsError } = await supabase
        .from('tutors')
        .select('id, user_id')

    if (tutorsError) {
        console.error('❌ Error fetching tutors:', tutorsError)
        return
    }

    console.log(`Found ${tutors.length} tutor(s)\n`)

    // Check each tutor's profile
    for (const tutor of tutors) {
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, full_name, email')
            .eq('id', tutor.user_id)
            .single()

        if (profileError) {
            console.log(`⚠️  Tutor ${tutor.id}: Could not fetch profile`)
            continue
        }

        if (!profile.full_name) {
            console.log(`❌ Tutor ${tutor.id}: Missing name (email: ${profile.email})`)
            console.log(`   → This requires admin API access to fix (cannot update auth.users with anon key)`)
        } else {
            console.log(`✅ Tutor ${tutor.id}: ${profile.full_name}`)
        }
    }

    console.log('\n📋 Summary:')
    console.log('The anon API key cannot update user metadata.')
    console.log('We need to either:')
    console.log('  1. Run the SQL script in Supabase dashboard')
    console.log('  2. Use the service_role key (not recommended for client-side)')
    console.log('  3. Update the backend to extract name from email as fallback')
}

fixMissingNames()
