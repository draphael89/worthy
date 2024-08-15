import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSpring, animated, config, useTrail, SpringValue, useChain, useSpringRef } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { FaBell, FaClock, FaChartLine, FaPalette, FaChartBar } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

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
        className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
        style={buttonSpring}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Start Optimizing Now
      </animated.span>
    </Link>
  );
};

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: <FaBell className="text-blue-400" size={32} />,
    title: "Smart Notifications",
    description: "Get timely alerts on campaign performance and optimization opportunities.",
  },
  {
    icon: <FaClock className="text-indigo-400" size={32} />,
    title: "Time-Saving Automation",
    description: "Automate routine tasks and focus on strategic decision-making.",
  },
  {
    icon: <FaChartLine className="text-purple-400" size={32} />,
    title: "Performance Boost",
    description: "Achieve better results with AI-driven optimization strategies.",
  },
  {
    icon: <FaPalette className="text-blue-400" size={32} />,
    title: "Creative Insights",
    description: "Gain valuable insights into your ad creative performance.",
  },
  {
    icon: <FaChartBar className="text-indigo-400" size={32} />,
    title: "Advanced Reporting",
    description: "Access comprehensive, easy-to-understand performance reports.",
  },
];

const useAnimatedValue = (inView: boolean, config = {}) => {
  return useSpring({
    from: { value: 0 },
    to: { value: inView ? 1 : 0 },
    config: { tension: 280, friction: 60, ...config },
  });
};

const KeyBenefits: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const mainSpringRef = useSpringRef();
  const trailSpringRef = useSpringRef();
  const buttonSpringRef = useSpringRef();

  const mainSpring = useSpring({
    ref: mainSpringRef,
    from: { opacity: 0, y: 100 },
    to: { opacity: inView ? 1 : 0, y: inView ? 0 : 100 },
    config: { tension: 280, friction: 60 },
  });

  const parallaxSpring = useSpring({
    translateY: inView ? -50 : 0,
    config: { mass: 5, tension: 350, friction: 40 },
  });

  const trail = useTrail(benefits.length, {
    ref: trailSpringRef,
    config: { mass: 5, tension: 2000, friction: 200 },
    opacity: inView ? 1 : 0,
    x: inView ? 0 : 20,
    scale: inView ? 1 : 0.8,
    from: { opacity: 0, x: 20, scale: 0.8 },
  });

  const buttonSpring = useSpring({
    ref: buttonSpringRef,
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: inView ? 1 : 0, scale: inView ? 1 : 0.9 },
    config: { tension: 300, friction: 10 },
  });

  useChain(inView ? [mainSpringRef, trailSpringRef, buttonSpringRef] : [buttonSpringRef, trailSpringRef, mainSpringRef], [0, 0.5, 1]);

  return (
    <animated.section
      ref={ref}
      className="relative py-24 w-full overflow-hidden"
      style={{
        ...mainSpring,
        background: 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)',
      }}
    >
      <animated.div
        className="absolute inset-0 z-0 bg-[url('/subtle-pattern.png')] opacity-10"
        style={{
          transform: parallaxSpring.translateY.to(y => `translateY(${y}px)`),
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <animated.h2 className="text-5xl md:text-6xl font-bold text-white mb-6 text-center">
          Unlock Your Media Buying Potential
        </animated.h2>
        <animated.p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto text-center mb-20">
          Discover how our cutting-edge AI transforms your workflow and skyrockets your performance.
        </animated.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-24">
          {trail.map((style, index) => (
            <BenefitItem key={index} {...benefits[index]} style={style} />
          ))}
        </div>

        <animated.div className="text-center mt-16" style={buttonSpring}>
          <StartOptimizingButton />
        </animated.div>
      </div>
    </animated.section>
  );
};

interface BenefitItemProps extends Benefit {
  style: {
    opacity: SpringValue<number>;
    x: SpringValue<number>;
    scale: SpringValue<number>;
  };
}

const BenefitItem: React.FC<BenefitItemProps> = React.memo(
  ({ icon, title, description, style }) => {
    const [isHovered, setIsHovered] = useState(false);

    const [ref, inView] = useInView({
      threshold: 0.1,
      triggerOnce: true,
    });

    const { scale, rotate, background } = useSpring({
      scale: inView ? 1 : 0.5,
      rotate: inView ? 0 : -30,
      background: inView ? 'rgba(26, 32, 44, 0.8)' : 'rgba(26, 32, 44, 0.4)',
      config: config.wobbly,
    });

    const iconSpring = useSpring({
      scale: inView ? 1 : 0,
      rotate: inView ? 360 : 0,
      config: { tension: 300, friction: 10 },
    });

    const textSpring = useAnimatedValue(inView, { tension: 300, friction: 10 });

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
        style={{
          ...style,
          ...hoverSpring,
          background,
        }}
        className="rounded-2xl p-8 transition-all duration-300 backdrop-filter backdrop-blur-sm"
        onMouseEnter={handleHover}
        onMouseLeave={handleUnhover}
      >
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
          className="text-2xl font-semibold text-white mb-4 text-center"
          style={{ opacity: textSpring.value, transform: textSpring.value.to(v => `translateY(${20 - v * 20}px)`) }}
        >
          {title}
        </animated.h3>
        <animated.p
          className="text-gray-300 text-center"
          style={{ opacity: textSpring.value, transform: textSpring.value.to(v => `translateY(${40 - v * 40}px)`) }}
        >
          {description}
        </animated.p>
      </animated.div>
    );
  }
);

BenefitItem.displayName = 'BenefitItem';

export default React.memo(KeyBenefits);