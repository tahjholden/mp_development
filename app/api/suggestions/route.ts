import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { mpbcPlayerSkillChallenge, mpbcSkillTag } from '@/lib/db/schema';
import { inArray, desc, sql } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const playerIdsParam = searchParams.get('playerIds');

    if (!playerIdsParam) {
      return Response.json({ error: 'Player IDs required' }, { status: 400 });
    }

    const playerIds = playerIdsParam.split(',').filter(id => id.trim());

    if (playerIds.length === 0) {
      return Response.json(
        { error: 'No valid player IDs provided' },
        { status: 400 }
      );
    }

    const user = await getUser();
    if (!user) {
      // For development, return mock data if no user is found
      console.log(
        'No user session found, returning mock suggestions for development'
      );
    }

    if (!db) {
      return Response.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Get top skill tags from player skill challenges
    const skillTagCounts = await db
      .select({
        skillTagId: mpbcPlayerSkillChallenge.skillTagId,
        count: sql<number>`count(*)`,
      })
      .from(mpbcPlayerSkillChallenge)
      .where(inArray(mpbcPlayerSkillChallenge.playerId, playerIds))
      .groupBy(mpbcPlayerSkillChallenge.skillTagId)
      .orderBy(desc(sql`count(*)`))
      .limit(2);

    // Get skill tag details
    const skillTagIds = skillTagCounts
      .map(st => st.skillTagId)
      .filter((id): id is string => id !== null);
    const skillTags =
      skillTagIds.length > 0
        ? await db
            .select()
            .from(mpbcSkillTag)
            .where(inArray(mpbcSkillTag.id, skillTagIds))
        : [];

    // Mock drill suggestions based on skill tags
    const mockDrills = [
      {
        id: '1',
        name: 'Shooting Form Drill',
        category: 'shooting' as const,
        difficulty: 'intermediate' as const,
        duration: 15,
        description: 'Focus on proper shooting form and follow-through',
        cues: ['Elbow in', 'Follow through', 'Arc'],
        constraints: ['One-handed', 'No dribble'],
        players: 1,
        skillTags: ['shooting', 'form'],
      },
      {
        id: '2',
        name: 'Ball Handling Circuit',
        category: 'ball_handling' as const,
        difficulty: 'beginner' as const,
        duration: 20,
        description: 'Improve ball control and dribbling skills',
        cues: ['Low stance', 'Fingertip control', 'Head up'],
        constraints: ['Weak hand only', 'Speed variations'],
        players: 1,
        skillTags: ['ball_handling', 'control'],
      },
      {
        id: '3',
        name: 'Defensive Slide Drill',
        category: 'defense' as const,
        difficulty: 'intermediate' as const,
        duration: 10,
        description: 'Work on defensive footwork and positioning',
        cues: ['Stay low', 'Quick feet', 'Hands up'],
        constraints: ['No crossing feet', 'Maintain distance'],
        players: 2,
        skillTags: ['defense', 'footwork'],
      },
      {
        id: '4',
        name: '3-on-3 Competitive Drill',
        category: 'team_play' as const,
        difficulty: 'advanced' as const,
        duration: 25,
        description: 'Full-court 3-on-3 with emphasis on team coordination',
        cues: ['Communication', 'Spacing', 'Ball movement'],
        constraints: ['No dribbling', 'Must pass within 3 seconds'],
        players: 6,
        skillTags: ['team_play', 'communication'],
      },
      {
        id: '5',
        name: 'Group Shooting Contest',
        category: 'shooting' as const,
        difficulty: 'intermediate' as const,
        duration: 15,
        description: 'Competitive shooting drill for multiple players',
        cues: ['Quick release', 'Follow through', 'Confidence'],
        constraints: ['Time pressure', 'Progressive difficulty'],
        players: 4,
        skillTags: ['shooting', 'competition'],
      },
    ];

    // Mock constraint suggestions
    const mockConstraints = [
      {
        id: '1',
        name: 'Time Pressure',
        description: 'Complete drill within strict time limits',
        difficulty: 'intermediate',
        category: 'timing',
      },
      {
        id: '2',
        name: 'Space Limitation',
        description: 'Perform in confined space to improve control',
        difficulty: 'advanced',
        category: 'spatial',
      },
    ];

    // Mock combined suggestions
    const mockCombined = [
      {
        id: '1',
        name: 'Shooting Under Pressure',
        description: 'Shooting drill with time and space constraints',
        drill: mockDrills[0],
        constraint: mockConstraints[0],
        difficulty: 'intermediate',
      },
    ];

    // Return suggestions based on number of players
    const response = {
      drills:
        playerIds.length === 1
          ? mockDrills.slice(0, 2) // Individual: top 2 drills
          : mockDrills.filter(d => d.players >= playerIds.length).slice(0, 2), // Group: drills that support the group size
      constraints:
        playerIds.length === 1
          ? mockConstraints.slice(0, 2) // Individual: top 2 constraints
          : mockConstraints.slice(0, 1), // Group: top constraint
      combined:
        playerIds.length === 1
          ? mockCombined.slice(0, 1) // Individual: 1 combined suggestion
          : mockCombined.slice(0, 1), // Group: 1 combined suggestion
      skillTags: skillTags,
      playerCount: playerIds.length,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return Response.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
