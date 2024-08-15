import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Carousel3DProps {
  children: React.ReactElement[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const Carousel3D: React.FC<Carousel3DProps> = ({ children, currentIndex, onIndexChange }) => {
  const validChildren = React.Children.toArray(children).filter(
    (child): child is React.ReactElement => React.isValidElement(child)
  );

  if (validChildren.length === 0) {
    console.warn('No valid children provided to Carousel3D');
    return null;
  }

  return (
    <div className="relative w-full h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          {validChildren[currentIndex]}
        </motion.div>
      </AnimatePresence>
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <div className="bg-gray-200 h-1 w-full max-w-md rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${((currentIndex + 1) / validChildren.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Carousel3D;