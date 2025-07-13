import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      console.log('No user found, returning mock activities for development');
      // For development, return mock data if no user is found
      const activities = [
        {
          id: '1',
          type: 'player_added',
          message: 'New player John Smith added to Varsity Boys',
          time: '30 minutes ago',
          user: 'Coach Johnson',
        },
        {
          id: '2',
          type: 'session_scheduled',
          message: 'Shooting practice scheduled for tomorrow at 3:00 PM',
          time: '1 hour ago',
          user: 'Coach Williams',
        },
        {
          id: '3',
          type: 'observation_added',
          message: 'New observation added for Sarah Johnson',
          time: '2 hours ago',
          user: 'Coach Davis',
        },
        {
          id: '4',
          type: 'development_plan_updated',
          message: 'Development plan updated for Mike Wilson',
          time: '4 hours ago',
          user: 'Coach Brown',
        },
        {
          id: '5',
          type: 'team_created',
          message: 'New team "JV Girls" created',
          time: '6 hours ago',
          user: 'Admin',
        },
      ];
      return Response.json(activities);
    }

    // For now, return mock data since we don't have an activities table yet
    // In a real implementation, you would query the activities table
    const activities = [
      {
        id: '1',
        type: 'player_added',
        message: 'New player John Smith added to Varsity Boys',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        user: 'Coach Johnson',
      },
      {
        id: '2',
        type: 'session_scheduled',
        message: 'Shooting practice scheduled for tomorrow at 3:00 PM',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        user: 'Coach Williams',
      },
      {
        id: '3',
        type: 'observation_added',
        message: 'New observation added for Sarah Johnson',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        user: 'Coach Davis',
      },
      {
        id: '4',
        type: 'development_plan_updated',
        message: 'Development plan updated for Mike Wilson',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        user: 'Coach Brown',
      },
      {
        id: '5',
        type: 'team_created',
        message: 'New team "JV Girls" created',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        user: 'Admin',
      },
    ];

    return Response.json(activities);
  } catch (error) {
    console.error('Error fetching dashboard activities:', error);
    return Response.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
} 