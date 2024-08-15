import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ConsolidatedLandingPage = dynamic(() => import('./components/ConsolidatedLandingPage'), { ssr: false });

export const metadata: Metadata = {
  title: 'Worthy AI | Home',
  description: 'Optimize your Facebook Ads with AI-powered insights',
};

export default function Home() {
  return (
    <main>
      <ConsolidatedLandingPage />
    </main>
  );
}