import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useSpring, useTrail, animated, config, useSpringRef, SpringValue } from '@react-spring/web';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaUserCircle, FaComments, FaPalette, FaRobot, FaBullseye, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';

// StartOptimizingButton component - A button with hover animation
const StartOptimizingButton: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  // Spring animation for the button
  const buttonSpring = useSpring({
    scale: hovered ? 1.05 : 1,
    boxShadow: hovered ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    config: config.wobbly,
  });

  return (
    <Link href="/signup" passHref>
      <animated.span
        className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
        style={buttonSpring}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Start Optimizing Now
      </animated.span>
    </Link>
  );
};

// Main AIBrandProfile component
const AIBrandProfile: React.FC = () => {
  // Intersection observer hook to trigger animations when component is in view
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const shouldReduceMotion = useReducedMotion();
  const controls = useAnimation();
  const gradientApi = useSpringRef();

  // Start animations when component is in view
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Gradient animation
  const gradientSpring = useSpring({
    ref: gradientApi,
    from: { backgroundPosition: '0% 50%' },
    to: { backgroundPosition: '100% 50%' },
    config: { duration: 20000 },
    loop: true,
  });

  useEffect(() => {
    gradientApi.start();
  }, [gradientApi]);

  // Features data
  const features = useMemo(() => [
    {
      icon: <FaComments className="text-primary-light" size={48} />,
      title: "Brand Voice Analysis",
      description: "Our AI analyzes your existing content to understand and replicate your unique brand voice.",
    },
    {
      icon: <FaPalette className="text-secondary-light" size={48} />,
      title: "Visual Identity Recognition",
      description: "The AI learns your visual branding elements to ensure consistency across all ad creatives.",
    },
  ], []);

  // Benefits data
  const benefits = useMemo(() => [
    {
      icon: <FaRobot className="text-accent-main" size={48} />,
      title: "Personalized Ad Creation",
      description: "Generate ad content that perfectly aligns with your brand identity and resonates with your audience.",
    },
    {
      icon: <FaBullseye className="text-secondary-light" size={48} />,
      title: "Adaptive Messaging",
      description: "Automatically adjust your ad copy to match your brand voice across different platforms and audiences.",
    },
    {
      icon: <FaChartLine className="text-primary-light" size={48} />,
      title: "Brand Consistency",
      description: "Maintain a cohesive brand image across all your Facebook ad campaigns with AI-powered oversight.",
    },
  ], []);

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Animation variants for items
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // Scroll animation
  const [{ scrollY }, api] = useSpring(() => ({ scrollY: 0 }));

  const onScroll = useCallback(() => {
    api.start({ scrollY: window.scrollY });
  }, [api]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return (
    <section ref={ref} className="relative py-24 overflow-hidden w-full">
      {/* Animated gradient background */}
      <animated.div 
        style={{
          ...gradientSpring,
          backgroundSize: '400% 400%',
        }}
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-hero-gradient-start to-hero-gradient-end" 
      />
      {/* Background pattern that moves on scroll */}
      <BackgroundPattern scrollY={scrollY} />
      <div className="relative w-full px-4 sm:px-6 lg:px-8 z-10">
        {/* Main content */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="text-center mb-20"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light"
          >
            AI Brand Profile
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto"
          >
            Let our AI understand and enhance your brand identity
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-center mb-20">
          <motion.div 
            className="lg:col-span-2 space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            {features.map((feature, index) => (
              <FeatureItem key={index} {...feature} />
            ))}
          </motion.div>
          <AIBrandGuardian />
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {benefits.map((benefit, index) => (
            <BenefitItem key={index} {...benefit} />
          ))}
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StartOptimizingButton />
        </motion.div>
      </div>
    </section>
  );
};

// BackgroundPattern component - Creates a moving background pattern
const BackgroundPattern: React.FC<{ scrollY: SpringValue<number> }> = ({ scrollY }) => (
  <animated.svg 
    className="absolute inset-0 w-full h-full" 
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transform: scrollY.to(y => `translateY(${y * 0.2}px)`),
    }}
  >
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </animated.svg>
);

// AIBrandGuardian component - Animated brand guardian representation
const AIBrandGuardian: React.FC = () => {
  const [{ y }, set] = useSpring(() => ({ y: 0 }));
  
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const centerY = rect.height / 2;
      const distance = (mouseY - centerY) / centerY;
      set({ y: distance * 10 });
    },
    [set]
  );

  const glowSpring = useSpring({
    from: { opacity: 0.5 },
    to: async (next) => {
      while (1) {
        await next({ opacity: 0.8 });
        await next({ opacity: 0.5 });
      }
    },
    config: { duration: 2000 },
  });

  return (
    <animated.div 
      className="relative rounded-3xl overflow-hidden shadow-hero"
      onMouseMove={onMouseMove}
      style={{ 
        transform: y.to(y => `translateY(${y}px)`),
      }}
    >
      <animated.div 
        className="absolute inset-0 bg-gradient-to-br from-primary-light to-secondary-light opacity-10"
        style={{
          boxShadow: glowSpring.opacity.to(
            opacity => `0 0 20px rgba(41, 98, 255, ${opacity}), 0 0 40px rgba(41, 98, 255, ${opacity * 0.5})`
          ),
        }}
      />
      <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm">
        <FaUserCircle className="text-accent-main text-9xl mb-8" />
        <h3 className="text-3xl font-semibold text-white text-center mb-6">Your AI Brand Guardian</h3>
        <p className="text-gray-300 text-lg text-center">
          Our AI becomes an extension of your brand team, ensuring consistency and optimization across all your ad campaigns.
        </p>
      </div>
    </animated.div>
  );
};

// Interface for FeatureItem and BenefitItem props
interface ItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// FeatureItem component - Displays individual features with animations
const FeatureItem: React.FC<ItemProps> = ({ icon, title, description }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.div 
      className="flex flex-col items-center text-center bg-gray-800 bg-opacity-50 rounded-2xl p-8 transition-all duration-300 backdrop-filter backdrop-blur-sm shadow-soft hover:shadow-elevated"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div 
        className="mb-6"
        animate={{ rotate: hovered ? [0, 15, -15, 0] : 0 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <motion.h4 
        className="text-2xl font-semibold text-white mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h4>
      <motion.p 
        className="text-gray-300 text-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
};

// BenefitItem component - Displays individual benefits with animations
const BenefitItem: React.FC<ItemProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 rounded-2xl p-8 transition-all duration-300 backdrop-filter backdrop-blur-sm shadow-soft hover:shadow-elevated"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div 
        className="flex items-center justify-center mb-6"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <motion.h4 
        className="text-2xl font-semibold text-white mb-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h4>
      <motion.p 
        className="text-gray-300 text-lg text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
};

export default AIBrandProfile;