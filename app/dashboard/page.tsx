import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import the DashboardContent component with client-side rendering
const DashboardContent = dynamic(() => import('./DashboardContent'), { ssr: false });

export const metadata: Metadata = {
  title: 'Dashboard | Worthy AI',
  description: 'View your Facebook Ad performance metrics and insights.',
};

export default function DashboardPage() {
  return <DashboardContent />;
}