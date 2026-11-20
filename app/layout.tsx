import './globals.css';

export const metadata = {
  title: 'House Construction Expense Tracker',
  description: 'Track construction expenses with Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <head />
      <body className="h-full flex flex-col items-center justify-start p-4">
        <h1 className="text-3xl font-bold mb-6">🏠 Expense Tracker</h1>
        {children}
      </body>
    </html>
  );
}
