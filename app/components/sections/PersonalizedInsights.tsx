import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useSpring, useTrail, animated, config, useSpringRef, useChain } from '@react-spring/web';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaChartLine, FaBullseye, FaSlack } from 'react-icons/fa';
import Link from 'next/link';

// StartOptimizingButton component
const StartOptimizingButton: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  const buttonSpring = useSpring({
    scale: hovered ? 1.05 : 1,
    boxShadow: hovered ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    config: config.wobbly,
  });

  return (
    <Link href="/signup" passHref>
      <animated.span
        className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full hover:from-blue-500 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
        style={buttonSpring}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Start Optimizing Now
      </animated.span>
    </Link>
  );
};

const PersonalizedInsights: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const shouldReduceMotion = useReducedMotion();
  const controls = useAnimation();

  const headerSpringRef = useSpringRef();
  const headerSpring = useSpring({
    ref: headerSpringRef,
    from: { opacity: 0, y: 50 },
    to: { opacity: inView ? 1 : 0, y: inView ? 0 : 50 },
    config: config.molasses,
  });

  const insights = useMemo(() => [
    {
      icon: <FaSlack className="text-blue-400" size={48} />,
      title: "Daily Optimization Recommendations",
      description: "Receive actionable insights via Slack and email for optimal bid and budget adjustments using portfolio optimization techniques.",
    },
    {
      icon: <FaChartLine className="text-green-400" size={48} />,
      title: "Granular Performance Insights",
      description: "Dive deep into campaign performance across dimensions like gender, platform, placement, and time of day to inform strategic decisions.",
    },
    {
      icon: <FaBullseye className="text-purple-400" size={48} />,
      title: "Strategic Campaign Recommendations",
      description: "Get AI-powered suggestions for new campaign types, audience targeting, and optimization strategies to stay ahead of the curve.",
    },
  ], []);

  const trailSpringRef = useSpringRef();
  const trail = useTrail(insights.length, {
    ref: trailSpringRef,
    from: { opacity: 0, y: 20, scale: 0.9 },
    to: { opacity: inView ? 1 : 0, y: inView ? 0 : 20, scale: inView ? 1 : 0.9 },
    config: config.wobbly,
  });

  useChain(inView ? [headerSpringRef, trailSpringRef] : [trailSpringRef, headerSpringRef], [0, 0.5]);

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxBg = useSpring({
    transform: shouldReduceMotion ? 'none' : `translateY(${scrollY * 0.5}px)`,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.section
      ref={ref}
      className="relative py-24 w-full overflow-hidden"
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } },
      }}
      style={{
        background: 'linear-gradient(to bottom, #121330, #1a1c3d, #22254a, #2a2e57, #323764)',
      }}
    >
      <animated.div
        className="absolute inset-0 z-0 bg-[url('/subtle-pattern.png')] opacity-10"
        style={parallaxBg}
      />
      <ParticleBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <animated.div className="text-center mb-16" style={headerSpring}>
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-6"
            variants={textRevealVariants}
            initial="hidden"
            animate="visible"
          >
            Get Ad Buying Superpowers
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
            variants={textRevealVariants}
            initial="hidden"
            animate="visible"
          >
            Your AI co-pilot helps you manage your campaigns more effectively, saving you time and improving performance.
          </motion.p>
        </animated.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-16">
          {trail.map((style, index) => (
            <InsightItem key={index} {...insights[index]} style={style} />
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StartOptimizingButton />
        </motion.div>
      </div>
      <CursorTrail />
    </motion.section>
  );
};

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

interface InsightItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  style: any;
}

const InsightItem: React.FC<InsightItemProps> = React.memo(({ icon, title, description, style }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { scale, rotateX, rotateY, shadow, glow } = useSpring({
    scale: isHovered ? 1.05 : 1,
    rotateX: isHovered ? 5 : 0,
    rotateY: isHovered ? 5 : 0,
    shadow: isHovered ? 20 : 5,
    glow: isHovered ? 0.5 : 0,
    config: config.wobbly,
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
      style={{
        ...style,
        scale,
        rotateX,
        rotateY,
        boxShadow: shadow.to(s => `0px ${s}px ${s * 2}px rgba(0, 0, 0, 0.1)`),
      }}
      className="bg-gray-800 bg-opacity-50 rounded-2xl p-8 transition-all duration-300 backdrop-filter backdrop-blur-sm hover:bg-opacity-70 cursor-pointer"
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      onClick={handleClick}
      role="button"
      aria-expanded={isExpanded}
      aria-labelledby={`insight-title-${title}`}
    >
      <animated.div
        className="flex items-center justify-center mb-6"
        style={{
          filter: glow.to(g => `drop-shadow(0 0 ${g * 10}px rgba(255, 255, 255, 0.7))`),
        }}
      >
        {icon}
      </animated.div>
      <h4 id={`insight-title-${title}`} className="text-2xl font-semibold text-white mb-4 text-center">{title}</h4>
      <animated.div style={expandSpring} className="overflow-hidden">
        <p className="text-gray-300 text-lg text-center">{description}</p>
      </animated.div>
    </animated.div>
  );
});

InsightItem.displayName = 'InsightItem';

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
          className="fixed w-2 h-2 rounded-full bg-blue-400 pointer-events-none z-50"
          style={{ left: point.x, top: point.y }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </>
  );
};

export default PersonalizedInsights;