import React, { useState, useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { TypeAnimation } from 'react-type-animation';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated, config } from '@react-spring/web';
import { Canvas } from '@react-three/fiber';
import Link from 'next/link';
import Image from 'next/image';
import NeuralBackgroundAnimation from '../NeuralBackgroundAnimation';

const textVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: custom * 0.2, ease: 'easeOut' }
  })
};

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

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
      setIsLoaded(true);
    }
  }, [controls, inView]);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <NeuralBackgroundAnimation />
      </Canvas>
      <div className="absolute inset-0 opacity-10">
        <Image src="/subtle-pattern.png" alt="Subtle pattern" fill className="object-cover" />
      </div>
      <motion.div 
        ref={ref}
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        initial="hidden"
        animate={controls}
      >
        <motion.h1 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          variants={textVariants}
          custom={0}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-light via-secondary-light to-accent animate-gradient-x">
          Introducing the Co-Pilot
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-secondary-light to-primary-light animate-gradient-x">
          for Ad Buying
          </span>
        </motion.h1>
        <motion.div 
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-200 mb-12 h-20"
          variants={textVariants}
          custom={1}
        >
          <TypeAnimation
            sequence={[
              'Optimize your campaigns with AI',
              2000,
              'Boost your ROI effortlessly',
              2000,
              'Gain deep insights into your audience',
              2000,
              'Automate your ad management',
              2000,
              'Maximize your ad performance',
              2000,
              'Leverage advanced analytics',
              2000,
              'Enhance your targeting precision',
              2000,
              'Streamline your ad creation process',
              2000,
              'Achieve higher engagement rates',
              2000,
              'Transform your marketing strategy',
              2000,
            ]}
            wrapper="span"
            cursor={true}
            repeat={Infinity}
            style={{ display: 'inline-block' }}
          />
        </motion.div>
        <motion.div
          variants={textVariants}
          custom={2}
          className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
        >
          <StartOptimizingButton />
        </motion.div>
      </motion.div>
      {isLoaded && (
        <motion.div
          className="absolute bottom-4 left-0 right-0 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <span className="text-gray-400 animate-bounce block">Scroll to explore</span>
          <FaChevronDown className="text-gray-400 mx-auto mt-2" />
        </motion.div>
      )}
    </div>
  );
};

export default Hero;