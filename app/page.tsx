import dynamic from 'next/dynamic';

const ConsolidatedLandingPage = dynamic(() => import('./components/ConsolidatedLandingPage'), { ssr: false });

export default function Home() {
  return <ConsolidatedLandingPage />;
}