import React, { useRef, useCallback, useMemo } from 'react';
import { useSpring, useTrail, animated, config, useSpringRef } from '@react-spring/web';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const RealResults: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const parallaxRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const shouldReduceMotion = useReducedMotion();

  const headerSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(-50px)' },
    to: async (next) => {
      if (!shouldReduceMotion) {
        await next({ opacity: 1, transform: 'translateY(0px)' });
        await next({ opacity: 0.8, transform: 'translateY(-10px)' });
      } else {
        await next({ opacity: 1, transform: 'translateY(0px)' });
      }
    },
    config: { ...config.molasses, duration: 3000 },
    loop: !shouldReduceMotion,
  });

  const gradientApi = useSpringRef();
  const gradientSpring = useSpring({
    ref: gradientApi,
    from: { backgroundPosition: '0% 50%' },
    to: { backgroundPosition: '100% 50%' },
    config: { duration: 20000 },
    loop: true,
  });

  React.useEffect(() => {
    gradientApi.start();
  }, [gradientApi]);

  const testimonials = useMemo(() => [
    {
      quote: "Worthy.ai has transformed our Facebook ad strategy. We've seen a 40% increase in ROI since implementing their AI-powered recommendations.",
      author: "Sarah J., E-commerce Owner",
      rating: 5,
    },
    {
      quote: "The time savings alone make Worthy.ai invaluable. We're able to focus on strategy while the AI handles the day-to-day optimizations.",
      author: "Mike T., Marketing Manager",
      rating: 5,
    },
    {
      quote: "The insights provided by Worthy.ai have helped us understand our audience better than ever before. Our campaigns are now more targeted and effective.",
      author: "Lisa R., Digital Marketer",
      rating: 5,
    },
  ], []);

  const trail = useTrail(testimonials.length, {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(50px)',
    config: config.wobbly,
  });

  const [{ xy }, set] = useSpring(() => ({ xy: [0, 0] }));

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      set({ xy: [e.clientX - window.innerWidth / 2, e.clientY - window.innerHeight / 2] });
    },
    [set]
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1));
  }, [testimonials.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0));
  }, [testimonials.length]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden w-full"
      onMouseMove={handleMouseMove}
    >
      <animated.div 
        style={{
          ...gradientSpring,
          backgroundSize: '400% 400%',
        }}
        className="absolute inset-0 bg-gradient-to-br from-hero-gradient-start to-hero-gradient-end" 
      />
      <ParticleBackground />
      <animated.div
        ref={parallaxRef}
        className="absolute inset-0 opacity-20"
        style={{
          transform: xy.to((x, y) => `translate3d(${x / 50}px, ${y / 50}px, 0)`),
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <radialGradient id="resultsglow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="50" fill="url(#resultsglow)" />
        </svg>
      </animated.div>
      <div className="relative w-full px-4 sm:px-6 lg:px-8 z-10">
        <animated.div style={headerSpring} className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-300 to-accent-300">
            Real Results
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
            See how businesses like yours have benefited from Worthy.ai
          </p>
        </animated.div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-12">
          {trail.map((style, index) => (
            <TestimonialCard key={index} style={style} {...testimonials[index]} />
          ))}
        </div>

        <div className="md:hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  handleNext();
                } else if (swipe > swipeConfidenceThreshold) {
                  handlePrev();
                }
              }}
            >
              <TestimonialCard {...testimonials[currentIndex]} style={{}} />
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center mt-8">
            <button 
              onClick={handlePrev} 
              className="mx-2 p-2 bg-gray-800 rounded-full transition-colors duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft className="text-white" />
            </button>
            <button 
              onClick={handleNext} 
              className="mx-2 p-2 bg-gray-800 rounded-full transition-colors duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              aria-label="Next testimonial"
            >
              <FaChevronRight className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

interface TestimonialCardProps {
  quote: string;
  author: string;
  rating: number;
  style: any;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, rating, style }) => {
  const [hovered, setHovered] = React.useState(false);

  const hoverSpring = useSpring({
    scale: hovered ? 1.05 : 1,
    boxShadow: hovered ? 'shadow-elevated' : 'shadow-soft',
    config: config.wobbly,
  });

  return (
    <animated.div
      style={{ ...style, ...hoverSpring }}
      className="bg-gray-800 bg-opacity-50 rounded-2xl p-8 transition-all duration-300 backdrop-filter backdrop-blur-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        whileHover={{ rotate: [0, 15, -15, 0], transition: { duration: 0.5 } }}
      >
        <FaQuoteLeft className="text-primary-300 text-4xl mb-4" />
      </motion.div>
      <p className="text-gray-300 text-lg mb-6 leading-relaxed">{quote}</p>
      <div className="flex justify-between items-center">
        <p className="text-white font-semibold">{author}</p>
        <div className="flex">
          {[...Array(rating)].map((_, i) => (
            <motion.div key={i} whileHover={{ scale: 1.2 }}>
              <FaStar className="text-accent-300 mr-1" />
            </motion.div>
          ))}
        </div>
      </div>
    </animated.div>
  );
};

const ParticleBackground: React.FC = () => {
  const particles = useMemo(() => 
    [...Array(50)].map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      duration: Math.random() * 10 + 10,
    })),
    []
  );

  return (
    <div className="absolute inset-0">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-20"
          animate={{
            x: [particle.x, Math.random() * window.innerWidth],
            y: [particle.y, Math.random() * window.innerHeight],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            left: particle.x,
            top: particle.y,
          }}
        />
      ))}
    </div>
  );
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default RealResults;