import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const LoginContent = dynamic(() => import('./LoginContent'), { ssr: false });

export const metadata: Metadata = {
  title: 'Login | Worthy AI - Your Media Buying Co-Pilot',
  description: 'Log in to your Worthy AI account and optimize your Facebook ad campaigns with AI-powered insights.',
};

export default function LoginPage() {
  return (
    <main>
      <LoginContent />
    </main>
  );
}