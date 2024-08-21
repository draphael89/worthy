'use client';

import React from 'react';
import Link from 'next/link';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-hero-gradient-start to-hero-gradient-end p-6">
      <h1 className="text-4xl font-bold mb-6 text-white">Welcome to Worthy AI</h1>
      <p className="text-xl mb-8 text-white">Optimize your Facebook Ads with AI-powered insights</p>
      <div className="space-x-4">
        <Link href="/signin" className="bg-white text-blue-600 px-6 py-2 rounded-md font-semibold hover:bg-blue-100 transition-colors">
          Sign In
        </Link>
        <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;