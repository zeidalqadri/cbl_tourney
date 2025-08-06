import { NextRequest, NextResponse } from 'next/server'
import { getMatchPhotos, searchPhotos, getMatchPhotoStats } from '@/lib/google-drive'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const matchNumber = searchParams.get('match')
  const query = searchParams.get('q')
  const stats = searchParams.get('stats')

  try {
    if (matchNumber && stats === 'true') {
      // Get photo statistics for a match
      const photoStats = await getMatchPhotoStats(parseInt(matchNumber))
      return NextResponse.json({ success: true, stats: photoStats })
    } else if (matchNumber) {
      // Get photos for a specific match
      const photos = await getMatchPhotos(parseInt(matchNumber))
      return NextResponse.json({ success: true, photos })
    } else if (query) {
      // Search photos across all matches
      const photos = await searchPhotos(query)
      return NextResponse.json({ success: true, photos })
    } else {
      return NextResponse.json(
        { success: false, error: 'Match number or search query required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}