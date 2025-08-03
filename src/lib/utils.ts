export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
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