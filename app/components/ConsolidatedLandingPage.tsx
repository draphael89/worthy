"use client";

import React, { useCallback, lazy, Suspense, useEffect, useState, useMemo } from 'react';
import { useTheme } from 'app/contexts/ThemeContext';
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
import { FirebaseAuthService } from '../services/FirebaseAuthService';
import '../styles/mobile.css';
import Head from 'next/head';
import { animateScroll as scroll } from 'react-scroll';

// Dynamically import SEOMetaTags with SSR disabled
const SEOMetaTags = dynamic(() => import('../SEOMetaTags'), { ssr: false });

interface SectionComponentProps {
  handleSignIn?: () => void;
}

// Implement lazy loading for section components
const sectionComponents = {
  Hero: dynamic(() => import('./sections/Hero'), { ssr: true, loading: () => <SkeletonLoader type="hero" /> }),
  WhatWeDo: dynamic(() => import('./sections/WhatWeDo'), { loading: () => <SkeletonLoader type="section" /> }),
  HowItWorks: lazy(() => import('./sections/HowItWorks')),
  KeyBenefits: lazy(() => import('./sections/KeyBenefits')),
  CreativeAlly: lazy(() => import('./sections/CreativeAlly')),
  PersonalizedInsights: lazy(() => import('./sections/PersonalizedInsights')),
  AIBrandProfile: lazy(() => import('./sections/AIBrandProfile')),
  RealResults: lazy(() => import('./sections/RealResults')),
  CallToAction: lazy(() => import('./sections/CallToAction')),
};

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
    threshold: 0.3,
    triggerOnce: false,
  });

  const springProps = useSpring({
    opacity: inView ? 1 : 0,
    transform: `translateY(${inView ? 0 : 50}px)`,
    config: { mass: 1, tension: 80, friction: 26 },
  });

  return (
    <Element name={name} id={name}>
      <animated.div
        className="w-full min-h-screen flex items-center justify-center"
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
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const user = await FirebaseAuthService.getCurrentUser();
      setIsAuthenticated(!!user);
    };
    checkAuthStatus();
  }, []);

  const handleSignIn = useCallback(() => {
    router.push('/signin');
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await FirebaseAuthService.signOut();
    setIsAuthenticated(false);
    router.push('/');
  }, [router]);

  useEffect(() => {
    const loadHighQualityImages = () => {
      // Implement actual high-quality image loading logic here
      // Consider using Intersection Observer for efficient lazy loading
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
    const sectionName = sections[index].name;
    scroll.scrollTo(document.getElementById(sectionName)?.offsetTop || 0, {
      duration: 1000,
      smooth: 'easeInOutQuart',
      offset: 0
    });
  }, []);

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const newActiveSection = sections.findIndex((_, index) => {
      const element = document.getElementById(sections[index].name);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        return scrollPosition >= offsetTop - windowHeight / 2 && 
               scrollPosition < offsetTop + offsetHeight - windowHeight / 2;
      }
      return false;
    });
    if (newActiveSection !== -1 && newActiveSection !== activeSection) {
      setActiveSection(newActiveSection);
    }
  }, [activeSection]); // Removed 'sections' from the dependency array

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
        handleSignIn={index === 0 || index === sections.length - 1 ? 
          () => Promise.resolve(handleSignIn()) : 
          undefined
        }
      />
    </SectionWrapper>
  )), [handleSignIn]);

  return (
    <ErrorBoundary>
      <div 
        className="overflow-x-hidden scroll-smooth text-base sm:text-lg md:text-xl mobile-snap-scroll"
        {...swipeHandlers}
      >
        <Head>
          <link rel="preload" href="/fonts/your-main-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://your-api-domain.com" />
        </Head>
        <SEOMetaTags title="Your App Title" description="Your app description goes here" />
        <div className="relative">
          {memoizedSections}
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] bg-gradient-to-r from-blue-600 via-emerald-500 to-orange-500 animate-gradient-x" />
        </div>
        <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white p-2 rounded shadow-lg transition-colors duration-200 ease-in-out hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/signin" passHref legacyBehavior>
              <a className="bg-blue-500 text-white p-2 rounded shadow-lg transition-colors duration-200 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Sign In
              </a>
            </Link>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

const ConsolidatedLandingPage: React.FC = () => {
  return <ConsolidatedLandingPageContent />;
};

export default React.memo(ConsolidatedLandingPage);