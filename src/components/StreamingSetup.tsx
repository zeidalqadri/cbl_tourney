'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Copy, CheckCircle, Play, Info } from 'lucide-react';
import { Match } from '@/types/tournament';

interface StreamingSetupProps {
  onlyUpcoming?: boolean;
}

export function StreamingSetup({ onlyUpcoming = true }: StreamingSetupProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [streamType, setStreamType] = useState<'live' | 'recording'>('live');
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      let query = supabase
        .from('tournament_matches')
        .select(`
          *,
          team1:tournament_teams!tournament_matches_team1_id_fkey(id, team_name, division),
          team2:tournament_teams!tournament_matches_team2_id_fkey(id, team_name, division)
        `)
        .order('match_number', { ascending: true });

      if (onlyUpcoming) {
        query = query.or('status.eq.pending,status.eq.in_progress');
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(match => ({
        id: match.id,
        matchNumber: match.match_number,
        date: match.scheduled_time ? new Date(match.scheduled_time).toISOString().split('T')[0] : '',
        time: match.scheduled_time ? new Date(match.scheduled_time).toTimeString().split(' ')[0].slice(0, 5) : '',
        venue: match.venue || match.court || 'TBD',
        division: match.team1?.[0]?.division || match.team2?.[0]?.division || match.metadata?.division || 'boys',
        round: `Round ${match.round}`,
        teamA: match.team1?.[0] ? { 
          id: match.team1[0].id, 
          name: match.team1[0].team_name,
          group: '',
          division: match.team1[0].division
        } : { 
          id: '', 
          name: match.metadata?.team1_placeholder || 'TBD',
          group: '',
          division: match.metadata?.division || 'boys'
        },
        teamB: match.team2?.[0] ? { 
          id: match.team2[0].id, 
          name: match.team2[0].team_name,
          group: '',
          division: match.team2[0].division
        } : { 
          id: '', 
          name: match.metadata?.team2_placeholder || 'TBD',
          group: '',
          division: match.metadata?.division || 'boys'
        },
        status: match.status === 'pending' ? 'scheduled' : match.status,
        metadata: match.metadata
      }));
      
      setMatches(transformedData);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateYouTubeTitle = (match: Match, type: 'live' | 'recording') => {
    const prefix = type === 'live' ? '🔴 LIVE:' : '';
    const teamA = match.teamA?.name || `Team ${match.teamA?.id}`;
    const teamB = match.teamB?.name || `Team ${match.teamB?.id}`;
    const division = match.division === 'boys' ? 'Boys' : 'Girls';
    const venue = match.venue || 'TBD';
    
    return `${prefix} Match #${match.matchNumber} - ${teamA} vs ${teamB} - ${division} @ ${venue}`.trim();
  };

  const generateStreamingInstructions = (match: Match) => {
    const title = generateYouTubeTitle(match, streamType);
    const description = `
CBL Tournament ${new Date().getFullYear()}
${match.division === 'boys' ? 'Boys' : 'Girls'} Division
Match #${match.matchNumber}

Teams:
- ${match.teamA?.name || 'TBA'}
- ${match.teamB?.name || 'TBA'}

Venue: ${match.venue || 'TBD'}
Round: ${match.round}
${match.metadata?.group ? `Group: ${match.metadata.group}` : ''}

Date: ${match.date} at ${match.time}

#CBLTournament #Basketball #${match.division}Division
    `.trim();

    const tags = [
      'CBL Tournament',
      'Basketball',
      `${match.division} basketball`,
      match.venue || '',
      match.teamA?.name || '',
      match.teamB?.name || '',
      'live sports',
      'tournament'
    ].filter(Boolean).join(', ');

    return { title, description, tags };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMatchSelect = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    setSelectedMatch(match || null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stream Type Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Stream Type</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setStreamType('live')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              streamType === 'live'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <div className="relative">
                <div className="absolute animate-ping h-2 w-2 rounded-full bg-red-500 opacity-75"></div>
                <div className="relative h-2 w-2 rounded-full bg-red-500"></div>
              </div>
              <span className="font-medium">Live Stream</span>
            </div>
          </button>
          <button
            onClick={() => setStreamType('recording')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              streamType === 'recording'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              <span className="font-medium">Recording</span>
            </div>
          </button>
        </div>
      </div>

      {/* Match Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Select Match</h3>
        <select
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          onChange={(e) => handleMatchSelect(e.target.value)}
          value={selectedMatch?.id || ''}
        >
          <option value="">Choose a match...</option>
          {matches.map(match => (
            <option key={match.id} value={match.id}>
              Match #{match.matchNumber} - {match.teamA?.name || 'TBA'} vs {match.teamB?.name || 'TBA'} ({match.division}) @ {match.venue || 'TBD'}
            </option>
          ))}
        </select>
      </div>

      {/* Streaming Instructions */}
      {selectedMatch && (
        <div className="space-y-4">
          {/* YouTube Title */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">YouTube Title</h3>
              <button
                onClick={() => copyToClipboard(generateYouTubeTitle(selectedMatch, streamType))}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm break-all">
              {generateYouTubeTitle(selectedMatch, streamType)}
            </div>
          </div>

          {/* YouTube Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">YouTube Description</h3>
              <button
                onClick={() => copyToClipboard(generateStreamingInstructions(selectedMatch).description)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {generateStreamingInstructions(selectedMatch).description}
              </pre>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Suggested Tags</h3>
              <button
                onClick={() => copyToClipboard(generateStreamingInstructions(selectedMatch).tags)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
              {generateStreamingInstructions(selectedMatch).tags}
            </div>
          </div>

          {/* Quick Setup Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              Quick Setup Guide
            </h3>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-semibold">1.</span>
                <span>Copy the title above and paste it as your stream/video title</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">2.</span>
                <span>Copy the description and paste it in the description field</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>Add the suggested tags to help with discovery</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">4.</span>
                <span>
                  {streamType === 'live' 
                    ? 'Set stream visibility to "Public" and category to "Sports"'
                    : 'Upload your recording with visibility set to "Public"'}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">5.</span>
                <span className="text-green-700 font-medium">
                  The match card will automatically show the {streamType === 'live' ? 'LIVE badge' : 'video link'}!
                </span>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* No matches message */}
      {matches.length === 0 && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">No upcoming matches found.</p>
          <p className="text-sm text-gray-500 mt-2">Check back when matches are scheduled.</p>
        </div>
      )}
    </div>
  );
}

// Compact version for embedding
export function StreamingQuickSetup() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [copied, setCopied] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  const fetchUpcomingMatches = async () => {
    const { data } = await supabase
      .from('tournament_matches')
      .select(`
        *,
        team1:tournament_teams!tournament_matches_team1_id_fkey(id, team_name, division),
        team2:tournament_teams!tournament_matches_team2_id_fkey(id, team_name, division)
      `)
      .or('status.eq.pending,status.eq.in_progress')
      .order('scheduled_time', { ascending: true })
      .limit(5);
    
    // Transform the data to match our interface
    const transformedData = (data || []).map(match => ({
      id: match.id,
      matchNumber: match.match_number,
      date: match.scheduled_time ? new Date(match.scheduled_time).toISOString().split('T')[0] : '',
      time: match.scheduled_time ? new Date(match.scheduled_time).toTimeString().split(' ')[0].slice(0, 5) : '',
      venue: match.venue || match.court || 'TBD',
      division: match.team1?.[0]?.division || match.team2?.[0]?.division || match.metadata?.division || 'boys',
      round: `Round ${match.round}`,
      teamA: match.team1?.[0] ? { 
        id: match.team1[0].id, 
        name: match.team1[0].team_name,
        group: '',
        division: match.team1[0].division
      } : { 
        id: '', 
        name: match.metadata?.team1_placeholder || 'TBD',
        group: '',
        division: match.metadata?.division || 'boys'
      },
      teamB: match.team2?.[0] ? { 
        id: match.team2[0].id, 
        name: match.team2[0].team_name,
        group: '',
        division: match.team2[0].division
      } : { 
        id: '', 
        name: match.metadata?.team2_placeholder || 'TBD',
        group: '',
        division: match.metadata?.division || 'boys'
      },
      status: match.status === 'pending' ? 'scheduled' : match.status,
      metadata: match.metadata
    }));
    
    setMatches(transformedData);
    if (transformedData.length > 0) {
      setSelectedMatch(transformedData[0]);
    }
  };

  const generateTitle = (match: Match) => {
    return `🔴 LIVE: Match #${match.matchNumber} - ${match.teamA?.name} vs ${match.teamB?.name} - ${match.division === 'boys' ? 'Boys' : 'Girls'} @ ${match.venue}`;
  };

  const copyTitle = () => {
    if (selectedMatch) {
      navigator.clipboard.writeText(generateTitle(selectedMatch));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (matches.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">Quick Stream Setup</h3>
      <select
        className="w-full p-2 border rounded mb-3 text-sm"
        value={selectedMatch?.id || ''}
        onChange={(e) => {
          const match = matches.find(m => m.id === e.target.value);
          setSelectedMatch(match || null);
        }}
      >
        {matches.map(match => (
          <option key={match.id} value={match.id}>
            Match #{match.matchNumber} - {match.teamA?.name} vs {match.teamB?.name}
          </option>
        ))}
      </select>
      
      {selectedMatch && (
        <div className="space-y-2">
          <div className="bg-gray-50 p-2 rounded text-xs font-mono">
            {generateTitle(selectedMatch)}
          </div>
          <button
            onClick={copyTitle}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            {copied ? 'Copied!' : 'Copy Stream Title'}
          </button>
        </div>
      )}
    </div>
  );
}