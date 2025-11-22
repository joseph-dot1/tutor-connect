-- TutorConnect Complete Database Setup
-- This script combines schema creation and RLS policies
-- Run this in one go in Supabase SQL Editor for a clean setup

-- =====================================================
-- ENABLE UUID EXTENSION
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE ALL TABLES
-- =====================================================

-- TUTORS TABLE
CREATE TABLE IF NOT EXISTS tutors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    bio TEXT NOT NULL,
    subjects TEXT[] NOT NULL,
    experience_years INTEGER NOT NULL,
    highest_qualification VARCHAR(100) NOT NULL,
    languages_spoken TEXT[],
    teaching_methodology TEXT,
    preferred_age_groups TEXT[],
    location_areas TEXT[] NOT NULL,
    availability_schedule JSONB,
    hourly_rate_min DECIMAL(10,2),
    hourly_rate_max DECIMAL(10,2),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tutors_user_id ON tutors(user_id);
CREATE INDEX IF NOT EXISTS idx_tutors_verification_status ON tutors(verification_status);
CREATE INDEX IF NOT EXISTS idx_tutors_subjects ON tutors USING GIN(subjects);
CREATE INDEX IF NOT EXISTS idx_tutors_rating ON tutors(rating_average DESC);

-- PARENTS TABLE
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    location_address TEXT NOT NULL,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    preferred_subjects TEXT[],
    preferred_schedule JSONB,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);
CREATE INDEX IF NOT EXISTS idx_parents_location ON parents(location_lat, location_lng);

-- CHILDREN TABLE
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    grade VARCHAR(50) NOT NULL,
    subjects_needed TEXT[],
    learning_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);

-- SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_start_time TIME NOT NULL,
    scheduled_end_time TIME NOT NULL,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    location_address TEXT NOT NULL,
    location_lat DECIMAL(10,8) NOT NULL,
    location_lng DECIMAL(11,8) NOT NULL,
    check_in_radius INTEGER DEFAULT 150,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_tutor_id ON sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_parent_id ON sessions(parent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_child_id ON sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_date ON sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE UNIQUE NOT NULL,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    tags TEXT[],
    is_flagged BOOLEAN DEFAULT false,
    flag_reason TEXT,
    admin_reviewed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_tutor_id ON reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_session_id ON reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    sent_via TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- VERIFICATION DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('government_id', 'educational_certificate', 'proof_of_address')),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_docs_tutor_id ON verification_documents(tutor_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_status ON verification_documents(status);

-- CHECK INS TABLE
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    check_type VARCHAR(20) NOT NULL CHECK (check_type IN ('tutor_arrival', 'parent_confirmation', 'session_end')),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    distance_from_session DECIMAL(10,2),
    device_info JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_check_ins_session_id ON check_ins(session_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);

-- LESSON NOTES TABLE
CREATE TABLE IF NOT EXISTS lesson_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_text TEXT,
    file_url TEXT,
    file_type VARCHAR(50),
    file_size INTEGER,
    ai_summary TEXT,
    topics_covered TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_notes_session_id ON lesson_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_tutor_id ON lesson_notes(tutor_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_child_id ON lesson_notes(child_id);

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tutors_updated_at ON tutors;
CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_parents_updated_at ON parents;
CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_children_updated_at ON children;
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CREATE VIEW
-- =====================================================
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'role' as role,
    u.raw_user_meta_data->>'phone' as phone,
    u.created_at,
    CASE 
        WHEN t.id IS NOT NULL THEN jsonb_build_object(
            'tutor_id', t.id,
            'verification_status', t.verification_status,
            'rating_average', t.rating_average
        )
        WHEN p.id IS NOT NULL THEN jsonb_build_object(
            'parent_id', p.id
        )
        ELSE NULL
    END as profile_data
FROM auth.users u
LEFT JOIN tutors t ON t.user_id = u.id
LEFT JOIN parents p ON p.user_id = u.id;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES - TUTORS
-- =====================================================
CREATE POLICY "Public tutors are viewable by everyone"
    ON tutors FOR SELECT
    USING (verification_status = 'approved');

CREATE POLICY "Users can insert own tutor profile"
    ON tutors FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tutors can update own profile"
    ON tutors FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tutors can delete own profile"
    ON tutors FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- CREATE RLS POLICIES - PARENTS
-- =====================================================
CREATE POLICY "Parents can view own profile"
    ON parents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Parents can insert own profile"
    ON parents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can update own profile"
    ON parents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can delete own profile"
    ON parents FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- CREATE RLS POLICIES - CHILDREN
-- =====================================================
CREATE POLICY "Parents can view own children"
    ON children FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM parents
            WHERE parents.id = children.parent_id
            AND parents.user_id = auth.uid()
        )
    );

CREATE POLICY "Parents can insert own children"
    ON children FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM parents
            WHERE parents.id = parent_id
            AND parents.user_id = auth.uid()
        )
    );

CREATE POLICY "Parents can update own children"
    ON children FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM parents
            WHERE parents.id = children.parent_id
            AND parents.user_id = auth.uid()
        )
    );

CREATE POLICY "Parents can delete own children"
    ON children FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM parents
            WHERE parents.id = children.parent_id
            AND parents.user_id = auth.uid()
        )
    );

-- =====================================================
-- CREATE RLS POLICIES - SESSIONS
-- =====================================================
CREATE POLICY "Users can view own sessions"
    ON sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tutors WHERE tutors.id = sessions.tutor_id AND tutors.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM parents WHERE parents.id = sessions.parent_id AND parents.user_id = auth.uid()
        )
    );

CREATE POLICY "Parents can create sessions"
    ON sessions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM parents
            WHERE parents.id = parent_id
            AND parents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own sessions"
    ON sessions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tutors WHERE tutors.id = sessions.tutor_id AND tutors.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM parents WHERE parents.id = sessions.parent_id AND parents.user_id = auth.uid()
        )
    );

-- =====================================================
-- CREATE RLS POLICIES - REVIEWS
-- =====================================================
CREATE POLICY "Reviews are publicly viewable"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Parents can insert reviews"
    ON reviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM parents
            WHERE parents.id = parent_id
            AND parents.user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = session_id
            AND sessions.status = 'completed'
        )
    );

CREATE POLICY "Parents can update own reviews"
    ON reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM parents
            WHERE parents.id = reviews.parent_id
            AND parents.user_id = auth.uid()
        )
    );

-- =====================================================
-- CREATE RLS POLICIES - MESSAGES
-- =====================================================
CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received messages"
    ON messages FOR UPDATE
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

-- =====================================================
-- CREATE RLS POLICIES - NOTIFICATIONS
-- =====================================================
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- CREATE RLS POLICIES - VERIFICATION DOCUMENTS
-- =====================================================
CREATE POLICY "Tutors can view own documents"
    ON verification_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tutors
            WHERE tutors.id = verification_documents.tutor_id
            AND tutors.user_id = auth.uid()
        )
    );

CREATE POLICY "Tutors can upload own documents"
    ON verification_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tutors
            WHERE tutors.id = tutor_id
            AND tutors.user_id = auth.uid()
        )
    );

-- =====================================================
-- CREATE RLS POLICIES - CHECK INS
-- =====================================================
CREATE POLICY "Users can view session check-ins"
    ON check_ins FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sessions s
            LEFT JOIN tutors t ON t.id = s.tutor_id
            LEFT JOIN parents p ON p.id = s.parent_id
            WHERE s.id = check_ins.session_id
            AND (t.user_id = auth.uid() OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can create session check-ins"
    ON check_ins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- CREATE RLS POLICIES - LESSON NOTES
-- =====================================================
CREATE POLICY "Users can view session lesson notes"
    ON lesson_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sessions s
            LEFT JOIN tutors t ON t.id = s.tutor_id
            LEFT JOIN parents p ON p.id = s.parent_id
            WHERE s.id = lesson_notes.session_id
            AND (t.user_id = auth.uid() OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "Tutors can upload lesson notes"
    ON lesson_notes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tutors
            WHERE tutors.id = tutor_id
            AND tutors.user_id = auth.uid()
        )
    );

CREATE POLICY "Tutors can update own lesson notes"
    ON lesson_notes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tutors
            WHERE tutors.id = lesson_notes.tutor_id
            AND tutors.user_id = auth.uid()
        )
    );

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- You should now have:
-- ✅ 10 tables created with all indexes
-- ✅ Row Level Security enabled on all tables
-- ✅ Comprehensive RLS policies for data access
-- ✅ Triggers for automatic timestamp updates
-- ✅ user_profiles view for easier queries
--
-- Next steps:
-- 1. Create storage buckets (manual in Supabase UI)
-- 2. Disable mock mode in your app
-- 3. Test registration and login!
