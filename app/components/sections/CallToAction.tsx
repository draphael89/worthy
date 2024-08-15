import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useSpring, animated, config, useSpringRef, useChain, useTrail } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

interface CallToActionProps {
  handleSignIn?: () => Promise<void>;
}

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

const CallToAction: React.FC<CallToActionProps> = ({ handleSignIn }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const springRef = useSpringRef();
  const trailRef = useSpringRef();

  const { opacity, y } = useSpring({
    ref: springRef,
    from: { opacity: 0, y: 50 },
    to: { opacity: inView ? 1 : 0, y: inView ? 0 : 50 },
    config: config.molasses,
  });

  const gradientSpring = useSpring({
    from: { backgroundPosition: '0% 50%' },
    to: { backgroundPosition: '100% 50%' },
    config: { duration: 20000 },
    loop: { reverse: true },
  });

  const [{ xy }, set] = useSpring(() => ({ xy: [0, 0] }));

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      set({ xy: [e.clientX - window.innerWidth / 2, e.clientY - window.innerHeight / 2] });
    },
    [set]
  );

  const textTrail = useTrail(3, {
    ref: trailRef,
    from: { opacity: 0, y: 50 },
    to: { opacity: inView ? 1 : 0, y: inView ? 0 : 50 },
    config: config.molasses,
  });

  useChain(inView ? [springRef, trailRef] : [trailRef, springRef], [0, 0.2]);

  const particlesRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 1,
      speedX: Math.random() * 2 - 1,
      speedY: Math.random() * 2 - 1,
    }));

    let animationFrameId: number;

    const animateParticles = () => {
      if (particlesRef.current) {
        const ctx = particlesRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';

          particles.forEach((particle) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();

            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0 || particle.x > window.innerWidth) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > window.innerHeight) particle.speedY *= -1;
          });
        }
      }
      animationFrameId = requestAnimationFrame(animateParticles);
    };

    animateParticles();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900" 
      />
      <canvas
        ref={particlesRef}
        className="absolute inset-0"
        width={typeof window !== 'undefined' ? window.innerWidth : 0}
        height={typeof window !== 'undefined' ? window.innerHeight : 0}
      />
      <animated.div
        className="absolute inset-0"
        style={{
          transform: xy.to((x, y) => `translate3d(${x / 50}px, ${y / 50}px, 0)`),
        }}
      />
      <div className="relative w-full max-w-4xl px-4 sm:px-6 lg:px-8 z-10">
        <animated.div style={{ opacity, transform: y.to(y => `translateY(${y}px)`) }} className="text-center">
          <animated.h2 style={textTrail[0]} className="text-5xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Boost Your Facebook Ad ROI
          </animated.h2>
          <animated.p style={textTrail[1]} className="text-xl md:text-2xl text-gray-300 mb-12">
            Join the growing number of businesses using Worthy.ai to optimize their Facebook ad campaigns.
          </animated.p>
          <animated.div style={textTrail[2]}>
            <StartOptimizingButton />
            <p className="text-gray-400 mt-6">
              Start optimizing your ads in minutes. No credit card required.
            </p>
          </animated.div>
        </animated.div>
      </div>
    </section>
  );
};

export default CallToAction;