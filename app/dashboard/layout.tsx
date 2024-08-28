import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Worthy AI',
  description: 'View your Facebook Ad performance metrics and insights.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}