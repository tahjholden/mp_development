'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Brain,
  Lightbulb,
  Target,
  Zap,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { ComingSoonOverlay } from '@/components/ComingSoonOverlay';

// Types for AI features
interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'training' | 'strategy' | 'health';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  date: string;
  actionable: boolean;
  recommendations: string[];
}

interface AIPrediction {
  id: string;
  type: 'performance' | 'injury' | 'development' | 'team';
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  factors: string[];
  confidence: number;
}

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  category: 'drill' | 'training' | 'recovery' | 'nutrition';
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  timeRequired: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Role-specific content for AI features
const getAIFeaturesContent = (role: string) => {
  const baseContent = {
    title: 'AI-Powered Insights',
    description:
      'Leverage artificial intelligence for personalized recommendations and predictive analytics',
  };

  switch (role) {
    case 'admin':
    case 'superadmin':
      return {
        ...baseContent,
        title: 'Organization AI Insights',
        description:
          'AI-powered analytics and recommendations for your entire organization',
        insights: [
          {
            id: '1',
            title: 'Team Performance Optimization',
            description:
              'AI analysis suggests rotating players more frequently to maintain energy levels',
            category: 'performance' as const,
            confidence: 87,
            impact: 'high' as const,
            date: '2024-01-15',
            actionable: true,
            recommendations: [
              'Implement 5-minute rotation intervals',
              'Monitor player fatigue levels',
              'Adjust training intensity based on game schedule',
            ],
          },
          {
            id: '2',
            title: 'Injury Risk Assessment',
            description:
              'High injury risk detected for 3 players due to overtraining',
            category: 'health' as const,
            confidence: 92,
            impact: 'high' as const,
            date: '2024-01-14',
            actionable: true,
            recommendations: [
              'Reduce training intensity for affected players',
              'Implement recovery protocols',
              'Schedule rest days strategically',
            ],
          },
        ],
        predictions: [
          {
            id: '1',
            type: 'performance' as const,
            title: 'Season Win Prediction',
            description:
              'Based on current performance trends, team is projected to win 18-22 games',
            probability: 75,
            timeframe: 'Next 3 months',
            factors: [
              'Current win rate',
              'Player development',
              'Schedule difficulty',
            ],
            confidence: 82,
          },
          {
            id: '2',
            type: 'development' as const,
            title: 'Player Breakout Potential',
            description:
              '3 players showing signs of significant improvement potential',
            probability: 68,
            timeframe: 'Next 6 months',
            factors: [
              'Skill progression',
              'Physical development',
              'Mental readiness',
            ],
            confidence: 78,
          },
        ],
        suggestions: [
          {
            id: '1',
            title: 'Implement AI-Driven Training Plans',
            description:
              'Personalized training programs based on individual player data',
            category: 'training' as const,
            priority: 'high' as const,
            estimatedImpact: 85,
            timeRequired: 120,
            difficulty: 'intermediate' as const,
          },
          {
            id: '2',
            title: 'Predictive Analytics Dashboard',
            description:
              'Real-time insights into team and player performance trends',
            category: 'drill' as const,
            priority: 'medium' as const,
            estimatedImpact: 72,
            timeRequired: 90,
            difficulty: 'beginner' as const,
          },
        ],
      };
    case 'coach':
      return {
        ...baseContent,
        title: 'Coach AI Assistant',
        description:
          'AI-powered coaching insights and player development recommendations',
        insights: [
          {
            id: '1',
            title: 'Player Development Opportunity',
            description:
              'Point guard showing potential for improved 3-point shooting',
            category: 'performance' as const,
            confidence: 89,
            impact: 'medium' as const,
            date: '2024-01-15',
            actionable: true,
            recommendations: [
              'Add 15 minutes of shooting practice daily',
              'Focus on form correction',
              'Track progress weekly',
            ],
          },
          {
            id: '2',
            title: 'Team Chemistry Analysis',
            description:
              'Positive team dynamics detected, optimal for implementing new plays',
            category: 'strategy' as const,
            confidence: 76,
            impact: 'medium' as const,
            date: '2024-01-14',
            actionable: true,
            recommendations: [
              'Introduce new offensive plays',
              'Increase team building activities',
              'Leverage positive momentum',
            ],
          },
        ],
        predictions: [
          {
            id: '1',
            type: 'performance' as const,
            title: 'Next Game Performance',
            description: 'Team projected to perform 15% better than last game',
            probability: 82,
            timeframe: 'Next game',
            factors: [
              'Recent practice performance',
              'Player confidence',
              'Opponent analysis',
            ],
            confidence: 85,
          },
        ],
        suggestions: [
          {
            id: '1',
            title: 'Personalized Player Drills',
            description:
              'AI-generated drills based on individual player weaknesses',
            category: 'drill' as const,
            priority: 'high' as const,
            estimatedImpact: 78,
            timeRequired: 60,
            difficulty: 'intermediate' as const,
          },
        ],
      };
    case 'player':
      return {
        ...baseContent,
        title: 'Personal AI Coach',
        description:
          'Your personal AI assistant for skill development and performance optimization',
        insights: [
          {
            id: '1',
            title: 'Shooting Form Analysis',
            description:
              'AI detected slight inconsistency in your shooting form',
            category: 'performance' as const,
            confidence: 91,
            impact: 'high' as const,
            date: '2024-01-15',
            actionable: true,
            recommendations: [
              'Practice form correction drills',
              'Record and review your shots',
              'Focus on consistent release point',
            ],
          },
        ],
        predictions: [
          {
            id: '1',
            type: 'development' as const,
            title: 'Skill Development Timeline',
            description: 'Projected to reach next skill level in 3-4 weeks',
            probability: 88,
            timeframe: '3-4 weeks',
            factors: [
              'Current practice consistency',
              'Skill progression rate',
              'Coach feedback',
            ],
            confidence: 90,
          },
        ],
        suggestions: [
          {
            id: '1',
            title: 'Personalized Training Plan',
            description: 'AI-generated workout plan tailored to your goals',
            category: 'training' as const,
            priority: 'high' as const,
            estimatedImpact: 85,
            timeRequired: 45,
            difficulty: 'intermediate' as const,
          },
        ],
      };
    default:
      return {
        ...baseContent,
        insights: [],
        predictions: [],
        suggestions: [],
      };
  }
};

// Main component
export default function AIFeaturesPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Filter states
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(
    null
  );
  const [insightCategoryFilter, setInsightCategoryFilter] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Mock user role - in real app this would come from auth context
  const userRole = 'coach'; // This would be dynamic based on user role
  const aiContent = getAIFeaturesContent(userRole);

  const filteredInsights = insights.filter(insight => {
    return (
      insightCategoryFilter === 'all' ||
      insight.category === insightCategoryFilter
    );
  });

  // Handle insight selection
  const handleInsightSelect = (insightId: string) => {
    if (selectedInsightId === insightId) {
      setSelectedInsightId(null);
    } else {
      setSelectedInsightId(insightId);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/session');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set AI features data
        setInsights(aiContent.insights);
        setPredictions(aiContent.predictions);
        setSuggestions(aiContent.suggestions);

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch AI data'
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Removed aiContent from dependencies to prevent infinite loop

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-3 gap-6">
              <div className="h-64 bg-zinc-800 rounded"></div>
              <div className="h-64 bg-zinc-800 rounded"></div>
              <div className="h-64 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#d8cc97] mb-2">
            {aiContent.title}
          </h1>
          <p className="text-zinc-400">{aiContent.description}</p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - AI Insights */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#d8cc97] flex items-center gap-2">
                <Brain size={20} />
                AI Insights
              </h2>
              <div className="relative">
                <button
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded text-sm hover:bg-zinc-700 transition-colors"
                >
                  <Filter size={16} />
                  {insightCategoryFilter === 'all'
                    ? 'All'
                    : insightCategoryFilter}
                  {isCategoryDropdownOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-zinc-800 rounded shadow-lg z-10 min-w-[120px]">
                    {[
                      'all',
                      'performance',
                      'training',
                      'strategy',
                      'health',
                    ].map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          setInsightCategoryFilter(category);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 transition-colors capitalize"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredInsights.map(insight => (
                <div
                  key={insight.id}
                  onClick={() => handleInsightSelect(insight.id)}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    selectedInsightId === insight.id
                      ? 'border-[#d8cc97] bg-zinc-800'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{insight.title}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs capitalize ${
                          insight.impact === 'high'
                            ? 'bg-red-900 text-red-300'
                            : insight.impact === 'medium'
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-green-900 text-green-300'
                        }`}
                      >
                        {insight.impact}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {insight.confidence}%
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-400 mb-3">
                    {insight.description}
                  </p>

                  {insight.actionable && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-[#d8cc97]">
                        Recommendations:
                      </h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className="text-sm text-zinc-400 flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 bg-[#d8cc97] rounded-full"></div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-zinc-500 mt-2">{insight.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Center Column - AI Predictions */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
              <Target size={20} />
              AI Predictions
            </h2>

            <div className="space-y-4">
              {predictions.map(prediction => (
                <div
                  key={prediction.id}
                  className="border border-zinc-700 rounded p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-white">
                      {prediction.title}
                    </h3>
                    <div className="text-right">
                      <p className="text-[#d8cc97] font-bold">
                        {prediction.probability}%
                      </p>
                      <p className="text-xs text-zinc-400">
                        Confidence: {prediction.confidence}%
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-400 mb-3">
                    {prediction.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Timeframe</span>
                      <span className="text-white">{prediction.timeframe}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-zinc-300">
                        Key Factors:
                      </h4>
                      <ul className="space-y-1">
                        {prediction.factors.map((factor, index) => (
                          <li
                            key={index}
                            className="text-sm text-zinc-400 flex items-center gap-2"
                          >
                            <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - AI Suggestions */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold text-[#d8cc97] mb-4 flex items-center gap-2">
              <Lightbulb size={20} />
              AI Suggestions
            </h2>

            <div className="space-y-4">
              {suggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="border border-zinc-700 rounded p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-white">
                      {suggestion.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        suggestion.priority === 'high'
                          ? 'bg-red-900 text-red-300'
                          : suggestion.priority === 'medium'
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-green-900 text-green-300'
                      }`}
                    >
                      {suggestion.priority}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400 mb-3">
                    {suggestion.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Estimated Impact</span>
                      <span className="text-[#d8cc97] font-semibold">
                        {suggestion.estimatedImpact}%
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Time Required</span>
                      <span className="text-white">
                        {suggestion.timeRequired} min
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Difficulty</span>
                      <span
                        className={`capitalize ${
                          suggestion.difficulty === 'beginner'
                            ? 'text-green-300'
                            : suggestion.difficulty === 'intermediate'
                              ? 'text-yellow-300'
                              : 'text-red-300'
                        }`}
                      >
                        {suggestion.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-zinc-800 rounded">
              <h3 className="text-lg font-medium text-[#d8cc97] mb-2 flex items-center gap-2">
                <Zap size={18} />
                AI Features
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#d8cc97] rounded-full"></div>
                  <span className="text-zinc-300">
                    Real-time performance analysis
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#d8cc97] rounded-full"></div>
                  <span className="text-zinc-300">
                    Predictive injury prevention
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
                  <span className="text-zinc-500">
                    Advanced game strategy AI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Overlay - Hidden for superadmin */}
      {user?.personType !== 'superadmin' && (
        <ComingSoonOverlay
          title="AI Features Coming Soon!"
          description="We're developing advanced AI-powered features including predictive analytics, personalized training recommendations, and intelligent performance insights. Stay tuned for the future of basketball development."
        />
      )}
    </div>
  );
}
