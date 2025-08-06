import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { uploadMatchMedia } from '@/lib/media-api';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const matchId = formData.get('matchId') as string;
    const venue = formData.get('venue') as string;
    const photographerName = formData.get('photographerName') as string;
    const captions = JSON.parse(formData.get('captions') as string || '{}');

    // Validate required fields
    if (!matchId || !venue || !photographerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate files
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}` },
          { status: 400 }
        );
      }
    }

    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Upload files to Supabase Storage
    const uploadedPhotos = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${matchId}/${Date.now()}_${i}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('match-media')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue; // Skip failed uploads
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('match-media')
        .getPublicUrl(fileName);

      uploadedPhotos.push({
        url: publicUrl,
        thumbnail: publicUrl, // In production, generate a thumbnail
        caption: captions[i] || '',
        photographer: photographerName
      });
    }

    // If no photos were successfully uploaded
    if (uploadedPhotos.length === 0) {
      return NextResponse.json(
        { error: 'Failed to upload any files' },
        { status: 500 }
      );
    }

    // Save media information to database
    const result = await uploadMatchMedia({
      matchId: matchId,
      venue: venue,
      uploadType: 'photos',
      content: {
        photos: uploadedPhotos
      },
      uploadedBy: photographerName
    });

    return NextResponse.json({
      success: true,
      uploadedCount: uploadedPhotos.length,
      matchId: matchId,
      photos: uploadedPhotos
    });

  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}