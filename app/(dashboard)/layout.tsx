import React from 'react';

// Cleaned up layout with no unused imports or header
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen bg-black">
      {children}
    </section>
  );
}
