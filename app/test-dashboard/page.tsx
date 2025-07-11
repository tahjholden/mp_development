import React from 'react';
import { Suspense } from 'react';
import UniversalCard from '@/components/ui/UniversalCard';
import UniversalButton from '@/components/ui/UniversalButton';
import { 
  Users, 
  UserRound, 
  Calendar, 
  Building, 
  Database, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { 
  getDatabaseCounts, 
  getUsers, 
  getGroups, 
  getSessions, 
  getOrganizations 
} from '@/lib/db/test-queries';

// Loading component
function LoadingCard() {
  return (
    <UniversalCard.Default className="h-48 animate-pulse">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 rounded-full bg-zinc-800 mb-4"></div>
        <div className="h-6 w-32 bg-zinc-800 rounded mb-2"></div>
        <div className="h-4 w-48 bg-zinc-800 rounded"></div>
      </div>
    </UniversalCard.Default>
  );
}

// Error component
function ErrorCard({ message }: { message: string }) {
  return (
    <UniversalCard.Danger>
      <div className="flex flex-col items-center p-4">
        <AlertCircle size={32} className="text-danger-500 mb-2" />
        <h3 className="text-lg font-semibold mb-1">Error Loading Data</h3>
        <p className="text-center text-zinc-400">{message}</p>
      </div>
    </UniversalCard.Danger>
  );
}

// Stats component
async function StatsSection() {
  try {
    const { userCount, groupCount, sessionCount, organizationCount } = await getDatabaseCounts();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UniversalCard.StatCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Users</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{userCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-zinc-800">
              <UserRound size={24} className="text-gold-500" />
            </div>
          </div>
        </UniversalCard.StatCard>
        
        <UniversalCard.StatCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Groups</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{groupCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-zinc-800">
              <Users size={24} className="text-gold-500" />
            </div>
          </div>
        </UniversalCard.StatCard>
        
        <UniversalCard.StatCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Sessions</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{sessionCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-zinc-800">
              <Calendar size={24} className="text-gold-500" />
            </div>
          </div>
        </UniversalCard.StatCard>
        
        <UniversalCard.StatCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Organizations</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{organizationCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-zinc-800">
              <Building size={24} className="text-gold-500" />
            </div>
          </div>
        </UniversalCard.StatCard>
      </div>
    );
  } catch (error) {
    console.error('Error fetching database counts:', error);
    return <ErrorCard message="Failed to load database statistics." />;
  }
}

// Users component
async function UsersSection() {
  try {
    const users = await getUsers(5);
    
    return (
      <UniversalCard.Default
        title="Recent Users"
        subtitle="Last 5 users added to the system"
        footer={
          <div className="flex justify-end w-full">
            <UniversalButton.Secondary size="sm" rightIcon={<ArrowRight size={16} />}>
              View All Users
            </UniversalButton.Secondary>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Admin</th>
                <th className="pb-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-white">{user.displayName || 'No Name'}</p>
                  </td>
                  <td className="py-3 pr-4 text-zinc-300">{user.email}</td>
                  <td className="py-3 pr-4">
                    {user.isSuperadmin ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gold-500/20 text-gold-500">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-500/20 text-zinc-400">
                        User
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-zinc-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">
                    No users found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </UniversalCard.Default>
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return <ErrorCard message="Failed to load user data." />;
  }
}

// Groups component
async function GroupsSection() {
  try {
    const groups = await getGroups(5);
    
    return (
      <UniversalCard.Default
        title="Recent Groups"
        subtitle="Last 5 groups created in the system"
        footer={
          <div className="flex justify-end w-full">
            <UniversalButton.Secondary size="sm" rightIcon={<ArrowRight size={16} />}>
              View All Groups
            </UniversalButton.Secondary>
          </div>
        }
      >
        <div className="space-y-3">
          {groups.map((group) => (
            <div 
              key={group.id} 
              className="flex items-center p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center mr-4">
                <Users className="h-5 w-5 text-gold-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{group.name}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Created on {new Date(group.createdAt).toLocaleDateString()}
                </p>
              </div>
              <UniversalButton.Ghost size="xs">View</UniversalButton.Ghost>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="py-8 text-center text-zinc-500">
              No groups found in the database.
            </div>
          )}
        </div>
      </UniversalCard.Default>
    );
  } catch (error) {
    console.error('Error fetching groups:', error);
    return <ErrorCard message="Failed to load group data." />;
  }
}

// Sessions component
async function SessionsSection() {
  try {
    const sessions = await getSessions(5);
    
    return (
      <UniversalCard.Default
        title="Recent Sessions"
        subtitle="Last 5 sessions in the system"
        footer={
          <div className="flex justify-end w-full">
            <UniversalButton.Secondary size="sm" rightIcon={<ArrowRight size={16} />}>
              View All Sessions
            </UniversalButton.Secondary>
          </div>
        }
      >
        <div className="space-y-3">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className="flex items-center p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center mr-4">
                <Calendar className="h-5 w-5 text-gold-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-white truncate">
                    {session.sessionType || 'Session'} #{session.sessionNumber || 'N/A'}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    session.status === 'completed' ? 'bg-success-500/20 text-success-500' :
                    session.status === 'scheduled' ? 'bg-gold-500/20 text-gold-500' :
                    'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {session.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center text-xs text-zinc-400 mt-1">
                  <span className="mr-2">{session.date ? new Date(session.date).toLocaleDateString() : 'No date'}</span>
                  {session.startTime && session.endTime && (
                    <span>{session.startTime} - {session.endTime}</span>
                  )}
                  {session.location && (
                    <span className="ml-2 text-zinc-500">@ {session.location}</span>
                  )}
                </div>
              </div>
              <UniversalButton.Ghost size="xs">View</UniversalButton.Ghost>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="py-8 text-center text-zinc-500">
              No sessions found in the database.
            </div>
          )}
        </div>
      </UniversalCard.Default>
    );
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return <ErrorCard message="Failed to load session data." />;
  }
}

// Organizations component
async function OrganizationsSection() {
  try {
    const organizations = await getOrganizations(5);
    
    return (
      <UniversalCard.Default
        title="Organizations"
        subtitle="Last 5 organizations in the system"
        footer={
          <div className="flex justify-end w-full">
            <UniversalButton.Secondary size="sm" rightIcon={<ArrowRight size={16} />}>
              View All Organizations
            </UniversalButton.Secondary>
          </div>
        }
      >
        <div className="space-y-3">
          {organizations.map((org) => (
            <div 
              key={org.id} 
              className="flex items-center p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center mr-4">
                <Building className="h-5 w-5 text-gold-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{org.name}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Created on {new Date(org.createdAt).toLocaleDateString()}
                </p>
              </div>
              <UniversalButton.Ghost size="xs">View</UniversalButton.Ghost>
            </div>
          ))}
          {organizations.length === 0 && (
            <div className="py-8 text-center text-zinc-500">
              No organizations found in the database.
            </div>
          )}
        </div>
      </UniversalCard.Default>
    );
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return <ErrorCard message="Failed to load organization data." />;
  }
}

export default function DatabaseTestPage() {
  return (
    <>
      {/* Stats Section */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        }
      >
        <StatsSection />
      </Suspense>
        
      {/* Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Suspense fallback={<LoadingCard />}>
          <UsersSection />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <GroupsSection />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<LoadingCard />}>
          <SessionsSection />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <OrganizationsSection />
        </Suspense>
      </div>

      {/* Database Info */}
      <UniversalCard.Default className="mt-8">
        <div className="flex items-center">
          <Database size={24} className="text-gold-500 mr-3" />
          <div>
            <h3 className="text-lg font-medium">Database Connection</h3>
            <p className="text-zinc-400 text-sm">
              Connected to PostgreSQL database. This page demonstrates retrieving and displaying real data.
            </p>
          </div>
        </div>
      </UniversalCard.Default>
    </>
  );
}
