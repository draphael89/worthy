import React, { useRef, useMemo } from 'react';
import { useSpring, useTrail, animated, config } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import { AutoGraph, Insights, ColorLens } from '@mui/icons-material';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ParticleField component for creating a 3D particle animation
const ParticleField = () => {
  const points = useRef<THREE.Points>(null);

  // Create an array of random 3D positions for particles
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  // Animate the particle field rotation
  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.x = clock.getElapsedTime() * 0.1;
      points.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={1000}
          itemSize={3}
          array={particlesPosition}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#8b5cf6" />
    </points>
  );
};

// Main WhatWeDo component
const WhatWeDo: React.FC = () => {
  // Set up intersection observer to trigger animations when component is in view
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Animation for fading in and sliding up the main content
  const { opacity, y } = useSpring({
    opacity: inView ? 1 : 0,
    y: inView ? 0 : 100,
    config: config.molasses,
  });

  // Animation for parallax background effect
  const parallax = useSpring({
    backgroundPositionY: inView ? '50%' : '0%',
    config: { mass: 5, tension: 350, friction: 40 },
  });

  // Define features with their icons, titles, and descriptions
  const features = useMemo(() => [
    {
      icon: <AutoGraph style={{ fontSize: '3rem' }} />,
      title: "AI-Powered Optimization",
      description: "Harness our advanced AI to analyze and optimize your ad performance in real-time, maximizing ROI with every impression.",
      color: "from-indigo-600 to-purple-600",
    },
    {
      icon: <Insights style={{ fontSize: '3rem' }} />,
      title: "Data-Driven Insights",
      description: "Unlock deep, actionable insights into audience behavior and campaign performance, empowering strategic decision-making.",
      color: "from-purple-600 to-pink-600",
    },
    {
      icon: <ColorLens style={{ fontSize: '3rem' }} />,
      title: "Creative Optimization",
      description: "Let our AI refine your ad creatives, ensuring they resonate perfectly with your target audience for maximum engagement.",
      color: "from-pink-600 to-indigo-600",
    },
  ], []);

  // Create a trail animation for the feature items
  const trail = useTrail(features.length, {
    opacity: inView ? 1 : 0,
    y: inView ? 0 : 50,
    config: config.wobbly,
  });

  return (
    <animated.section
      ref={ref}
      className="relative py-32 w-full overflow-hidden"
      style={{
        opacity,
        background: 'linear-gradient(to bottom, #1e0a50, #2a1063, #361676, #421c8a, #4e229e)',
        backgroundSize: '200% 200%',
        backgroundPosition: parallax.backgroundPositionY.to(y => `50% ${y}`),
      }}
    >
      {/* 3D particle animation background */}
      <Canvas className="absolute inset-0" camera={{ position: [0, 0, 5] }}>
        <ParticleField />
      </Canvas>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('/subtle-pattern.png')] opacity-10" />
      
      {/* Main content container */}
      <animated.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ transform: y.to(value => `translateY(${value}px)`) }}
      >
        {/* Main heading */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-8 text-center">
          Revolutionize Your Ad Campaigns
        </h2>
        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto text-center mb-16 sm:mb-24">
          Worthy.ai combines cutting-edge AI technology with deep marketing expertise to transform your Facebook ad campaigns, delivering unparalleled results and insights.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {trail.map((style, index) => (
            <FeatureItem
              key={index}
              style={style}
              {...features[index]}
            />
          ))}
        </div>

        {/* CTA button */}
        <div className="mt-16 sm:mt-24 text-center">
          <a
            href="/signup"
            className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Optimizing Now
          </a>
        </div>
      </animated.div>
    </animated.section>
  );
};

// FeatureItem component for individual feature cards
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  style: any;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description, color, style }) => {
  // Set up hover detection
  const [hoverRef, isHovered] = useInView({
    threshold: 0.1,
  });

  // Animation for hover effect
  const hoverAnimation = useSpring({
    scale: isHovered ? 1.05 : 1,
    boxShadow: isHovered ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    config: config.wobbly,
  });

  return (
    <animated.div
      ref={hoverRef}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 sm:p-8 transition-all duration-300 backdrop-filter backdrop-blur-lg bg-opacity-20`}
      style={{
        ...style,
        ...hoverAnimation,
        willChange: 'transform, box-shadow',
      }}
    >
      <animated.div 
        className="flex items-center justify-center mb-6 bg-white bg-opacity-20 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto"
        style={{
          scale: hoverAnimation.scale.to(s => 1 + (s - 1) * 0.5),
        }}
      >
        {icon}
      </animated.div>
      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">{title}</h3>
      <p className="text-gray-200 text-base sm:text-lg text-center">{description}</p>
    </animated.div>
  );
};

export default WhatWeDo;