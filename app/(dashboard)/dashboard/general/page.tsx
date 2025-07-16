'use client';
import { useActionState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { updateProfile } from '@/app/(login)/actions';
// import { type Person } from '@/lib/db/schema'; // Unused import
import useSWR from 'swr';
import { Suspense } from 'react';
import { UserResponse } from '@/lib/utils';
const fetcher = (url: string) => fetch(url).then(res => res.json());
type ActionState = {
  displayName?: string;
  error?: string;
  success?: boolean;
  message?: string;
};
type AccountFormProps = {
  state: ActionState;
  nameValue?: string;
  emailValue?: string;
};
function AccountForm({
  state,
  nameValue = '',
  emailValue = '',
}: AccountFormProps) {
  return (
    <DashboardLayout
      left={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">General</h2>
          </div>
        </div>
      }
      center={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">General Settings</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Account settings coming soon...</p>
            </CardContent>
          </Card>
        </div>
      }
      right={
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                Update Profile
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
