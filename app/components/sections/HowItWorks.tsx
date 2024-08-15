import React, { useMemo, useCallback } from 'react';
import { useSpring, useTrail, animated, config, SpringValue, useSpringRef, useChain } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import { FaPlug, FaComments, FaBell, FaSlack } from 'react-icons/fa';

// Custom hook to create animated values based on inView state
const useAnimatedValue = (inView: boolean, config = {}) => {
  return useSpring({
    from: { value: 0 },
    to: { value: inView ? 1 : 0 },
    config: { tension: 280, friction: 60, ...config },
  });
};

const HowItWorks: React.FC = () => {
  // Set up intersection observer to trigger animations when component is in view
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Create spring refs for chaining animations
  const mainSpringRef = useSpringRef();
  const trailSpringRef = useSpringRef();
  const buttonSpringRef = useSpringRef();

  // Main animation for the entire section
  const mainSpring = useSpring({
    ref: mainSpringRef,
    from: { opacity: 0, y: 100 },
    to: { opacity: inView ? 1 : 0, y: inView ? 0 : 100 },
    config: { tension: 280, friction: 60 },
  });

  // Parallax effect for the background
  const parallaxSpring = useSpring({
    translateY: inView ? -50 : 0,
    config: { mass: 5, tension: 350, friction: 40 },
  });

  // Define the steps for the "How It Works" process
  const steps = useMemo(() => [
    {
      icon: <FaPlug className="text-blue-400" size={64} />,
      title: "Connect Your Account",
      description: "Securely link your Facebook ad account to Worthy.ai with just a few clicks.",
      step: 1,
    },
    {
      icon: <FaComments className="text-purple-400" size={64} />,
      title: "AI-Powered Analysis",
      description: "Our AI analyzes your campaigns, learning goals, budgets, and bid sensitivities.",
      step: 2,
    },
    {
      icon: <FaBell className="text-indigo-400" size={64} />,
      title: "Smart Alerts",
      description: "Set up AI-recommended alerts to stay informed about crucial campaign changes.",
      step: 3,
    },
    {
      icon: <FaSlack className="text-blue-400" size={64} />,
      title: "Actionable Insights",
      description: "Receive daily insights and optimization suggestions via Slack or email.",
      step: 4,
    },
  ], []);

  // Create a trail animation for the step items
  const trail = useTrail(steps.length, {
    ref: trailSpringRef,
    config: { mass: 5, tension: 2000, friction: 200 },
    opacity: inView ? 1 : 0,
    x: inView ? 0 : 20,
    scale: inView ? 1 : 0.8,
    from: { opacity: 0, x: 20, scale: 0.8 },
  });

  // Animation for the CTA button
  const buttonSpring = useSpring({
    ref: buttonSpringRef,
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: inView ? 1 : 0, scale: inView ? 1 : 0.9 },
    config: { tension: 300, friction: 10 },
  });

  // Chain the animations in sequence
  useChain(inView ? [mainSpringRef, trailSpringRef, buttonSpringRef] : [buttonSpringRef, trailSpringRef, mainSpringRef], [0, 0.5, 1]);

  return (
    <animated.section
      ref={ref}
      className="relative py-24 w-full overflow-hidden"
      style={{
        ...mainSpring,
        background: 'linear-gradient(to bottom, #323764, #2d2b5f, #281f5a, #231455, #1e0a50)',
      }}
    >
      <animated.div
        className="absolute inset-0 z-0 bg-[url('/subtle-pattern.png')] opacity-10"
        style={{
          transform: parallaxSpring.translateY.to(y => `translateY(${y}px)`),
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <animated.h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 text-center">
          Streamlined Optimization Process
        </animated.h2>
        <animated.p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto text-center mb-20">
          Experience the power of AI-driven campaign management with our simple four-step process.
        </animated.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {trail.map((style, index) => (
            <StepItem key={index} {...steps[index]} style={style} />
          ))}
        </div>

        <animated.div className="mt-20 text-center" style={buttonSpring}>
          <a
            href="/signup"
            className="inline-block px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Optimizing Now
          </a>
        </animated.div>
      </div>
    </animated.section>
  );
};

// Props interface for the StepItem component
interface StepItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
  style: {
    opacity: SpringValue<number>;
    x: SpringValue<number>;
    scale: SpringValue<number>;
  };
}

// StepItem component for individual steps in the process
const StepItem: React.FC<StepItemProps> = React.memo(({ icon, title, description, step, style }) => {
  // Set up intersection observer for each step item
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Animations for the step item container
  const { scale, rotate, background } = useSpring({
    scale: inView ? 1 : 0.5,
    rotate: inView ? 0 : -30,
    background: inView ? 'rgba(26, 32, 44, 0.8)' : 'rgba(26, 32, 44, 0.4)',
    config: config.wobbly,
  });

  // Animation for the icon
  const iconSpring = useSpring({
    scale: inView ? 1 : 0,
    rotate: inView ? 360 : 0,
    config: { tension: 300, friction: 10 },
  });

  // Animation for the text content
  const textSpring = useAnimatedValue(inView, { tension: 300, friction: 10 });

  // Hover effect state and animation
  const [isHovered, setIsHovered] = React.useState(false);
  const hoverSpring = useSpring({
    scale: isHovered ? 1.05 : 1,
    boxShadow: isHovered ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    config: { tension: 300, friction: 10 },
  });

  const handleHover = useCallback(() => setIsHovered(true), []);
  const handleUnhover = useCallback(() => setIsHovered(false), []);

  return (
    <animated.div
      ref={ref}
      className="rounded-2xl p-8 transition-all duration-300 relative overflow-hidden backdrop-filter backdrop-blur-sm"
      style={{
        ...style,
        ...hoverSpring,
        background,
      }}
      onMouseEnter={handleHover}
      onMouseLeave={handleUnhover}
    >
      <animated.div
        className="absolute top-0 right-0 bg-gradient-to-bl from-gray-700 to-transparent text-gray-600 font-bold text-6xl opacity-20 p-4 leading-none"
        style={{ opacity: textSpring.value }}
      >
        {step}
      </animated.div>
      <animated.div
        className="flex items-center justify-center mb-6"
        style={{
          ...iconSpring,
          scale: iconSpring.scale.to(s => 1 + (s - 1) * 0.5),
        }}
      >
        {icon}
      </animated.div>
      <animated.h3
        className="text-2xl font-semibold text-white mb-4"
        style={{ opacity: textSpring.value, transform: textSpring.value.to(v => `translateY(${20 - v * 20}px)`) }}
      >
        {title}
      </animated.h3>
      <animated.p
        className="text-gray-300 text-lg"
        style={{ opacity: textSpring.value, transform: textSpring.value.to(v => `translateY(${40 - v * 40}px)`) }}
      >
        {description}
      </animated.p>
    </animated.div>
  );
});

StepItem.displayName = 'StepItem';

export default React.memo(HowItWorks);