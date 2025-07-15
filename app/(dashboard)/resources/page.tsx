'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  BookOpen,
  ExternalLink,
  Heart,
  Globe,
  Instagram,
  Mic,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { ComingSoonOverlay } from '@/components/ComingSoonOverlay';
import { z } from 'zod';

// Zod schemas for validation
const InspirationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['coach', 'platform', 'podcast', 'social', 'website']),
  category: z.enum([
    'teaching',
    'development',
    'science',
    'creativity',
    'global',
  ]),
  description: z.string(),
  whyRecommend: z.string(),
  website: z.string().optional(),
  social: z.string().optional(),
  instagram: z.string().optional(),
  podcast: z.string().optional(),
  youtube: z.string().optional(),
  tags: z.array(z.string()),
  featured: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const InspirationsArraySchema = z.array(InspirationSchema);

const ResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['pdf', 'playbook', 'template', 'guide']),
  description: z.string(),
  fileSize: z.string().optional(),
  downloads: z.number(),
  createdAt: z.string(),
});
const ResourcesArraySchema = z.array(ResourceSchema);

// Types for inspirations and resources
interface Inspiration {
  id: string;
  name: string;
  type: 'coach' | 'platform' | 'podcast' | 'social' | 'website';
  category: 'teaching' | 'development' | 'science' | 'creativity' | 'global';
  description: string;
  whyRecommend: string;
  website?: string;
  social?: string;
  instagram?: string;
  podcast?: string;
  youtube?: string;
  tags: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'playbook' | 'template' | 'guide';
  description: string;
  fileSize?: string;
  downloads: number;
  createdAt: string;
}

// Main component
export default function ResourcesPage() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedInspiration, setSelectedInspiration] =
    useState<Inspiration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedInspirationId, setSelectedInspirationId] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Filter inspirations by selected category
  const filteredInspirationsList = inspirations.filter(inspiration => {
    const matchesSearch =
      inspiration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspiration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || inspiration.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle inspiration selection with toggle functionality
  const handleInspirationSelect = (inspirationId: string) => {
    if (selectedInspirationId === inspirationId) {
      setSelectedInspirationId(null);
    } else {
      setSelectedInspirationId(inspirationId);
    }
  };

  // Fetch real data with validation
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock inspirations data - these are the real influences
        const mockInspirations: Inspiration[] = [
          {
            id: '1',
            name: 'Basketball Immersion',
            type: 'platform',
            category: 'teaching',
            description: "Chris Oliver's game-based teaching and podcast.",
            whyRecommend:
              'Revolutionary approach to basketball coaching that focuses on game-based learning rather than isolated skill drills.',
            website: 'basketballimmersion.com',
            podcast: 'Basketball Immersion Podcast',
            tags: ['game-based', 'coaching', 'podcast', 'chris oliver'],
            featured: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15',
          },
          {
            id: '2',
            name: 'Transforming Basketball',
            type: 'platform',
            category: 'development',
            description:
              'Constraints-led coaching, new-school development ideas.',
            whyRecommend:
              'Cutting-edge approach to skill development using constraints-led coaching principles.',
            website: 'transformingbasketball.com',
            tags: ['constraints-led', 'skill development', 'modern coaching'],
            featured: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-10',
          },
          {
            id: '3',
            name: 'Rob Gray – Perception & Action Podcast',
            type: 'podcast',
            category: 'science',
            description:
              'Skill acquisition science applied to real basketball.',
            whyRecommend:
              'Bridges the gap between academic research and practical basketball coaching.',
            website: 'perceptionaction.com/podcast',
            podcast: 'Perception & Action Podcast',
            tags: ['skill acquisition', 'science', 'research', 'rob gray'],
            featured: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-08',
          },
          {
            id: '4',
            name: 'By Any Means Basketball',
            type: 'social',
            category: 'creativity',
            description: 'Creative, modern skill development.',
            whyRecommend:
              'Innovative approach to skill development that pushes creative boundaries.',
            social: '@byanymeansbasketball',
            instagram: '@byanymeansbasketball',
            tags: ['creativity', 'skill development', 'innovation'],
            featured: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-05',
          },
          {
            id: '5',
            name: 'Steve Dagg Basketball',
            type: 'social',
            category: 'global',
            description:
              'Game transfer, decision training, global hoops insights.',
            whyRecommend:
              'Unique perspective on basketball from a global coaching standpoint.',
            social: '@stevedaggbasketball',
            instagram: '@stevedaggbasketball',
            tags: ['global', 'decision training', 'game transfer'],
            featured: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-03',
          },
        ];

        // Mock resources data (secondary section)
        const mockResources: Resource[] = [
          {
            id: '1',
            title: 'MP Basketball Philosophy Guide',
            type: 'pdf',
            description:
              'Core principles and methodology behind Max Potential Basketball.',
            fileSize: '2.1 MB',
            downloads: 156,
            createdAt: '2024-01-15',
          },
          {
            id: '2',
            title: 'Player Development Assessment Template',
            type: 'template',
            description:
              'Comprehensive player evaluation and development tracking.',
            fileSize: '1.8 MB',
            downloads: 89,
            createdAt: '2024-01-10',
          },
        ];

        // Validate inspirations data
        const validatedInspirations =
          InspirationsArraySchema.safeParse(mockInspirations);
        if (!validatedInspirations.success) {
          console.error(
            'Invalid inspirations data:',
            validatedInspirations.error
          );
          throw new Error('Invalid inspirations data received');
        }

        // Validate resources data
        const validatedResources =
          ResourcesArraySchema.safeParse(mockResources);
        if (!validatedResources.success) {
          console.error('Invalid resources data:', validatedResources.error);
          throw new Error('Invalid resources data received');
        }

        setInspirations(validatedInspirations.data);
        setResources(validatedResources.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update selected inspiration when selectedInspirationId changes
  useEffect(() => {
    if (selectedInspirationId) {
      const inspiration = inspirations.find(
        i => i.id === selectedInspirationId
      );
      setSelectedInspiration(inspiration || null);
    } else {
      setSelectedInspiration(null);
    }
  }, [selectedInspirationId, inspirations]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#161616] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-zinc-400 text-lg font-semibold mb-4">
            Loading resources & inspirations...
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
      {/* Coming Soon Overlay */}
      <ComingSoonOverlay
        title="Resources & Inspirations Coming Soon!"
        description="Our inspiration curation and resource sharing system is in development. You can see the layout and structure, but the full curation and sharing features are being built. Let us know what inspires you!"
        feedbackLink="mailto:coach@example.com?subject=MPB%20Inspirations%20Feedback"
      />

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
        {/* LEFT PANE: Featured Inspirations */}
        <div
          className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-[#d8cc97]">
              Resources & Inspirations
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              These are the coaches, thinkers, and platforms shaping my
              philosophy and practice. If you want to go deep, start here.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search inspirations..."
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
                  'teaching',
                  'development',
                  'science',
                  'creativity',
                  'global',
                ].map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setCategoryFilter(category);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 text-white capitalize"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Inspirations Grid */}
          <div className="grid grid-cols-1 gap-4 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredInspirationsList.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-8">
                No inspirations found
              </div>
            ) : (
              filteredInspirationsList.map(inspiration => (
                <div
                  key={inspiration.id}
                  onClick={() => handleInspirationSelect(inspiration.id)}
                  className={`p-6 rounded-lg cursor-pointer transition-all border ${
                    selectedInspirationId === inspiration.id
                      ? 'bg-[#d8cc97] text-black border-[#d8cc97]'
                      : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#d8cc97] rounded-full flex items-center justify-center">
                        <Heart size={20} className="text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {inspiration.name}
                        </h3>
                        <p className="text-sm text-zinc-400 capitalize">
                          {inspiration.category} • {inspiration.type}
                        </p>
                      </div>
                    </div>
                    {inspiration.featured && (
                      <span className="px-2 py-1 bg-[#d8cc97] text-black text-xs font-semibold rounded">
                        Featured
                      </span>
                    )}
                  </div>

                  <p className="text-sm mb-3 leading-relaxed">
                    {inspiration.description}
                  </p>

                  <div className="flex items-center gap-3 mb-3">
                    {inspiration.website && (
                      <a
                        href={`https://${inspiration.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[#d8cc97] hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        <Globe size={12} />
                        Website
                      </a>
                    )}
                    {inspiration.social && (
                      <a
                        href={`https://instagram.com/${inspiration.social.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[#d8cc97] hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        <Instagram size={12} />
                        {inspiration.social}
                      </a>
                    )}
                    {inspiration.podcast && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <Mic size={12} />
                        Podcast
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {inspiration.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-zinc-700 text-xs text-white rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CENTER PANE: Inspiration Details */}
        <div
          className="w-1/2 border-r border-zinc-800 p-8 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            {selectedInspirationId
              ? `${inspirations.find(i => i.id === selectedInspirationId)?.name}`
              : 'Featured Inspirations'}
          </h2>

          {selectedInspiration ? (
            <div className="space-y-6">
              {/* Inspiration Details Card */}
              <div
                className="bg-zinc-800 p-6 rounded-lg"
                style={{ background: '#181818' }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#d8cc97] rounded-full flex items-center justify-center">
                    <Heart size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#d8cc97]">
                      {selectedInspiration.name}
                    </h3>
                    <p className="text-sm text-zinc-400 capitalize">
                      {selectedInspiration.category} •{' '}
                      {selectedInspiration.type}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-base font-semibold text-white mb-2">
                    Why I Recommend
                  </h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {selectedInspiration.whyRecommend}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-base font-semibold text-white mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {selectedInspiration.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {selectedInspiration.website && (
                    <div>
                      <p className="text-zinc-400 text-sm">Website</p>
                      <a
                        href={`https://${selectedInspiration.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#d8cc97] hover:underline text-sm flex items-center gap-1"
                      >
                        {selectedInspiration.website}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                  {selectedInspiration.social && (
                    <div>
                      <p className="text-zinc-400 text-sm">Social</p>
                      <a
                        href={`https://instagram.com/${selectedInspiration.social.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#d8cc97] hover:underline text-sm flex items-center gap-1"
                      >
                        {selectedInspiration.social}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                  {selectedInspiration.podcast && (
                    <div>
                      <p className="text-zinc-400 text-sm">Podcast</p>
                      <span className="text-white text-sm">
                        {selectedInspiration.podcast}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-zinc-400 text-sm mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInspiration.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-zinc-700 text-xs text-white rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personal Note */}
              <div
                className="bg-zinc-800 p-6 rounded-lg"
                style={{ background: '#181818' }}
              >
                <h4 className="text-base font-bold text-[#d8cc97] mb-3">
                  Personal Note
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  I'm always learning. If you think there's someone or something
                  missing, reach out and put me on.
                </p>
                <button className="px-4 py-2 bg-[#d8cc97] text-black font-semibold rounded hover:bg-[#c4b883] transition-colors">
                  Suggest an Inspiration
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              Select an inspiration to learn more about why I recommend it.
            </div>
          )}
        </div>

        {/* RIGHT PANE: Resources & Community */}
        <div
          className="w-1/4 p-8 bg-black flex flex-col justify-start min-h-screen"
          style={{ background: 'black' }}
        >
          <h2 className="text-xl font-bold mb-6 text-[#d8cc97] mt-0">
            Resources & Community
          </h2>

          {/* Quick Downloads */}
          <div
            className="bg-zinc-800 p-6 rounded-lg mb-6"
            style={{ background: '#181818' }}
          >
            <h3 className="text-base font-bold text-[#d8cc97] mb-4">
              Quick Downloads
            </h3>
            <div className="space-y-3">
              {resources.map(resource => (
                <div key={resource.id} className="p-3 bg-zinc-700 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={14} className="text-[#d8cc97]" />
                    <p className="text-sm font-semibold text-white">
                      {resource.title}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-400 mb-2">
                    {resource.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">
                      {resource.fileSize} • {resource.downloads} downloads
                    </span>
                    <button className="text-xs text-[#d8cc97] hover:underline">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Stats */}
          <div
            className="bg-zinc-800 p-6 rounded-lg mb-6"
            style={{ background: '#181818' }}
          >
            <h3 className="text-base font-bold text-[#d8cc97] mb-4">
              Community
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">
                  Featured Inspirations
                </span>
                <span className="text-sm text-white font-semibold">
                  {inspirations.filter(i => i.featured).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Total Resources</span>
                <span className="text-sm text-white font-semibold">
                  {resources.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Categories</span>
                <span className="text-sm text-white font-semibold">
                  {new Set(inspirations.map(i => i.category)).size}
                </span>
              </div>
            </div>
          </div>

          {/* Get Involved */}
          <div
            className="bg-zinc-800 p-6 rounded-lg"
            style={{ background: '#181818' }}
          >
            <h3 className="text-base font-bold text-[#d8cc97] mb-4">
              Get Involved
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-[#d8cc97] text-black font-semibold rounded hover:bg-[#c4b883] transition-colors text-sm">
                Nominate an Inspiration
              </button>
              <button className="w-full p-3 border border-[#d8cc97] text-[#d8cc97] font-semibold rounded hover:bg-[#d8cc97] hover:text-black transition-colors text-sm">
                Share Your Story
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
