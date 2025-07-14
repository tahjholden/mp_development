'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Eye, Trash2, Star, Tag, ChevronDown, ChevronUp, Search, Filter, Shield } from 'lucide-react'
import { Sidebar } from '@/components/ui/Sidebar'
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { DateRange } from "react-day-picker";
import PlayersList from '@/components/basketball/PlayersList';
import type { Player as SharedPlayer } from '@/components/basketball/PlayerListCard';

// Types for observations (matching actual API response)
interface Observation {
  id: string
  playerId: string
  playerFirstName?: string
  playerLastName?: string
  playerName: string
  title: string
  description: string
  rating: number
  date: string
  tags: string[]
  createdAt: string
  updatedAt: string | null
}

interface Player {
  id: string
  name: string
  team: string
  status: string
}

interface Team {
  id: string
  name: string
}

// Main component
export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [totalObservations, setTotalObservations] = useState<number>(0);
  const [obsOffset, setObsOffset] = useState(0);
  const [obsLoadingMore, setObsLoadingMore] = useState(false);
  const obsLimit = 20;
  const obsListRef = useRef<HTMLDivElement>(null);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state for observations
  const [pageSize, setPageSize] = useState<number | 'all'>(25);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Player/team data for left column
  const [selectedPlayer, setSelectedPlayer] = useState<SharedPlayer | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [showAllObservations, setShowAllObservations] = useState(false);
  


  // Filter observations by selected player
  const filteredObservations =
    selectedPlayerIds.length > 0
      ? observations.filter((obs) => selectedPlayerIds.includes(obs.playerId))
      : observations;
  
  // Date range filter logic
  const filteredByDate = observations.filter(obs => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const obsDate = new Date(obs.date);
    return obsDate >= dateRange.from && obsDate <= dateRange.to;
  });

  // Pagination logic
  const paginatedObservations = pageSize === 'all'
    ? filteredByDate
    : filteredByDate.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredByDate.length / (pageSize as number));

  const hasMore = filteredObservations.length > paginatedObservations.length;

  // Handler for selecting a player
  const handlePlayerSelect = (player: SharedPlayer) => {
    setSelectedPlayer(player);
    setSelectedPlayerIds([player.id]);
  };
  
  // Load more players when scrolling (like players page)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !obsLoadingMore && observations.length < totalObservations) {
      handleObsScroll();
    }
  };

  // Fetch real data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch initial observations with pagination
        const observationsResponse = await fetch(`/api/observations?offset=0&limit=${obsLimit}`)
        if (!observationsResponse.ok) {
          throw new Error('Failed to fetch observations')
        }
        const { observations: obsArr, total } = await observationsResponse.json();
        setObservations(obsArr);
        setTotalObservations(total);
        setObsOffset(obsArr.length);
        
        if (obsArr.length > 0) {
          setSelectedObservation(obsArr[0])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setObservations([])
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Reset page when player selection changes
  useEffect(() => {
    setPage(1);
  }, [selectedPlayerIds]);



  // Infinite scroll handler for expanded observations list
  const handleObsScroll = async () => {
    if (!showAllObservations || obsLoadingMore) return;
    const el = obsListRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 64) {
      // Near bottom, fetch more if available
      if (observations.length < totalObservations) {
        setObsLoadingMore(true);
        try {
          const res = await fetch(`/api/observations?offset=${obsOffset}&limit=${obsLimit}`);
          if (res.ok) {
            const data = await res.json();
            setObservations(prev => [...prev, ...data.observations]);
            setObsOffset(prev => prev + data.observations.length);
          }
        } finally {
          setObsLoadingMore(false);
        }
      }
    }
  };



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
          <PlayersList
            selectedPlayerId={selectedPlayer?.id}
            onPlayerSelect={handlePlayerSelect}
            title="Players"
            showSearch={true}
            showTeamFilter={true}
            maxHeight="400px"
          />
        </div>

        {/* CENTER PANE: Observations */}
        <div className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen" style={{ background: 'black' }}>
          <div className="flex items-center mb-6 gap-4 justify-between w-full">
            <h2 className="text-xl font-bold text-[#d8cc97] mt-0">
              {selectedPlayerIds.length > 0 && selectedPlayer
                ? `${selectedPlayer.name}'s Observations`
                : "All Observations"
              }
            </h2>
            <div className="flex items-center gap-4">
              {/* Page size selector */}
              <label className="text-sm text-zinc-400">Show:
                <select
                  className="ml-2 px-2 py-1 rounded bg-zinc-800 text-white border border-zinc-700"
                  value={pageSize}
                  onChange={e => {
                    setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value="all">All</option>
                </select>
              </label>
              {/* Date range picker toggle */}
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="px-3 py-1 border border-zinc-700 bg-zinc-800 text-[#d8cc97] hover:border-[#d8cc97]">
                    {dateRange?.from && dateRange?.to
                      ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                      : 'Select Date Range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-4 bg-black border-[#d8cc97] text-[#d8cc97] w-auto">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="bg-black text-[#d8cc97]"
                  />
                  <Button
                    variant="ghost"
                    className="w-full mt-2 border border-[#d8cc97] text-[#d8cc97] hover:bg-[#232323]"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Close
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {paginatedObservations.length > 0 ? (
            <div
              ref={obsListRef}
              className="space-y-4"
              style={{ maxHeight: `${(pageSize === 'all' ? 12 : pageSize) * 64}px`, minHeight: '0', overflowY: paginatedObservations.length > (pageSize === 'all' ? 12 : pageSize) ? 'auto' : 'visible' }}
              onScroll={handleScroll}
            >
              {paginatedObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="bg-zinc-800 px-6 py-3 rounded transition-all"
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
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              {selectedPlayerIds.length > 0 ? "No observations found for these players." : "No observations found."}
            </div>
          )}
          {/* Pagination controls */}
          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Prev</button>
              <span className="px-2 py-1 text-sm">Page {page} of {totalPages}</span>
              <button
                className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >Next</button>
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
