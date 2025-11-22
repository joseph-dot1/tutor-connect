import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jfhdzzexzcgjurabpibx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGR6emV4emNnanVyYWJwaWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Nzk0MDgsImV4cCI6MjA3OTE1NTQwOH0.OBeur7NtbA8RhhmBnvt0lHoW0nIUj7-beA8AnDS21bg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTutor() {
    const TUTOR_ID = 'b2bb85ef-defb-46ce-8c30-d4b31aea4147' // From the screenshot

    console.log('Checking tutor ID:', TUTOR_ID)

    // Check if tutor exists
    const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('id', TUTOR_ID)
        .single()

    if (error) {
        console.log('❌ Error:', error.message)
        console.log('This tutor ID does not exist in the database!')
    } else {
        console.log('✅ Found tutor:', data)
    }

    // List all tutors to see what IDs are available
    console.log('\nAll approved tutors in database:')
    const { data: allTutors } = await supabase
        .from('tutors')
        .select('id, user_id, verification_status')
        .eq('verification_status', 'approved')

    console.log(allTutors)
}

checkTutor()
