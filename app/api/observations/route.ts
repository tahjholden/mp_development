import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  PersonType, 
  Capability, 
  hasCapability,
  getDataAccessConditions
} from '@/lib/db/role-logic';
import { getCurrentUser } from '@/lib/db/user-service';
import { v4 as uuidv4 } from 'uuid';

// Mock data for observations
// In a real implementation, this would be stored in the database
const mockObservations = [
  {
    id: '1',
    playerId: 'player-1',
    playerName: 'Andrew Hemschoot',
    coachId: 'coach-1',
    coachName: 'Tahj Holden',
    title: 'Shooting Form Analysis',
    description: 'Andrew showed excellent progress with his shooting form today. His elbow alignment has improved significantly, resulting in better shot consistency.',
    type: 'practice',
    category: 'Shooting',
    rating: 4,
    date: '2025-06-24T00:00:00Z',
    tags: ['Shooting', 'Form', 'Improvement'],
    notes: 'Continue to work on follow-through and release point.',
    private: false,
    createdAt: '2025-06-24T15:30:00Z',
    updatedAt: '2025-06-24T15:30:00Z'
  },
  {
    id: '2',
    playerId: 'player-2',
    playerName: 'Ben Swersky',
    coachId: 'coach-1',
    coachName: 'Tahj Holden',
    title: 'Game Performance Review',
    description: 'Ben demonstrated excellent court vision during the scrimmage. He made several key passes that led to easy baskets and showed good decision-making under pressure.',
    type: 'game',
    category: 'Basketball IQ',
    rating: 5,
    date: '2025-06-23T00:00:00Z',
    tags: ['Passing', 'Court Vision', 'Decision Making'],
    notes: 'Defensive positioning needs work - he was caught flat-footed several times when his opponent drove to the basket.',
    private: true,
    createdAt: '2025-06-23T18:45:00Z',
    updatedAt: '2025-06-23T18:45:00Z'
  },
  {
    id: '3',
    playerId: 'player-1',
    playerName: 'Andrew Hemschoot',
    coachId: 'coach-2',
    coachName: 'Assistant Coach',
    title: 'Ball Handling Session',
    description: 'Andrew's ball handling has shown improvement. He completed the advanced dribbling circuit with fewer errors than last session.',
    type: 'skill_development',
    category: 'Dribbling',
    rating: 3,
    date: '2025-06-20T00:00:00Z',
    tags: ['Ball Handling', 'Dribbling', 'Improvement'],
    notes: 'Still needs to work on his left hand control and keeping his head up while dribbling at speed.',
    private: false,
    createdAt: '2025-06-20T14:15:00Z',
    updatedAt: '2025-06-20T14:15:00Z'
  },
  {
    id: '4',
    playerId: 'player-3',
    playerName: 'Cole Holden',
    coachId: 'coach-1',
    coachName: 'Tahj Holden',
    title: 'Conditioning Assessment',
    description: 'Cole showed excellent hustle during practice drills today. His conditioning has improved significantly, and he was able to maintain high energy throughout the entire session.',
    type: 'physical',
    category: 'Conditioning',
    rating: 4,
    date: '2025-06-19T00:00:00Z',
    tags: ['Conditioning', 'Hustle', 'Endurance'],
    notes: 'His defensive footwork is showing improvement, particularly in close-out situations.',
    private: false,
    createdAt: '2025-06-19T16:00:00Z',
    updatedAt: '2025-06-19T16:00:00Z'
  },
  {
    id: '5',
    playerId: 'player-4',
    playerName: 'Will Gorenstein',
    coachId: 'coach-2',
    coachName: 'Assistant Coach',
    title: 'Mental Toughness Session',
    description: 'Will demonstrated excellent mental toughness during high-pressure drills. He maintained focus and composure even when fatigued.',
    type: 'mental',
    category: 'Leadership',
    rating: 5,
    date: '2025-06-18T00:00:00Z',
    tags: ['Mental Toughness', 'Leadership', 'Focus'],
    notes: 'He is becoming a vocal leader on the court, which is great to see.',
    private: true,
    createdAt: '2025-06-18T13:20:00Z',
    updatedAt: '2025-06-18T13:20:00Z'
  }
];

// Team assignments for role-based filtering
const mockTeamAssignments = {
  'player-1': 'team-1',
  'player-2': 'team-2',
  'player-3': 'team-1',
  'player-4': 'team-2',
  'coach-1': ['team-1', 'team-2'],
  'coach-2': ['team-1']
};

/**
 * GET handler for /api/observations
 * Returns observations based on user's role and permissions
 * 
 * Superadmin/Admin: All observations
 * Coach: Observations for players on their teams
 * Player: Only their own observations (excluding private ones from other coaches)
 * Other roles: No access
 */
export async function GET() {
  try {
    const supabase = createClient();
    
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's unified data with roles
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user ID for filtering
    const userId = currentUser.id;
    const userRole = currentUser.primaryRole;
    const isAdmin = currentUser.isAdmin;
    const isSuperadmin = currentUser.isSuperadmin;

    // Check if user has capability to view observations
    let hasAccess = false;
    
    if (userRole === PersonType.PLAYER) {
      // Players can view their own observations
      hasAccess = await hasCapability(userId, Capability.VIEW_OWN_OBSERVATIONS);
    } else if (userRole === PersonType.COACH) {
      // Coaches can view team observations
      hasAccess = await hasCapability(userId, Capability.ADD_OBSERVATION);
    } else if (isAdmin || isSuperadmin) {
      // Admins and superadmins have access
      hasAccess = true;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Filter observations based on user role
    let filteredObservations = [];
    
    if (isSuperadmin) {
      // Superadmin sees all observations
      filteredObservations = mockObservations;
    } else if (isAdmin) {
      // Admin sees all observations in their organization
      // For mock data, we'll just return all observations
      filteredObservations = mockObservations;
    } else if (userRole === PersonType.COACH) {
      // Coach sees observations for players on their teams
      const coachTeams = mockTeamAssignments[userId] || [];
      filteredObservations = mockObservations.filter(obs => {
        const playerTeam = mockTeamAssignments[obs.playerId];
        return coachTeams.includes(playerTeam) || obs.coachId === userId;
      });
    } else if (userRole === PersonType.PLAYER) {
      // Player sees only their own observations, excluding private ones
      filteredObservations = mockObservations.filter(obs => 
        obs.playerId === userId && (!obs.private || obs.coachId === userId)
      );
    }

    return NextResponse.json(filteredObservations);
  } catch (error) {
    console.error('Error fetching observations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST handler for /api/observations
 * Creates a new observation
 * 
 * Requires coach, admin, or superadmin role
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's unified data with roles
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has capability to add observations
    const canAddObservations = await hasCapability(currentUser.id, Capability.ADD_OBSERVATION);
    if (!canAddObservations && !currentUser.isAdmin && !currentUser.isSuperadmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['playerId', 'title', 'description', 'type', 'category', 'rating', 'date'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Validate observation type
    const validTypes = ['practice', 'game', 'skill_development', 'physical', 'mental', 'other'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: `Invalid observation type: ${body.type}` }, { status: 400 });
    }

    // Validate rating (1-5)
    const rating = parseInt(body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Process tags if provided as a comma-separated string
    let tags = body.tags || [];
    if (typeof body.tags === 'string') {
      tags = body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
    }

    // Create new observation
    const newObservation = {
      id: uuidv4(),
      playerId: body.playerId,
      playerName: body.playerName || 'Player Name', // In a real app, we'd look this up
      coachId: currentUser.id,
      coachName: currentUser.displayName || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
      title: body.title,
      description: body.description,
      type: body.type,
      category: body.category,
      rating: rating,
      date: body.date,
      tags: tags,
      notes: body.notes || '',
      private: body.private === true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, we would save to the database here
    // For mock purposes, we'll just return the new observation
    
    return NextResponse.json(newObservation, { status: 201 });
  } catch (error) {
    console.error('Error creating observation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Dynamic route handlers for /api/observations/[id]
 */

export async function PUT(request: Request) {
  try {
    const supabase = createClient();
    
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's unified data with roles
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has capability to edit observations
    const canEditObservations = await hasCapability(currentUser.id, Capability.ADD_OBSERVATION);
    if (!canEditObservations && !currentUser.isAdmin && !currentUser.isSuperadmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body and URL
    const body = await request.json();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Observation ID is required' }, { status: 400 });
    }

    // Find the observation to update
    // In a real app, this would be a database query
    const observationIndex = mockObservations.findIndex(obs => obs.id === id);
    if (observationIndex === -1) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 });
    }

    const observation = mockObservations[observationIndex];

    // Check if user has permission to edit this observation
    // Only the coach who created it, or admins/superadmins can edit
    if (observation.coachId !== currentUser.id && !currentUser.isAdmin && !currentUser.isSuperadmin) {
      return NextResponse.json({ error: 'You do not have permission to edit this observation' }, { status: 403 });
    }

    // Validate observation type if provided
    if (body.type) {
      const validTypes = ['practice', 'game', 'skill_development', 'physical', 'mental', 'other'];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json({ error: `Invalid observation type: ${body.type}` }, { status: 400 });
      }
    }

    // Validate rating if provided
    if (body.rating !== undefined) {
      const rating = parseInt(body.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
      }
    }

    // Process tags if provided as a comma-separated string
    let tags = body.tags;
    if (typeof body.tags === 'string') {
      tags = body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
    }

    // Update the observation
    // In a real app, this would update the database
    const updatedObservation = {
      ...observation,
      title: body.title || observation.title,
      description: body.description || observation.description,
      type: body.type || observation.type,
      category: body.category || observation.category,
      rating: body.rating !== undefined ? parseInt(body.rating) : observation.rating,
      date: body.date || observation.date,
      tags: tags || observation.tags,
      notes: body.notes !== undefined ? body.notes : observation.notes,
      private: body.private !== undefined ? body.private : observation.private,
      updatedAt: new Date().toISOString()
    };

    // In a real app, we would save to the database here
    // For mock purposes, we'll just return the updated observation
    
    return NextResponse.json(updatedObservation);
  } catch (error) {
    console.error('Error updating observation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's unified data with roles
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Observation ID is required' }, { status: 400 });
    }

    // Find the observation to delete
    // In a real app, this would be a database query
    const observationIndex = mockObservations.findIndex(obs => obs.id === id);
    if (observationIndex === -1) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 });
    }

    const observation = mockObservations[observationIndex];

    // Check if user has permission to delete this observation
    // Only the coach who created it, or admins/superadmins can delete
    if (observation.coachId !== currentUser.id && !currentUser.isAdmin && !currentUser.isSuperadmin) {
      return NextResponse.json({ error: 'You do not have permission to delete this observation' }, { status: 403 });
    }

    // Delete the observation
    // In a real app, this would delete from the database or mark as deleted
    
    return NextResponse.json({ success: true, message: 'Observation deleted successfully' });
  } catch (error) {
    console.error('Error deleting observation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
