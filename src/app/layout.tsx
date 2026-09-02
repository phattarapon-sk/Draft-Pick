import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ROV Esports Broadcast Overlay Platform',
  description: 'Professional MOBA / ROV Esports Draft Pick & Ban Overlay Platform for Broadcast & OBS Studio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
