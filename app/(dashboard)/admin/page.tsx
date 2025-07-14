'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Super Admin!</CardTitle>
          <CardDescription>
            This page is only visible to users with the super admin flag set.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            You have successfully accessed the protected admin area. You can
            build out your admin-specific features here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
