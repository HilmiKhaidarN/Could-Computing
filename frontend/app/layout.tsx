import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AegisOps — Sistem Prioritas Infrastruktur Kota',
  description:
    'Platform cerdas untuk monitoring, pelaporan, dan penentuan prioritas penanganan infrastruktur perkotaan berbasis data dan machine learning.',
  keywords: ['infrastruktur', 'kota', 'monitoring', 'laporan', 'prioritas'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
