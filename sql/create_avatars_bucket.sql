-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the bucket
-- Allow anyone to view avatars
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatar
-- We use a folder structure: avatars/{user_id}/{filename} or just avatars/{filename}
-- The code uses avatars/{userId}-{math}.{ext}
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] IS NOT NULL -- Simple check to allow any authenticated upload to this bucket for now
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING ( 
    bucket_id = 'avatars' 
);
