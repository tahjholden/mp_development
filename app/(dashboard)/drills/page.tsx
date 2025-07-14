'use client';

import { useState, useEffect } from 'react';
import {
  Edit,
  Eye,
  Trash2,
  Star,
  Tag,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Target,
  Clock,
  Users,
  Zap,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { z } from 'zod';

// Zod schemas for validation
const DrillSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum([
    'shooting',
    'ball_handling',
    'defense',
    'conditioning',
    'team_play',
    'passing',
    'rebounding',
  ]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number(),
  description: z.string(),
  instructions: z.array(z.string()),
  cues: z.array(z.string()),
  constraints: z.array(z.string()),
  players: z.number(),
  equipment: z.array(z.string()),
  variations: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const DrillsArraySchema = z.array(DrillSchema);

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  team: z.string(),
  status: z.string(),
});
const PlayersArraySchema = z.array(PlayerSchema);

const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
});
const TeamsArraySchema = z.array(TeamSchema);

// Types for drills
interface Drill {
  id: string;
  name: string;
  category:
    | 'shooting'
    | 'ball_handling'
    | 'defense'
    | 'conditioning'
    | 'team_play'
    | 'passing'
    | 'rebounding';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  description: string;
  instructions: string[];
  cues: string[];
  constraints: string[];
  players: number; // min players needed
  equipment: string[];
  variations: string[];
  createdAt: string;
  updatedAt: string;
}

interface Player {
  id: string;
  name: string;
  team: string;
  status: string;
}

interface Team {
  id: string;
  name: string;
}

// Main component
export default function DrillsPage() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state for drills
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Player/team data for left column
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedDrillId, setSelectedDrillId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] =
    useState(false);

  // Filter drills by selected category
  const filteredDrills = selectedDrillId
    ? drills.filter(drill => drill.id === selectedDrillId)
    : drills;

  const paginatedDrills = filteredDrills.slice(0, page * pageSize);
  const hasMore = filteredDrills.length > paginatedDrills.length;

  const filteredDrillsList = drills.filter(drill => {
    const matchesSearch = drill.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || drill.category === categoryFilter;
    const matchesDifficulty =
      difficultyFilter === 'all' || drill.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Handle drill selection with toggle functionality
  const handleDrillSelect = (drillId: string) => {
    if (selectedDrillId === drillId) {
      // Clicking the same drill again - show all drills
      setSelectedDrillId(null);
    } else {
      // Clicking a different drill - filter to their details
      setSelectedDrillId(drillId);
    }
  };

  // Fetch real data with validation
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock drills data with validation - in real app, this would come from API
        const mockDrills: Drill[] = [
          {
            id: '1',
            name: '3-Point Shooting Progression',
            category: 'shooting',
            difficulty: 'intermediate',
            duration: 30,
            description:
              'Progressive shooting drill focusing on form and accuracy',
            instructions: [
              'Start at 5 feet from basket',
              'Make 5 shots before moving back',
              'Move back 2 feet after each set',
              'Continue until reaching 3-point line',
            ],
            cues: ['Follow through', 'Square shoulders', 'Bend knees'],
            constraints: ['Must make 5 in a row', 'No dribbling'],
            players: 2,
            equipment: ['Basketball', 'Basket'],
            variations: ['Add defender', 'Time pressure'],
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15',
          },
          {
            id: '2',
            name: 'Ball Handling Circuit',
            category: 'ball_handling',
            difficulty: 'beginner',
            duration: 20,
            description: 'Station-based ball handling improvement',
            instructions: [
              'Set up 4 cones in a square',
              'Dribble around each cone',
              'Switch hands at each cone',
              'Complete 3 full circuits',
            ],
            cues: ['Keep head up', 'Finger tips', 'Low stance'],
            constraints: ['No looking down', 'Speed variations'],
            players: 1,
            equipment: ['Basketball', 'Cones'],
            variations: ['Add obstacles', 'Speed drills'],
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15',
          },
          {
            id: '3',
            name: 'Defensive Slides',
            category: 'defense',
            difficulty: 'intermediate',
            duration: 15,
            description: 'Defensive footwork and positioning',
            instructions: [
              'Start in defensive stance',
              'Slide laterally without crossing feet',
              'Keep hands active and ready',
              'Maintain low center of gravity',
            ],
            cues: ['Stay low', 'Active hands', "Slide don't cross"],
            constraints: ['Maintain stance', 'No crossing feet'],
            players: 2,
            equipment: ['Cones'],
            variations: ['Add offensive player', 'Speed variations'],
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15',
          },
        ];

        // Validate drills data
        const validatedDrills = DrillsArraySchema.safeParse(mockDrills);
        if (!validatedDrills.success) {
          console.error('Invalid drills data:', validatedDrills.error);
          throw new Error('Invalid drills data received');
        }

        // Filter out any invalid drills
        const validDrills = validatedDrills.data.filter(
          (drill): drill is Drill =>
            drill &&
            typeof drill === 'object' &&
            typeof drill.id === 'string' &&
            typeof drill.name === 'string' &&
            typeof drill.description === 'string' &&
            Array.isArray(drill.instructions) &&
            Array.isArray(drill.cues) &&
            Array.isArray(drill.constraints) &&
            Array.isArray(drill.equipment) &&
            Array.isArray(drill.variations) &&
            typeof drill.createdAt === 'string' &&
            typeof drill.updatedAt === 'string' &&
            drill.id.trim() !== '' &&
            drill.name.trim() !== '' &&
            drill.description.trim() !== '' &&
            drill.createdAt.trim() !== '' &&
            drill.updatedAt.trim() !== ''
        );

        // Deduplicate drills by id
        const uniqueDrills = Array.from(
          new Map(validDrills.map(drill => [drill.id, drill])).values()
        );
        setDrills(uniqueDrills);

        // Fetch players with validation
        const playersResponse = await fetch(
          '/api/dashboard/players?offset=0&limit=10'
        );
        if (playersResponse.ok) {
          const rawPlayersData = await playersResponse.json();
          // Handle the API response structure: { players: [...], total: number }
          if (
            rawPlayersData &&
            rawPlayersData.players &&
            Array.isArray(rawPlayersData.players)
          ) {
            const transformedRawPlayers = rawPlayersData.players.map(
              (player: any) => ({
                id: player.id,
                name: player.name || 'Unknown Player',
                team: player.team || 'No Team',
                status: player.status || 'active',
              })
            );

            // Validate players data
            const validatedPlayers = PlayersArraySchema.safeParse(
              transformedRawPlayers
            );
            if (!validatedPlayers.success) {
              console.error('Invalid players data:', validatedPlayers.error);
              throw new Error('Invalid players data received');
            }

            // Filter out any invalid players
            const validPlayers = validatedPlayers.data.filter(
              (player): player is Player =>
                player &&
                typeof player === 'object' &&
                typeof player.id === 'string' &&
                typeof player.name === 'string' &&
                typeof player.team === 'string' &&
                player.id.trim() !== '' &&
                player.name.trim() !== '' &&
                player.team.trim() !== ''
            );

            // Deduplicate players by id
            const uniquePlayers = Array.from(
              new Map(validPlayers.map(player => [player.id, player])).values()
            );
            setPlayers(uniquePlayers);
          } else {
            console.error(
              'Invalid API response structure for players:',
              rawPlayersData
            );
            setPlayers([]);
          }
        }

        // Fetch teams with validation
        const teamsResponse = await fetch('/api/user/teams');
        if (teamsResponse.ok) {
          const rawTeamsData = await teamsResponse.json();

          // Validate teams data
          const validatedTeams = TeamsArraySchema.safeParse(rawTeamsData);
          if (!validatedTeams.success) {
            console.error('Invalid teams data:', validatedTeams.error);
            throw new Error('Invalid teams data received');
          }

          // Filter out any invalid teams and deduplicate by id
          const validTeams = validatedTeams.data.filter(
            (team): team is Team =>
              team &&
              typeof team === 'object' &&
              typeof team.id === 'string' &&
              typeof team.name === 'string' &&
              team.id.trim() !== '' &&
              team.name.trim() !== ''
          );

          const uniqueTeams = Array.from(
            new Map(validTeams.map(team => [team.id, team])).values()
          );
          setTeams(uniqueTeams);
        }

        if (uniqueDrills.length > 0 && uniqueDrills[0]) {
          setSelectedDrill(uniqueDrills[0]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setDrills([]);
        setPlayers([]);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset page when drill selection changes
  useEffect(() => {
    setPage(1);
  }, [selectedDrillId]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#161616] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-zinc-400 text-lg font-semibold mb-4">
            Loading drills...
          </span>
          <div className="w-8 h-8 border-2 border-[#d8cc97] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-[#161616] flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen h-full bg-black text-white"
      style={{ background: 'black' }}
    >
      {/* Header - exact replica with coach info */}
      <header
        className="fixed top-0 left-0 w-full z-50 bg-black h-16 flex items-center px-8 border-b border-[#d8cc97] justify-between"
        style={{ boxShadow: 'none' }}
      >
        <span
          className="text-2xl font-bold tracking-wide text-[#d8cc97]"
          style={{ letterSpacing: '0.04em' }}
        >
          MP Player Development
        </span>
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-white leading-tight">
            Coach
          </span>
          <span className="text-xs text-[#d8cc97] leading-tight">
            coach@example.com
          </span>
          <span className="text-xs text-white leading-tight">Coach</span>
        </div>
      </header>
      {/* Sidebar */}
      <Sidebar
        user={{
          name: 'Coach',
          email: 'coach@example.com',
          role: 'Coach',
        }}
      />
      {/* Main Content */}
      <div
        className="flex-1 flex ml-64 pt-16 bg-black min-h-screen"
        style={{ background: 'black', minHeight: '100vh' }}
      >
        {/* LEFT PANE: Drill Categories */}
        <div
          className="w-1/4 border-r border-zinc-800 p-6 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">Drills</h2>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded bg-zinc-800 text-sm placeholder-gray-400 border border-zinc-700 focus:outline-none focus:border-[#d8cc97]"
            />
          </div>

          {/* Category Filter */}
          <div className="relative mb-6">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full pl-10 pr-4 py-3 text-left bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-[#d8cc97] flex items-center justify-between"
            >
              <span>
                {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
              </span>
              {isCategoryDropdownOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            {isCategoryDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-white"
                >
                  All Categories
                </button>
                {[
                  'shooting',
                  'ball_handling',
                  'defense',
                  'conditioning',
                  'team_play',
                  'passing',
                  'rebounding',
                ].map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setCategoryFilter(category);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-white capitalize"
                  >
                    {category.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="relative mb-6">
            <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <button
              onClick={() =>
                setIsDifficultyDropdownOpen(!isDifficultyDropdownOpen)
              }
              className="w-full pl-10 pr-4 py-3 text-left bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-[#d8cc97] flex items-center justify-between"
            >
              <span>
                {difficultyFilter === 'all'
                  ? 'All Difficulties'
                  : difficultyFilter}
              </span>
              {isDifficultyDropdownOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            {isDifficultyDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setDifficultyFilter('all');
                    setIsDifficultyDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-white"
                >
                  All Difficulties
                </button>
                {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                  <button
                    key={difficulty}
                    onClick={() => {
                      setDifficultyFilter(difficulty);
                      setIsDifficultyDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-white capitalize"
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Drill List */}
          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredDrillsList.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No drills found
              </div>
            ) : (
              filteredDrillsList.map(drill => (
                <div
                  key={drill.id}
                  onClick={() => handleDrillSelect(drill.id)}
                  className={`p-4 rounded cursor-pointer transition-all ${
                    selectedDrillId === drill.id
                      ? 'bg-[#d8cc97] text-black font-semibold'
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  <p className="font-medium">{drill.name}</p>
                  <p className="text-xs text-gray-400">
                    {drill.category.replace('_', ' ')} • {drill.difficulty} •{' '}
                    {drill.duration}min
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CENTER PANE: Drill Details */}
        <div
          className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            {selectedDrillId
              ? `${drills.find(d => d.id === selectedDrillId)?.name}`
              : 'All Drills'}
          </h2>

          {selectedDrill ? (
            <div className="space-y-6">
              {/* Drill Details Card */}
              <div
                className="bg-zinc-800 p-6 rounded"
                style={{ background: '#181818' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#d8cc97]">
                      {selectedDrill.name}
                    </h3>
                    <p className="text-sm text-zinc-400 capitalize">
                      {selectedDrill.category.replace('_', ' ')} •{' '}
                      {selectedDrill.difficulty}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-xs text-[#d8cc97] font-semibold hover:underline bg-transparent"
                      style={{ background: 'transparent' }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs text-red-400 font-semibold hover:underline bg-transparent"
                      style={{ background: 'transparent' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-zinc-400">Duration</p>
                    <p className="text-white">
                      {selectedDrill.duration} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Players Needed</p>
                    <p className="text-white">
                      {selectedDrill.players} minimum
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Equipment</p>
                    <p className="text-white">
                      {selectedDrill.equipment.join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400">Category</p>
                    <p className="text-white capitalize">
                      {selectedDrill.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-zinc-400 text-sm">Description</p>
                  <p className="text-white text-sm">
                    {selectedDrill.description}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div
                className="bg-zinc-800 p-6 rounded"
                style={{ background: '#181818' }}
              >
                <h4 className="text-base font-bold text-[#d8cc97] mb-4">
                  Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-2">
                  {selectedDrill.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm text-white">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Coaching Cues */}
              <div
                className="bg-zinc-800 p-6 rounded"
                style={{ background: '#181818' }}
              >
                <h4 className="text-base font-bold text-[#d8cc97] mb-4">
                  Coaching Cues
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDrill.cues.map((cue, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-zinc-700 rounded text-xs text-white"
                    >
                      {cue}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              Select a drill to view details.
            </div>
          )}
        </div>

        {/* RIGHT PANE: Drill Management */}
        <div
          className="w-1/4 p-8 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Management
          </h2>

          {/* Quick Drill Creation */}
          <div className="bg-zinc-800 p-6 rounded mb-6">
            <h3 className="text-base font-bold text-[#d8cc97] mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-[#d8cc97] text-black rounded text-sm font-semibold hover:bg-[#b3a14e] transition-colors">
                Create New Drill
              </button>
              <button className="w-full p-3 bg-zinc-700 text-white rounded text-sm font-semibold hover:bg-zinc-600 transition-colors">
                Import Drill Library
              </button>
              <button className="w-full p-3 bg-zinc-700 text-white rounded text-sm font-semibold hover:bg-zinc-600 transition-colors">
                Share Drill
              </button>
            </div>
          </div>

          {/* Drill Favorites */}
          <div className="bg-zinc-800 p-6 rounded mb-6">
            <h3 className="text-base font-bold text-[#d8cc97] mb-4">
              Favorites
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-zinc-700 rounded cursor-pointer hover:bg-zinc-600 transition-colors">
                <p className="text-sm font-semibold text-white">
                  3-Point Shooting Progression
                </p>
                <p className="text-xs text-zinc-400">20 min • Intermediate</p>
              </div>
              <div className="p-3 bg-zinc-700 rounded cursor-pointer hover:bg-zinc-600 transition-colors">
                <p className="text-sm font-semibold text-white">
                  Ball Handling Circuit
                </p>
                <p className="text-xs text-zinc-400">15 min • Beginner</p>
              </div>
            </div>
          </div>

          {/* Related Drills */}
          <div className="bg-zinc-800 p-6 rounded">
            <h3 className="text-base font-bold text-[#d8cc97] mb-4">
              Related Drills
            </h3>
            <div className="space-y-3">
              {drills
                .filter(
                  d =>
                    d.category === selectedDrill?.category &&
                    d.id !== selectedDrill?.id
                )
                .slice(0, 3)
                .map(drill => (
                  <div
                    key={drill.id}
                    className="p-3 bg-zinc-700 rounded cursor-pointer hover:bg-zinc-600 transition-colors"
                  >
                    <p className="text-sm font-semibold text-white">
                      {drill.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {drill.duration} min • {drill.difficulty}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
