'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, Target } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
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

// Main component
export default function DrillsPage() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player/team data for left column
  const [selectedDrillId, setSelectedDrillId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] =
    useState(false);

  // Filter drills by selected category
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

        if (uniqueDrills.length > 0 && uniqueDrills[0]) {
          setSelectedDrill(uniqueDrills[0]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setDrills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset page when drill selection changes
  useEffect(() => {
    // setPage(1); // This line was removed as per the edit hint.
  }, [selectedDrillId]);

  if (loading) {
    return (
      <DashboardLayout
        left={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Drills</h2>
            </div>
          </div>
        }
        center={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading drills...</p>
            </div>
          </div>
        }
        right={
          <div className="space-y-4">
            {/* TODO: Port your right sidebar content here */}
          </div>
        }
      />
    );
  }

  if (error) {
    return (
      <DashboardLayout
        left={<div className="space-y-4"></div>}
        center={
          <div className="min-h-screen p-4 flex items-center justify-center">
            <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-300">
              {error}
            </div>
          </div>
        }
        right={<div className="space-y-4"></div>}
      />
    );
  }

  return (
    <DashboardLayout
      left={
        <div className="space-y-4">
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
      }
      center={
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            {selectedDrillId
              ? `${drills.find(d => d.id === selectedDrillId)?.name}`
              : 'All Drills'}
          </h2>

          {selectedDrill ? (
            <div className="space-y-6">
              {/* Drill Details Card */}
              <UniversalCard.Default
                title={selectedDrill.name}
                subtitle={`${selectedDrill.category.replace('_', ' ')} • ${selectedDrill.difficulty}`}
                size="lg"
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
                    <UniversalButton.Ghost size="xs">
                      Edit
                    </UniversalButton.Ghost>
                    <UniversalButton.Ghost
                      size="xs"
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </UniversalButton.Ghost>
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
              </UniversalCard.Default>

              {/* Instructions */}
              <UniversalCard.Default title="Instructions" size="lg">
                <ol className="list-decimal list-inside space-y-2">
                  {selectedDrill.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm text-white">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </UniversalCard.Default>

              {/* Coaching Cues */}
              <UniversalCard.Default title="Coaching Cues" size="lg">
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
              </UniversalCard.Default>
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              Select a drill to view details.
            </div>
          )}
        </div>
      }
      right={
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Management
          </h2>

          {/* Quick Drill Creation */}
          <UniversalCard.Default
            title="Quick Actions"
            size="sm"
            className="mb-6"
          >
            <div className="space-y-3">
              <UniversalButton.Primary className="w-full">
                Create New Drill
              </UniversalButton.Primary>
              <UniversalButton.Secondary className="w-full">
                Import Drill Library
              </UniversalButton.Secondary>
              <UniversalButton.Secondary className="w-full">
                Share Drill
              </UniversalButton.Secondary>
            </div>
          </UniversalCard.Default>

          {/* Drill Favorites */}
          <UniversalCard.Default title="Favorites" size="sm" className="mb-6">
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
          </UniversalCard.Default>

          {/* Related Drills */}
          <UniversalCard.Default title="Related Drills" size="sm">
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
          </UniversalCard.Default>
        </div>
      }
    />
  );
}
