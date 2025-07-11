import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'Next.js SaaS Starter',
  description: 'Get started quickly with Next.js, Postgres, and Stripe.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        {/*
          Build SWR fallback data conditionally. In local development (or
          environments without a configured database) `getUser` / `getTeamForUser`
          will throw because `db` is undefined.  We shield the app from that
          scenario so that pages not requiring the DB (e.g. marketing / auth)
          continue to work.
        */}
        <SWRConfig
          value={(() => {
            const fallback: Record<string, unknown> = {};
            try {
              fallback['/api/user'] = getUser();
              fallback['/api/team'] = getTeamForUser();
            } catch (err) {
              /* eslint-disable no-console */
              console.warn(
                '[layout] Database unavailable, skipping SWR fallback data.',
              );
            }
            return { fallback };
          })()}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
