'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SecurityPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium bold text-gray-900 mb-6">
        Security Settings
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Authentication Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Password changes and account deletion are managed by your
            authentication provider. Please visit your provider settings to make
            these changes.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
