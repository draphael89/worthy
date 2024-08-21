import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const OnboardingContent = dynamic(() => import('./OnboardingContent'), { ssr: false });

export const metadata: Metadata = {
  title: 'Onboarding | Worthy AI',
  description: 'Complete your profile setup',
};

export default function OnboardingPage() {
  return <OnboardingContent />;
}