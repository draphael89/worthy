import React, { useRef, useEffect } from 'react';
import { Field, ErrorMessage, useField, useFormikContext } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';

interface TextInputProps {
  name: string;
  label: string;
  onSubmit: () => void;
  isLastQuestion: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ name, label, onSubmit, isLastQuestion }) => {
  const [field, meta] = useField(name);
  const { setFieldTouched } = useFormikContext();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      // Handle previous question navigation
      // This functionality should be implemented in the parent component
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col justify-center min-h-screen px-4 sm:px-6 lg:px-8"
    >
      <label htmlFor={name} className="text-3xl sm:text-4xl font-semibold mb-4 text-gray-800">
        {label}
      </label>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Field
          innerRef={inputRef}
          name={name}
          type="text"
          onKeyDown={handleKeyDown}
          onBlur={() => setFieldTouched(name, true)}
          className={`w-full px-4 py-3 text-xl sm:text-2xl border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
            meta.touched && meta.error ? 'border-red-500' : ''
          }`}
          style={{
            minHeight: '60px',
            WebkitTapHighlightColor: 'transparent'
          }}
          aria-label={label}
          aria-describedby={`${name}-error`}
        />
      </motion.div>
      <AnimatePresence>
        {meta.touched && meta.error && (
          <motion.div
            id={`${name}-error`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-red-500 mt-2 text-lg"
          >
            <ErrorMessage name={name} component="div" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Press Enter for {isLastQuestion ? 'submit' : 'next'}, Ctrl + ↑ for previous
        </div>
        <motion.button
          type="button"
          onClick={onSubmit}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLastQuestion ? 'Submit' : 'Next'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TextInput;