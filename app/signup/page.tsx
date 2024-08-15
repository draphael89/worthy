import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const SignUpContent = dynamic(() => import('./SignUpContent'), { ssr: false });

export const metadata: Metadata = {
  title: 'Sign Up | Worthy AI',
  description: 'Create your Worthy AI account',
};

export default function SignUpPage() {
  return <SignUpContent />;
}