"use client";

import React, { useCallback, lazy, Suspense, useEffect, useState, useMemo } from 'react';
import { useTheme } from 'app/contexts/ThemeContext';
import { useSession, signOut, SessionProvider } from "next-auth/react";
import ErrorBoundary from '../ErrorBoundary';
import dynamic from 'next/dynamic';
import SkeletonLoader from '../SkeletonLoader';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated, config } from '@react-spring/web';
import { startTransition } from 'react';
import { Element, Events, scroller } from 'react-scroll';
import { useSwipeable } from 'react-swipeable';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SEOMetaTags = dynamic(() => import('../SEOMetaTags'), { ssr: false });

interface SectionComponentProps {
  handleSignIn?: () => void;
}

const sectionComponents = {
  Hero: lazy(() => import('./sections/Hero').then(module => ({ default: module.default as React.ComponentType<SectionComponentProps> }))),
  WhatWeDo: lazy(() => import('./sections/WhatWeDo').then(module => ({ default: module.default as React.ComponentType<SectionComponentProps> }))),
  HowItWorks: lazy(() => import('./sections/HowItWorks').then(module => ({ default: module.default as React.ComponentType<SectionComponentProps> }))),
  KeyBenefits: lazy(() => import('./sections/KeyBenefits').then(module => ({ default: module.default as React.ComponentType<SectionComponentProps> }))),
  CreativeAlly: lazy(() => import('./sections/CreativeAlly').then(module => ({ default: module.default as React.ComponentType<SectionComponentProps> }))),
  PersonalizedInsights: lazy(() => import('./sections/PersonalizedInsights').then(module => ({ default: module.default as React.ComponentType<SectionComponentProps> }))),
  AIBrandProfile: lazy(() => import('./sections/AIBrandProfile').then(module => ({ default: module.default as React.ComponentType<SectionComponentProps> }))),
  RealResults: lazy(() => import('./sections/RealResults').then(module => ({ default: module.default as React.ComponentType<SectionComponentProps> }))),
  CallToAction: lazy(() => import('./sections/CallToAction').then(module => ({ default: module.default as React.ComponentType<SectionComponentProps> }))),
};

const StickyNavigation = lazy(() => import('../StickyNavigation'));

const sections = [
  { Component: sectionComponents.Hero, name: 'Hero' },
  { Component: sectionComponents.WhatWeDo, name: 'What We Do' },
  { Component: sectionComponents.HowItWorks, name: 'How It Works' },
  { Component: sectionComponents.KeyBenefits, name: 'Key Benefits' },
  { Component: sectionComponents.CreativeAlly, name: 'Creative Ally' },
  { Component: sectionComponents.PersonalizedInsights, name: 'Personalized Insights' },
  { Component: sectionComponents.AIBrandProfile, name: 'AI Brand Profile' },
  { Component: sectionComponents.RealResults, name: 'Real Results' },
  { Component: sectionComponents.CallToAction, name: 'Call to Action' },
];

interface SectionWrapperProps {
  index: number;
  children: React.ReactNode;
  name: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = React.memo(({ index, children, name }) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const [springProps, api] = useSpring(() => ({
    opacity: 0,
    transform: 'translateY(50px)',
    config: config.slow,
  }));

  useEffect(() => {
    if (inView) {
      api.start({ opacity: 1, transform: 'translateY(0)' });
    }
  }, [inView, api]);

  return (
    <Element name={name}>
      <animated.div
        className={`w-full ${index === 0 ? 'min-h-screen' : 'min-h-[50vh]'} flex items-center justify-center`}
        ref={ref}
        style={springProps}
      >
        <Suspense fallback={<SkeletonLoader type={index === 0 ? "hero" : "section"} />}>
          {children}
        </Suspense>
      </animated.div>
    </Element>
  );
});

SectionWrapper.displayName = 'SectionWrapper';

const ConsolidatedLandingPageContent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState(0);
  const router = useRouter();

  const handleSignIn = useCallback(() => {
    router.push('/login');
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/');
  }, [router]);

  useEffect(() => {
    const loadHighQualityImages = () => {
      console.log('Loading high-quality images');
      // Implement actual high-quality image loading logic here
    };

    startTransition(() => {
      loadHighQualityImages();
    });

    Events.scrollEvent.register('begin', () => {
      console.log("Scroll began");
    });

    Events.scrollEvent.register('end', (to: string) => {
      console.log("Scroll ended");
      setActiveSection(sections.findIndex(section => section.name === to));
    });

    return () => {
      Events.scrollEvent.remove('begin');
      Events.scrollEvent.remove('end');
    };
  }, []);

  const scrollToSection = useCallback((index: number) => {
    scroller.scrollTo(sections[index].name, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart'
    });
  }, []);

  const handleSwipe = useCallback((direction: 'UP' | 'DOWN') => {
    const newIndex = direction === 'DOWN' ? 
      Math.min(activeSection + 1, sections.length - 1) : 
      Math.max(activeSection - 1, 0);
    scrollToSection(newIndex);
  }, [activeSection, scrollToSection]);

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => handleSwipe('UP'),
    onSwipedDown: () => handleSwipe('DOWN'),
    trackMouse: true
  });

  const memoizedSections = useMemo(() => sections.map(({ Component, name }, index) => (
    <SectionWrapper
      key={name}
      index={index}
      name={name}
    >
      <Component
        handleSignIn={index === 0 || index === sections.length - 1 ? handleSignIn : undefined}
      />
    </SectionWrapper>
  )), [handleSignIn]);

  return (
    <ErrorBoundary>
      <div 
        className={`${theme.darkMode ? 'dark' : ''} overflow-x-hidden`}
        {...swipeHandlers}
      >
        <SEOMetaTags title="Your App Title" description="Your app description goes here" />
        <div className="bg-gradient-to-r from-blue-600 via-emerald-500 to-orange-500 min-h-screen animate-gradient-x">
          <div className="w-full backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
            {memoizedSections}
          </div>
          <Suspense fallback={null}>
            <StickyNavigation
              sectionNames={sections.map(s => s.name)}
              activeIndex={activeSection}
              onNavClick={scrollToSection}
            />
          </Suspense>
        </div>
        <button
          onClick={toggleTheme}
          className="fixed bottom-4 right-4 bg-gray-200 dark:bg-gray-800 p-2 rounded-full shadow-lg transition-colors duration-200 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-50"
          aria-label={`Toggle to ${theme.darkMode ? 'light' : 'dark'} theme`}
        >
          {theme.darkMode ? '🌞' : '🌙'}
        </button>
        {status === "authenticated" ? (
          <button
            onClick={handleSignOut}
            className="fixed top-4 right-4 bg-red-500 text-white p-2 rounded shadow-lg transition-colors duration-200 ease-in-out hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 z-50"
          >
            Sign Out
          </button>
        ) : (
          <Link href="/login">
            <button
              className="fixed top-4 right-4 bg-blue-500 text-white p-2 rounded shadow-lg transition-colors duration-200 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-50"
            >
              Sign In
            </button>
          </Link>
        )}
      </div>
    </ErrorBoundary>
  );
};

const ConsolidatedLandingPage: React.FC = () => {
  return (
    <SessionProvider>
      <ConsolidatedLandingPageContent />
    </SessionProvider>
  );
};

export default React.memo(ConsolidatedLandingPage);