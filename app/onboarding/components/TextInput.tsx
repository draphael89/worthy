import React, { useRef, useEffect } from 'react';
import { useField, useFormikContext } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import { log } from '../../utils/logger';

interface TextInputProps {
  name: string;
  label: string;
  onSubmit: () => void;
  isLastQuestion: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ name, label, onSubmit, isLastQuestion }) => {
  log('TextInput', 'Component rendered', { name, label, isLastQuestion });

  const [field, meta, helpers] = useField(name);
  const { submitForm } = useFormikContext();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitForm();
    }
  };

  return (
    <div className="space-y-4">
      <label htmlFor={name} className="block text-2xl font-semibold text-gray-800">
        {label}
      </label>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={inputRef}
          {...field}
          type="text"
          onKeyDown={handleKeyDown}
          className={`w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
            meta.touched && meta.error ? 'border-red-500' : ''
          }`}
          placeholder="Type your answer here"
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
            className="text-red-500 text-sm"
          >
            {meta.error}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="text-sm text-gray-600">
        Press Enter to {isLastQuestion ? 'submit' : 'continue'}
      </div>
    </div>
  );
};

export default TextInput;