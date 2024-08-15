import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useSpring, useTrail, animated, config, useSpringRef, useChain } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import { FaChartLine, FaLightbulb, FaChartBar, FaPalette, FaMagic } from 'react-icons/fa';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';

// Define features for the CreativeAlly section
const features = [
  {
    icon: <FaChartLine />,
    title: "Performance Analysis",
    description: "Analyze how elements in your images and videos impact ad performance.",
  },
  {
    icon: <FaLightbulb />,
    title: "Hypothesis Generation",
    description: "Generate data-driven creative briefs for more effective A/B testing.",
  },
  {
    icon: <FaChartBar />,
    title: "Advanced Reporting",
    description: "Close the loop between testing, reviewing, and creating new ads.",
  },
  {
    icon: <FaPalette />,
    title: "Creative Insights",
    description: "Understand which visual elements resonate most with your audience.",
  },
  {
    icon: <FaMagic />,
    title: "AI-Powered Optimization",
    description: "Get AI-driven suggestions to enhance your ad creative performance.",
  },
];

// Custom hook for parallax effect
const useParallax = (strength: number = 0.1) => {
  const [scrollY, setScrollY] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldReduceMotion]);

  return useSpring({ transform: shouldReduceMotion ? 'none' : `translateY(${scrollY * strength}px)` });
};

// Main CreativeAlly component
const CreativeAlly: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const springRef = useSpringRef();
  const trailRef = useSpringRef();

  // Animation for the main section
  const { opacity, y } = useSpring({
    ref: springRef,
    opacity: inView ? 1 : 0,
    y: inView ? 0 : 50,
    config: config.molasses,
  });

  // Trail animation for features
  const trail = useTrail(features.length, {
    ref: trailRef,
    opacity: inView ? 1 : 0,
    y: inView ? 0 : 20,
    config: config.wobbly,
  });

  // Chain animations
  useChain(inView ? [springRef, trailRef] : [trailRef, springRef], [0, 0.5]);

  // Parallax effect for background
  const parallaxBg = useParallax(0.5);

  return (
    <animated.section
      ref={ref}
      className="relative py-24 overflow-hidden w-full"
      style={{
        opacity,
        transform: y.to((value) => `translateY(${value}px)`),
        background: 'linear-gradient(to bottom, #121330, #1a1c3d, #22254a, #2a2e57, #323764)',
      }}
    >
      <SVGBackground style={parallaxBg} />
      <ParticleBackground />
      <div className="relative w-full px-4 sm:px-6 lg:px-8 z-10">
        <animated.div className="text-center mb-20">
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
            variants={textRevealVariants}
            initial="hidden"
            animate="visible"
          >
            Elevate Your Creative Strategy
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            variants={textRevealVariants}
            initial="hidden"
            animate="visible"
          >
            Harness the power of AI to analyze, optimize, and innovate your ad creatives for maximum impact.
          </motion.p>
        </animated.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {trail.map((style, index) => (
            <FeatureItem key={index} {...features[index]} style={style} />
          ))}
        </div>

        <CTAButton inView={inView} />
      </div>
      <CursorTrail />
    </animated.section>
  );
};

// Animation variants for text reveal
const textRevealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// SVG Background component
const SVGBackground: React.FC<{ style: any }> = React.memo(({ style }) => (
  <animated.div className="absolute inset-0 z-0 opacity-15" style={style}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
        </pattern>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#smallGrid)"/>
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </animated.div>
));

SVGBackground.displayName = 'SVGBackground';

// Props interface for FeatureItem
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  style: any;
}

// FeatureItem component
const FeatureItem: React.FC<FeatureItemProps> = React.memo(
  ({ icon, title, description, style }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const { transform, scale, glow } = useSpring({
      transform: `perspective(1000px) rotateX(${isHovered ? 2 : 0}deg) rotateY(${isHovered ? -2 : 0}deg)`,
      scale: isHovered ? 1.03 : 1,
      glow: isHovered ? 1 : 0,
      config: { mass: 5, tension: 350, friction: 40 },
    });

    const expandSpring = useSpring({
      height: isExpanded ? 'auto' : '100%',
      config: config.gentle,
    });

    const handleHover = useCallback((hover: boolean) => {
      setIsHovered(hover);
    }, []);

    const handleClick = useCallback(() => {
      setIsExpanded(!isExpanded);
    }, [isExpanded]);

    return (
      <animated.div
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        onClick={handleClick}
        style={{
          ...style,
          transform,
          scale,
          boxShadow: glow.to(v => `0 0 ${10 * v}px ${5 * v}px rgba(147, 51, 234, ${0.2 * v})`),
        }}
        className="bg-gray-800 bg-opacity-50 rounded-2xl p-8 transition-all duration-300 backdrop-filter backdrop-blur-sm overflow-hidden cursor-pointer"
        role="button"
        aria-expanded={isExpanded}
        aria-labelledby={`feature-title-${title}`}
      >
        <animated.div 
          className="text-5xl text-purple-400 mb-6 flex justify-center"
          style={{
            filter: glow.to(g => `drop-shadow(0 0 ${g * 5}px rgba(147, 51, 234, 0.7))`),
          }}
        >
          {icon}
        </animated.div>
        <motion.h3 
          id={`feature-title-${title}`}
          className="text-2xl font-semibold text-white mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {title}
        </motion.h3>
        <animated.div style={expandSpring} className="overflow-hidden">
          <motion.p 
            className="text-gray-300 text-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {description}
          </motion.p>
        </animated.div>
      </animated.div>
    );
  }
);

FeatureItem.displayName = 'FeatureItem';

// CTA Button component
const CTAButton: React.FC<{ inView: boolean }> = React.memo(({ inView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const { scale, y } = useSpring({
    scale: isHovered ? 1.05 : 1,
    y: isHovered ? -5 : 0,
    config: { tension: 300, friction: 10 },
  });

  const clickAnimation = useSpring({
    transform: isClicked ? 'scale(0.95)' : 'scale(1)',
    config: { duration: 100 },
  });

  return (
    <motion.div 
      className="text-center mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <animated.a
        href="/signup"
        className="inline-block px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
        style={{
          ...clickAnimation,
          scale,
          y,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsClicked(true)}
        onMouseUp={() => setIsClicked(false)}
      >
        Unlock Creative Insights
      </animated.a>
    </motion.div>
  );
});

CTAButton.displayName = 'CTAButton';

// Particle Background component
const ParticleBackground: React.FC = () => {
  const particles = useMemo(() => new Array(50).fill(null).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
  })), []);

  return (
    <div className="absolute inset-0 z-0">
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-white opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Cursor Trail component
const CursorTrail: React.FC = () => {
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTrail(prevTrail => [...prevTrail, { x: e.clientX, y: e.clientY }].slice(-20));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {trail.map((point, index) => (
        <motion.div
          key={index}
          className="fixed w-2 h-2 rounded-full bg-purple-400 pointer-events-none z-50"
          style={{ left: point.x, top: point.y }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </>
  );
};

export default CreativeAlly;