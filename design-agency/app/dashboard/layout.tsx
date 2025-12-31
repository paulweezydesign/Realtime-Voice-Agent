import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Design Agency',
  description: 'Manage your design agency with AI-powered agents',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

