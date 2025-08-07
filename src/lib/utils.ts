import { Match } from '@/types/tournament'

export function isValidTimeString(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time)
}

export function formatTime(time: string): string {
  if (!isValidTimeString(time)) {
    console.warn(`Invalid time format: ${time}`)
    return time // Return as-is rather than crashing
  }
  
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

export function generateMatchId(matchNumber: number): string {
  return `match-${matchNumber}`
}

export function getWinner(scoreA: number | undefined, scoreB: number | undefined): 'A' | 'B' | null {
  if (scoreA === undefined || scoreB === undefined) return null
  if (scoreA > scoreB) return 'A'
  if (scoreB > scoreA) return 'B'
  return null
}

export function isValidMatch(match: unknown): match is Match {
  return (
    typeof match === 'object' &&
    match !== null &&
    'id' in match &&
    'matchNumber' in match &&
    'teamA' in match &&
    'teamB' in match &&
    'status' in match
  )
}