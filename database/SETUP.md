# Supabase Database Setup Guide

## Step 1: Access Supabase SQL Editor

1. Go to [your Supabase project](https://jfhdzzexzcgjurabpibx.supabase.co)
2. Click on "SQL Editor" in the left sidebar

## Step 2: Run the Schema

1. Open `database/schema.sql`
2. Copy all the content
3. Paste it into the Supabase SQL Editor
4. Click "Run" (or press Ctrl/Cmd + Enter)
5. Wait for success message

This will create all tables, indexes, triggers, and views.

## Step 3: Run RLS Policies

1. Open `database/rls-policies.sql`
2. Copy all the content
3. Paste it into the Supabase SQL Editor
4. Click "Run"
5. Wait for success message

This will enable Row Level Security and create all access policies.

## Step 4: Set up Storage Buckets

1. Go to "Storage" in the left sidebar
2. Create the following buckets:

### Profile Photos
- Name: `profile-photos`
- Public: Yes
- File size limit: 5MB
- Allowed MIME types: `image/*`

### Verification Documents
- Name: `verification-documents`
- Public: No (Private)
- File size limit: 10MB
- Allowed MIME types: `image/*`, `application/pdf`

### Lesson Notes
- Name: `lesson-notes`
- Public: No (Private)
- File size limit: 25MB
- Allowed MIME types: `image/*`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Step 5: Configure Authentication

1. Go to "Authentication" → "Providers"
2. Enable "Email" provider (should be enabled by default)
3. Configure email templates:
   - Go to "Email Templates"
   - Customize "Confirm signup", "Magic Link", "Change Email", "Reset Password"

## Step 6: Test the Connection

The frontend is already configured with your credentials in `.env`:
```
VITE_SUPABASE_URL=https://jfhdzzexzcgjurabpibx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Once you've run the SQL scripts, the app will automatically use real Supabase authentication!

## Verification

After setup, you should have:
- ✅ 10 tables created
- ✅ Multiple indexes on each table
- ✅ RLS enabled on all tables
- ✅ 3 storage buckets configured
- ✅ Email authentication enabled

## Next Steps

After database setup is complete:
1. Restart the dev server (`npm run dev`)
2. Try registering a new account
3. The app will use real Supabase instead of mock mode!
