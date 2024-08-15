import React from 'react';
import { motion } from 'framer-motion';

interface GradientBackgroundProps {
  children: React.ReactNode;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 20% 20%, #a8edea 0%, #fed6e3 100%)',
            'radial-gradient(circle at 80% 80%, #d299c2 0%, #fef9d7 100%)',
            'radial-gradient(circle at 50% 50%, #a1c4fd 0%, #c2e9fb 100%)',
            'radial-gradient(circle at 30% 70%, #ff9a9e 0%, #fad0c4 100%)',
          ],
        }}
        transition={{
          duration: 30,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GradientBackground;