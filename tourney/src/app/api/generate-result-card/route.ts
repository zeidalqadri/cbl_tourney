import { NextRequest, NextResponse } from 'next/server'
import { getMatch, createResultCard } from '@/lib/tournament-api'

export async function POST(request: NextRequest) {
  try {
    const { matchId } = await request.json()
    
    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      )
    }

    // Get match details
    const match = await getMatch(matchId)
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // For now, we'll use placeholder URLs
    // In production, you'd generate actual images and upload to cloud storage
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const imageUrl = `${baseUrl}/storage/v1/object/public/result-cards/${matchId}-main.png`
    const squareUrl = `${baseUrl}/storage/v1/object/public/result-cards/${matchId}-square.png`
    const landscapeUrl = `${baseUrl}/storage/v1/object/public/result-cards/${matchId}-landscape.png`

    // Save to database
    const resultCard = await createResultCard(
      matchId,
      imageUrl,
      squareUrl,
      landscapeUrl
    )

    return NextResponse.json({ 
      success: true, 
      resultCard,
      message: 'Result card generated successfully' 
    })
  } catch (error) {
    console.error('Error generating result card:', error)
    return NextResponse.json(
      { error: 'Failed to generate result card' },
      { status: 500 }
    )
  }
}