export type Division = 'boys' | 'girls';
export type Venue = 'SJKC YU HWA' | 'SJKC MALIM';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed';
export type QualificationStatus = 'active' | 'through' | 'eliminated';
export type TournamentStage = 'group_stage' | 'second_round' | 'quarter_final' | 'semi_final' | 'final';

export interface Team {
  id: string;
  name: string;
  group: string;
  division: Division;
  emblemUrl?: string;
}

export interface TeamWithQualification extends Team {
  qualificationStatus: QualificationStatus;
  currentStage: string;
  finalPosition?: number;
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
  metadata?: {
    type?: string;
    division?: string;
    group?: string;
    team1_placeholder?: string;
    team2_placeholder?: string;
  };
}

export interface Group {
  id: string;
  name: string;
  division: Division;
  teams: Team[];
  standings?: GroupStanding[];
}

export interface GroupStanding {
  team_id: string;
  team_name: string;
  group_name: string;
  division: Division;
  played: number;
  won: number;
  lost: number;
  points_for: number;
  points_against: number;
  points_diff: number;
  points: number;
  position?: number;
  team?: TeamWithQualification;
  qualification_status?: QualificationStatus;
  isQualified?: boolean;
  canQualify?: boolean;
}

export interface TournamentBracket {
  secondRound: Match[];
  quarterFinals: Match[];
  semiFinals: Match[];
  final: Match[];
}

export interface TeamProgression {
  team: TeamWithQualification;
  progression: {
    from_stage: string;
    to_stage: string;
    qualified_at: string;
    match_id?: string;
  }[];
  currentStage: string;
  qualificationStatus: QualificationStatus;
  finalPosition?: number;
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