'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Search, User, Users, Eye, X } from 'lucide-react';
import { useSimulation } from '@/lib/contexts/SimulationContext';
import { UnifiedUser } from '@/lib/db/user-service';

interface SimulateUserPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SimulateUserPanel({
  isOpen,
  onClose,
}: SimulateUserPanelProps) {
  const {
    isSimulating,
    simulatedUser,
    availableUsers,
    startSimulation,
    stopSimulation,
    setAvailableUsers,
  } = useSimulation();

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch available users on mount
  useEffect(() => {
    if (isOpen && availableUsers.length === 0) {
      fetchAvailableUsers();
    }
  }, [isOpen]);

  const fetchAvailableUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dev/users');
      if (response.ok) {
        const users = await response.json();
        setAvailableUsers(users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateUser = (user: UnifiedUser) => {
    startSimulation(user);
  };

  const handleStopSimulation = () => {
    stopSimulation();
  };

  const filteredUsers = availableUsers.filter(
    user =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.primaryRole?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'coach':
        return 'bg-blue-100 text-blue-800';
      case 'player':
        return 'bg-green-100 text-green-800';
      case 'parent':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Simulate User
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Simulation Status */}
          {isSimulating && simulatedUser && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Currently simulating: {simulatedUser.displayName}
                    </p>
                    <p className="text-sm text-blue-700">
                      {simulatedUser.email} • {simulatedUser.primaryRole}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopSimulation}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Stop Simulation
                </Button>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? 'No users found matching your search.'
                  : 'No users available.'}
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(user.primaryRole)}>
                      {user.primaryRole}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSimulateUser(user)}
                      disabled={isSimulating && simulatedUser?.id === user.id}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {isSimulating && simulatedUser?.id === user.id
                        ? 'Active'
                        : 'Simulate'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1 text-xs">
              <li>• Select a user to simulate their experience</li>
              <li>• All API calls will use the simulated user's context</li>
              <li>• Your real session remains unchanged</li>
              <li>• Click "Stop Simulation" to return to your normal view</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
