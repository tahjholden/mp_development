'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Eye, Trash2, Star, Tag, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'
import { Sidebar } from '@/components/ui/Sidebar'

// Types for observations
interface Observation {
  id: string
  playerId: string
  playerName: string
  coachId: string
  coachName: string
  title: string
  description: string
  rating: number
  date: string
  tags: string[]
  notes: string
  private: boolean
  createdAt: string
  updatedAt: string
}

interface Player {
  id: string
  name: string
  team: string
  observations: number
}

interface Team {
  id: string
  name: string
}

// Main component
export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state for observations
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Player/team data for left column
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // Filter observations by selected player
  const filteredObservations = selectedPlayerId 
    ? observations.filter(obs => obs.playerId === selectedPlayerId)
    : observations;
  
  const paginatedObservations = filteredObservations.slice(0, page * pageSize);
  const hasMore = filteredObservations.length > paginatedObservations.length;

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter === 'all' || player.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  // Handle player selection with toggle functionality
  const handlePlayerSelect = (playerId: string) => {
    if (selectedPlayerId === playerId) {
      // Clicking the same player again - show all observations
      setSelectedPlayerId(null);
    } else {
      // Clicking a different player - filter to their observations
      setSelectedPlayerId(playerId);
    }
  };

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch observations
        const observationsResponse = await fetch('/api/observations')
        if (!observationsResponse.ok) {
          throw new Error('Failed to fetch observations')
        }
        const observationsData = await observationsResponse.json()
        setObservations(observationsData)
        
        // Fetch players
        const playersResponse = await fetch('/api/dashboard/players')
        if (playersResponse.ok) {
          const playersData = await playersResponse.json()
          const transformedPlayers = playersData.map((player: any) => ({
            id: player.id,
            name: player.name || `${player.firstName || ''} ${player.lastName || ''}`.trim() || 'Unknown Player',
            team: player.team_name || player.team || 'No Team',
            observations: observationsData.filter((obs: any) => obs.playerId === player.id).length
          }))
          setPlayers(transformedPlayers)
        }

        // Fetch teams
        const teamsResponse = await fetch('/api/user/teams')
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json()
          // Deduplicate teams by id
          const uniqueTeams = Array.from(new Map((teamsData as any[]).map((team: any) => [team.id, team])).values()) as Team[];
          setTeams(uniqueTeams)
        }
        
        if (observationsData.length > 0) {
          setSelectedObservation(observationsData[0])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setObservations([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Reset page when player selection changes
  useEffect(() => {
    setPage(1);
  }, [selectedPlayerId]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#161616] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-zinc-400 text-lg font-semibold mb-4">Loading observations...</span>
          <div className="w-8 h-8 border-2 border-[#d8cc97] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-[#161616] flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen h-full bg-black text-white" style={{ background: 'black' }}>
      {/* Header - exact replica with coach info */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between" style={{ boxShadow: 'none' }}>
        <span className="text-2xl font-bold tracking-wide text-[#d8cc97]" style={{ letterSpacing: '0.04em' }}>
          MP Player Development
        </span>
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">Coach</span>
          <span className="text-xs text-[#d8cc97] leading-tight">coach@example.com</span>
          <span className="text-xs text-white leading-tight">Coach</span>
        </div>
      </header>
      {/* Sidebar */}
      <Sidebar 
        user={{
          name: "Coach",
          email: "coach@example.com", 
          role: "Coach"
        }}
      />
      {/* Main Content */}
      <div className="flex-1 flex ml-64 pt-16 bg-black min-h-screen" style={{ background: 'black', minHeight: '100vh' }}>
        {/* LEFT PANE: Player List */}
        <div className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen" style={{ background: 'black' }}>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">Players</h2>
          
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm placeholder-gray-400 border border-zinc-700 focus:outline-none focus:border-[#d8cc97]"
            />
          </div>

          {/* Team Filter */}
          <div className="relative mb-6">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <button
              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
              className="w-full pl-10 pr-4 py-3 text-left bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-[#d8cc97] flex items-center justify-between"
            >
              <span>{teamFilter === 'all' ? 'All Teams' : teamFilter}</span>
              {isTeamDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isTeamDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded shadow-lg overflow-hidden">
                <button
                  onClick={() => { setTeamFilter('all'); setIsTeamDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-white"
                >
                  All Teams
                </button>
                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => { setTeamFilter(team.name); setIsTeamDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-white"
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Player List */}
          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredPlayers.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">No players found</div>
            ) : (
              filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => handlePlayerSelect(player.id)}
                  className={`p-4 rounded cursor-pointer transition-all ${
                    selectedPlayerId === player.id
                      ? "bg-[#d8cc97] text-black font-semibold"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  <p className="font-medium">{player.name}</p>
                  <p className="text-xs text-gray-400">
                    {player.observations} observations
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CENTER PANE: Observations */}
        <div className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen" style={{ background: 'black' }}>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            {selectedPlayerId 
              ? `${players.find(p => p.id === selectedPlayerId)?.name}'s Observations`
              : "All Observations"
            }
          </h2>
          
          {paginatedObservations.length > 0 ? (
            <div className="space-y-4">
              {paginatedObservations.map((obs) => (
                <div
                  key={obs.id}
                  onClick={() => setSelectedObservation(obs)}
                  className={`bg-zinc-800 p-6 rounded cursor-pointer hover:bg-zinc-700 transition-all ${
                    selectedObservation?.id === obs.id ? "ring-2 ring-[#d8cc97]" : ""
                  }`}
                  style={{ background: '#181818' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <div className="text-base font-bold text-[#d8cc97]">{obs.playerName}</div>
                      <div className="text-xs text-zinc-400">{new Date(obs.date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-3">
                      <button className="text-xs text-[#d8cc97] font-semibold hover:underline bg-transparent" style={{ background: 'transparent' }}>Edit</button>
                      <button className="text-xs text-red-400 font-semibold hover:underline bg-transparent" style={{ background: 'transparent' }}>Delete</button>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 line-clamp-3">{obs.description}</p>
                </div>
              ))}
              
              {/* Show More/Less Buttons */}
              {hasMore && (
                <button
                  className="flex items-center justify-center w-full py-4 text-[#d8cc97] hover:text-[#b3a14e] transition-colors bg-black"
                  onClick={() => setPage(page + 1)}
                  style={{ background: 'black' }}
                >
                  Show More <ChevronDown className="ml-2 w-4 h-4" />
                </button>
              )}
              {page > 1 && (
                <button
                  className="flex items-center justify-center w-full py-4 text-[#d8cc97] hover:text-[#b3a14e] transition-colors bg-black"
                  onClick={() => setPage(page - 1)}
                  style={{ background: 'black' }}
                >
                  Show Less <ChevronUp className="ml-2 w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              {selectedPlayerId ? "No observations found for this player." : "No observations found."}
            </div>
          )}
        </div>

        {/* RIGHT PANE: Insights */}
        <div className="w-1/4 p-8 bg-black flex flex-col justify-start min-h-screen" style={{ background: 'black' }}>
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">Insights</h2>
          
          {/* Teaser Feature Block */}
          <div className="bg-zinc-800 p-6 rounded">
            <div className="p-4 bg-zinc-900 rounded border border-dashed border-[#d8cc97]">
              <p className="text-sm text-[#d8cc97] font-semibold mb-3">
                🚀 Coming Soon to This Panel:
              </p>
              <ul className="text-sm text-gray-400 list-disc list-inside space-y-2">
                <li>AI-powered constraint suggestions</li>
                <li>Tag trend visualizations</li>
                <li>Drill recommendations based on this observation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
