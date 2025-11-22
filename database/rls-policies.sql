-- TutorConnect Row Level Security (RLS) Policies
-- Run this AFTER running schema.sql

-- =====================================================
-- ENABLE RLS ON ALL TABLES
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
-- TUTORS POLICIES
-- =====================================================
-- Tutors can view all approved tutors (for directory)
DROP POLICY IF EXISTS "Public tutors are viewable by everyone" ON tutors;
CREATE POLICY "Public tutors are viewable by everyone"
    ON tutors FOR SELECT
    USING (verification_status = 'approved');

-- Tutors can insert their own profile
DROP POLICY IF EXISTS "Users can insert own tutor profile" ON tutors;
CREATE POLICY "Users can insert own tutor profile"
    ON tutors FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Tutors can update their own profile
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutors;
CREATE POLICY "Tutors can update own profile"
    ON tutors FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Tutors can delete their own profile
DROP POLICY IF EXISTS "Tutors can delete own profile" ON tutors;
CREATE POLICY "Tutors can delete own profile"
    ON tutors FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- PARENTS POLICIES
-- =====================================================
-- Parents can view their own profile
DROP POLICY IF EXISTS "Parents can view own profile" ON parents;
CREATE POLICY "Parents can view own profile"
    ON parents FOR SELECT
    USING (auth.uid() = user_id);

-- Parents can insert their own profile
DROP POLICY IF EXISTS "Parents can insert own profile" ON parents;
CREATE POLICY "Parents can insert own profile"
    ON parents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Parents can update their own profile
DROP POLICY IF EXISTS "Parents can update own profile" ON parents;
CREATE POLICY "Parents can update own profile"
    ON parents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Parents can delete their own profile
DROP POLICY IF EXISTS "Parents can delete own profile" ON parents;
CREATE POLICY "Parents can delete own profile"
    ON parents FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- CHILDREN POLICIES
-- =====================================================
-- Parents can view their own children
DROP POLICY IF EXISTS "Parents can view own children" ON children;
CREATE POLICY "Parents can view own children"
    ON children FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM parents
            WHERE parents.id = children.parent_id
            AND parents.user_id = auth.uid()
        )
    );

-- Parents can insert children
DROP POLICY IF EXISTS "Parents can insert own children" ON children;
CREATE POLICY "Parents can insert own children"
    ON children FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM parents
            WHERE parents.id = parent_id
            AND parents.user_id = auth.uid()
        )
    );

-- Parents can update their children
DROP POLICY IF EXISTS "Parents can update own children" ON children;
CREATE POLICY "Parents can update own children"
    ON children FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM parents
            WHERE parents.id = children.parent_id
            AND parents.user_id = auth.uid()
        )
    );

-- Parents can delete their children
DROP POLICY IF EXISTS "Parents can delete own children" ON children;
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
-- SESSIONS POLICIES
-- =====================================================
-- Users can view sessions they're involved in
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
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

-- Parents can create sessions
DROP POLICY IF EXISTS "Parents can create sessions" ON sessions;
CREATE POLICY "Parents can create sessions"
    ON sessions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM parents
            WHERE parents.id = parent_id
            AND parents.user_id = auth.uid()
        )
    );

-- Users can update sessions they're involved in
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
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
-- REVIEWS POLICIES
-- =====================================================
-- Reviews are viewable by everyone (public trust)
DROP POLICY IF EXISTS "Reviews are publicly viewable" ON reviews;
CREATE POLICY "Reviews are publicly viewable"
    ON reviews FOR SELECT
    USING (true);

-- Parents can insert reviews for completed sessions
DROP POLICY IF EXISTS "Parents can insert reviews" ON reviews;
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

-- Parents can update their own reviews
DROP POLICY IF EXISTS "Parents can update own reviews" ON reviews;
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
-- MESSAGES POLICIES
-- =====================================================
-- Users can view messages they sent or received
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (mark as read)
DROP POLICY IF EXISTS "Users can update received messages" ON messages;
CREATE POLICY "Users can update received messages"
    ON messages FOR UPDATE
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================
-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- System can create notifications (service role)
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION DOCUMENTS POLICIES
-- =====================================================
-- Tutors can view their own documents
DROP POLICY IF EXISTS "Tutors can view own documents" ON verification_documents;
CREATE POLICY "Tutors can view own documents"
    ON verification_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tutors
            WHERE tutors.id = verification_documents.tutor_id
            AND tutors.user_id = auth.uid()
        )
    );

-- Tutors can upload their own documents
DROP POLICY IF EXISTS "Tutors can upload own documents" ON verification_documents;
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
-- CHECK INS POLICIES
-- =====================================================
-- Users can view check-ins for their sessions
DROP POLICY IF EXISTS "Users can view session check-ins" ON check_ins;
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

-- Users can create check-ins for their sessions
DROP POLICY IF EXISTS "Users can create session check-ins" ON check_ins;
CREATE POLICY "Users can create session check-ins"
    ON check_ins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- LESSON NOTES POLICIES
-- =====================================================
-- Parents and tutors can view lesson notes for their sessions
DROP POLICY IF EXISTS "Users can view session lesson notes" ON lesson_notes;
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

-- Tutors can upload lesson notes for their sessions
DROP POLICY IF EXISTS "Tutors can upload lesson notes" ON lesson_notes;
CREATE POLICY "Tutors can upload lesson notes"
    ON lesson_notes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tutors
            WHERE tutors.id = tutor_id
            AND tutors.user_id = auth.uid()
        )
    );

-- Tutors can update their own lesson notes
DROP POLICY IF EXISTS "Tutors can update own lesson notes" ON lesson_notes;
CREATE POLICY "Tutors can update own lesson notes"
    ON lesson_notes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tutors
            WHERE tutors.id = lesson_notes.tutor_id
            AND tutors.user_id = auth.uid()
        )
    );
