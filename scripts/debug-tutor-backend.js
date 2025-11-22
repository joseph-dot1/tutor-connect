
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jfhdzzexzcgjurabpibx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGR6emV4emNnanVyYWJwaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Nzk0MDgsImV4cCI6MjA3OTE1NTQwOH0.OBeur7NtbA8RhhmBnvt0lHoW0nIUj7-beA8AnDS21bg'

const supabase = createClient(supabaseUrl, supabaseKey)

const TUTOR_ID = 'b2bb85ef-defb-46ce-8c30-d4b31aea4147'

async function debugTutor() {
    console.log(`Checking tutor with ID: ${TUTOR_ID}`)

    // 1. Check if tutor exists in table
    const { data: tutor, error: simpleError } = await supabase
        .from('tutors')
        .select('*')
        .eq('id', TUTOR_ID)
        .single()

    if (simpleError) {
        console.error('Error fetching simple tutor:', simpleError)
    } else {
        console.log('Found tutor (simple):', tutor)
    }

    // 2. Test the complex query used in backend
    console.log('Testing complex query...')
    const { data: complexTutor, error: complexError } = await supabase
        .from('tutors')
        .select(`
            *,
            user:auth.users(raw_user_meta_data)
        `)
        .eq('id', TUTOR_ID)
        .single()

    if (complexError) {
        console.error('Error fetching complex tutor (auth.users):', complexError)
    } else {
        console.log('Found tutor (complex):', complexTutor)
    }

    // 3. Test query with user_profiles
    console.log('Testing query with user_profiles...')
    // Note: This assumes there is a relationship. If not, we might need to fetch separately.
    // But let's try to see if we can fetch user_profiles separately first.

    if (tutor) {
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', tutor.user_id)
            .single()

        if (profileError) {
            console.error('Error fetching user profile:', profileError)
        } else {
            console.log('Found user profile:', profile)
        }
    }
}

debugTutor()
