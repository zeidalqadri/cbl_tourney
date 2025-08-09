export type Division = 'boys' | 'girls';
export type Venue = 'SJKC YU HWA' | 'SJKC MALIM';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed';

export interface Team {
  id: string;
  name: string;
  group: string;
  division: Division;
  emblemUrl?: string;
}

export interface Match {
  id: string;
  matchNumber: number;
  date: string;
  time: string;
  venue: Venue;
  division: Division;
  round: string;
  teamA: Team;
  teamB: Team;
  scoreA?: number;
  scoreB?: number;
  status: MatchStatus;
  updatedAt?: string;
}

export interface Group {
  id: string;
  name: string;
  division: Division;
  teams: Team[];
  standings?: GroupStanding[];
}

export interface GroupStanding {
  team: Team;
  played: number;
  won: number;
  lost: number;
  points: number;
  position: number;
}

export interface ResultCard {
  match: Match;
  generatedAt: string;
  imageUrl: string;
  socialMediaFormats: {
    square: string;
    landscape: string;
  };
}