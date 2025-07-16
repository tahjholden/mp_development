'use client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminPage() {
  return (
    <DashboardLayout
      left={
        <div className="space-y-4">
          {/* TODO: Port your left sidebar content here */}
        </div>
      }
      center={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Admin functionality coming soon...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      }
      right={
        <div className="space-y-4">
          {/* TODO: Port your right sidebar content here */}
        </div>
      }
    />
  );
}
