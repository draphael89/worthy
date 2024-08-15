import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { FirebaseAuthService } from '@/services/FirebaseAuthService';
import OnboardingContent from './OnboardingContent';
import { authOptions } from '@/api/auth/[...nextauth]/options';

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  onboardingCompleted?: boolean;
}

export default async function OnboardingWrapper() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const user = session.user as ExtendedUser;

  if (!user.id) {
    redirect('/login');
  }

  const onboardingCompleted = await FirebaseAuthService.hasCompletedOnboarding(user.id);

  if (onboardingCompleted) {
    redirect('/dashboard');
  }

  return <OnboardingContent />;
}