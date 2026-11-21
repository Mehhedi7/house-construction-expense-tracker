import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'House Construction Expense Tracker',
  description: 'Manage and track house construction expenses by category in Bangladeshi Taka',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen bg-[#f8f9fa] text-[#212121] antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
