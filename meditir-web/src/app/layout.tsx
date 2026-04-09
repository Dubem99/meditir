import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meditir — Hospital Platform',
  description: 'AI-powered clinical documentation for Nigerian hospitals',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
