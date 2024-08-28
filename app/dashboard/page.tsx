'use client';

import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Dashboard from './Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Worthy AI',
  description: 'View your Facebook Ad performance metrics and insights.',
};

export default function DashboardPage() {
  return <Dashboard />;
}