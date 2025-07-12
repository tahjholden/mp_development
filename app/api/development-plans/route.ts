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

// Mock data for development plans
// In a real implementation, this would be stored in the database
const mockDevelopmentPlans = [
  {
    id: '1',
    playerId: 'player-1',
    playerName: 'Andrew Hemschoot',
    coachId: 'coach-1',
    coachName: 'Tahj Holden',
    title: 'Shooting Form Improvement',
    description: 'Focus on improving shooting form with emphasis on elbow alignment and follow-through.',
    status: 'active',
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2025-08-01T00:00:00Z',
    goals: [
      {
        id: 'goal-1',
        title: 'Elbow Alignment',
        description: 'Maintain proper elbow alignment during shot',
        status: 'in_progress',
        targetDate: '2025-06-15T00:00:00Z'
      },
      {
        id: 'goal-2',
        title: 'Follow-through',
        description: 'Hold follow-through until ball reaches basket',
        status: 'not_started',
        targetDate: '2025-07-01T00:00:00Z'
      },
      {
        id: 'goal-3',
        title: 'Shot Consistency',
        description: 'Achieve 70% free throw percentage',
        status: 'not_started',
        targetDate: '2025-07-15T00:00:00Z'
      }
    ],
    createdAt: '2025-05-30T10:00:00Z',
    updatedAt: '2025-05-30T10:00:00Z'
  },
  {
    id: '2',
    playerId: 'player-2',
    playerName: 'Ben Swersky',
    coachId: 'coach-1',
    coachName: 'Tahj Holden',
    title: 'Ball Handling Development',
    description: 'Improve ball handling skills with focus on weak hand development and control under pressure.',
    status: 'draft',
    startDate: '2025-06-15T00:00:00Z',
    endDate: '2025-09-15T00:00:00Z',
    goals: [
      {
        id: 'goal-4',
        title: 'Weak Hand Dribbling',
        description: 'Complete daily weak hand dribbling drills',
        status: 'not_started',
        targetDate: '2025-07-15T00:00:00Z'
      },
      {
        id: 'goal-5',
        title: 'Pressure Handling',
        description: 'Maintain control while under defensive pressure',
        status: 'not_started',
        targetDate: '2025-08-15T00:00:00Z'
      }
    ],
    createdAt: '2025-06-10T14:30:00Z',
    updatedAt: '2025-06-10T14:30:00Z'
  },
  {
    id: '3',
    playerId: 'player-1',
    playerName: 'Andrew Hemschoot',
    coachId: 'coach-2',
    coachName: 'Assistant Coach',
    title: 'Defensive Positioning',
    description: 'Improve defensive stance and positioning to become a better on-ball defender.',
    status: 'completed',
    startDate: '2025-05-01T00:00:00Z',
    endDate: '2025-06-01T00:00:00Z',
    goals: [
      {
        id: 'goal-6',
        title: 'Defensive Stance',
        description: 'Maintain proper defensive stance throughout games',
        status: 'completed',
        targetDate: '2025-05-15T00:00:00Z',
        completedDate: '2025-05-14T00:00:00Z'
      },
      {
        id: 'goal-7',
        title: 'Lateral Movement',
        description: 'Improve lateral quickness for on-ball defense',
        status: 'completed',
        targetDate: '2025-05-30T00:00:00Z',
        completedDate: '2025-05-28T00:00:00Z'
      }
    ],
    createdAt: '2025-04-30T09:15:00Z',
    updatedAt: '2025-06-02T11:00:00Z'
  }
];

// Team assignments for role-based filtering
const mockTeamAssignments = {
  'player-1': 'team-1',
  'player-2': 'team-2',
  'player-3': 'team-1',
  'coach-1': ['team-1', 'team-2'],
  'coach-2': ['team-1']
};

/**
 * GET handler for /api/development-plans
 * Returns development plans based on user's role and permissions
 * 
 * Superadmin/Admin: All plans
 * Coach: Plans for players on their teams
 * Player: Only their own plans
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

    // Check if user has capability to view development plans
    let hasAccess = false;
    
    if (userRole === PersonType.PLAYER) {
      // Players can view their own plans
      hasAccess = await hasCapability(userId, Capability.VIEW_OWN_DEVELOPMENT_PLANS);
    } else if (userRole === PersonType.COACH) {
      // Coaches can view team plans
      hasAccess = await hasCapability(userId, Capability.CREATE_DEVELOPMENT_PLAN);
    } else if (isAdmin || isSuperadmin) {
      // Admins and superadmins have access
      hasAccess = true;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Filter plans based on user role
    let filteredPlans = [];
    
    if (isSuperadmin) {
      // Superadmin sees all plans
      filteredPlans = mockDevelopmentPlans;
    } else if (isAdmin) {
      // Admin sees all plans in their organization
      // For mock data, we'll just return all plans
      filteredPlans = mockDevelopmentPlans;
    } else if (userRole === PersonType.COACH) {
      // Coach sees plans for players on their teams
      const coachTeams = mockTeamAssignments[userId] || [];
      filteredPlans = mockDevelopmentPlans.filter(plan => {
        const playerTeam = mockTeamAssignments[plan.playerId];
        return coachTeams.includes(playerTeam) || plan.coachId === userId;
      });
    } else if (userRole === PersonType.PLAYER) {
      // Player sees only their own plans
      filteredPlans = mockDevelopmentPlans.filter(plan => plan.playerId === userId);
    }

    return NextResponse.json(filteredPlans);
  } catch (error) {
    console.error('Error fetching development plans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST handler for /api/development-plans
 * Creates a new development plan
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

    // Check if user has capability to create development plans
    const canCreatePlans = await hasCapability(currentUser.id, Capability.CREATE_DEVELOPMENT_PLAN);
    if (!canCreatePlans && !currentUser.isAdmin && !currentUser.isSuperadmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['playerId', 'title', 'description', 'startDate', 'endDate', 'status'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Create new development plan
    const newPlan = {
      id: uuidv4(),
      playerId: body.playerId,
      playerName: body.playerName || 'Player Name', // In a real app, we'd look this up
      coachId: currentUser.id,
      coachName: currentUser.displayName || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
      title: body.title,
      description: body.description,
      status: body.status,
      startDate: body.startDate,
      endDate: body.endDate,
      goals: body.goals || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, we would save to the database here
    // For mock purposes, we'll just return the new plan
    
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating development plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
