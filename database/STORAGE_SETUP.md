# Supabase Storage Bucket Setup

## Manual Steps Required

You need to create a storage bucket in your Supabase dashboard for storing lesson material files.

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click **New bucket**
5. Set the following:
   - **Name**: `lesson-materials`
   - **Public**: **OFF** (keep it private)
   - **File size limit**: 10 MB (optional)
   - **Allowed MIME types**: Leave empty for now (we'll validate in code)

### Step 2: Configure Storage Policies

After creating the bucket, set up Row Level Security policies:

1. Click on the `lesson-materials` bucket
2. Go to **Policies** tab
3. Click **New Policy**

#### Policy 1: Tutors can upload to their own folder
```sql
-- INSERT Policy
CREATE POLICY "Tutors can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-materials' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Tutors can read their own files
```sql
-- SELECT Policy
CREATE POLICY "Tutors can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-materials' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: Tutors can delete their own files
```sql
-- DELETE Policy
CREATE POLICY "Tutors can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-materials' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Step 3: Verify Setup

You can verify the bucket is created correctly by:
1. Checking the Storage page in Supabase Dashboard
2. The bucket should show up as private
3. Policies should be active

### File Structure

Files will be organized by tutor ID:
```
lesson-materials/
  ├── {tutor_user_id_1}/
  │   ├── file1.pdf
  │   ├── file2.docx
  │   └── ...
  ├── {tutor_user_id_2}/
  │   ├── file1.pdf
  │   └── ...
  └── ...
```

### Next Steps

After completing these manual steps:
1. Run the `add_lesson_materials.sql` script in your Supabase SQL Editor
2. Proceed with backend implementation
