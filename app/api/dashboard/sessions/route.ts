import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      console.log('No user found, returning mock sessions for development');
      // For development, return mock data if no user is found
      const sessions = [
        {
          id: '1',
          title: 'Shooting Practice',
          date: '2024-01-15',
          time: '3:00 PM',
          team: 'Varsity Boys',
          type: 'Practice',
        },
        {
          id: '2',
          title: 'Defensive Drills',
          date: '2024-01-16',
          time: '4:30 PM',
          team: 'JV Girls',
          type: 'Training',
        },
        {
          id: '3',
          title: 'Game Review',
          date: '2024-01-17',
          time: '2:00 PM',
          team: 'Varsity Boys',
          type: 'Meeting',
        },
        {
          id: '4',
          title: 'Conditioning',
          date: '2024-01-18',
          time: '5:00 PM',
          team: 'All Teams',
          type: 'Workout',
        },
        {
          id: '5',
          title: 'Skills Assessment',
          date: '2024-01-19',
          time: '3:30 PM',
          team: 'Freshman Boys',
          type: 'Evaluation',
        },
      ];
      return Response.json(sessions);
    }

    // For now, return mock data since we don't have a sessions table yet
    // In a real implementation, you would query the sessions table
    const sessions = [
      {
        id: '1',
        title: 'Shooting Practice',
        date: '2024-01-15',
        time: '3:00 PM',
        team: 'Varsity Boys',
        type: 'Practice',
      },
      {
        id: '2',
        title: 'Defensive Drills',
        date: '2024-01-16',
        time: '4:30 PM',
        team: 'JV Girls',
        type: 'Training',
      },
      {
        id: '3',
        title: 'Game Review',
        date: '2024-01-17',
        time: '2:00 PM',
        team: 'Varsity Boys',
        type: 'Meeting',
      },
      {
        id: '4',
        title: 'Conditioning',
        date: '2024-01-18',
        time: '5:00 PM',
        team: 'All Teams',
        type: 'Workout',
      },
      {
        id: '5',
        title: 'Skills Assessment',
        date: '2024-01-19',
        time: '3:30 PM',
        team: 'Freshman Boys',
        type: 'Evaluation',
      },
    ];

    return Response.json(sessions);
  } catch (error) {
    console.error('Error fetching dashboard sessions:', error);
    return Response.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
