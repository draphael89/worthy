import React, { useRef, useEffect } from 'react';
import { Field, ErrorMessage, useField, useFormikContext } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';

interface TextAreaInputProps {
  name: string;
  label: string;
  onSubmit: () => void;
  isLastQuestion: boolean;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ name, label, onSubmit, isLastQuestion }) => {
  const [field, meta] = useField(name);
  const { setFieldTouched } = useFormikContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      // Handle previous question navigation
      // This functionality should be implemented in the parent component
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
        <Field
          as="textarea"
          innerRef={textareaRef}
          name={name}
          onKeyDown={handleKeyDown}
          onBlur={() => setFieldTouched(name, true)}
          className={`w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
            meta.touched && meta.error ? 'border-red-500' : ''
          }`}
          style={{
            minHeight: '150px',
            resize: 'vertical',
          }}
          placeholder="Type your answer here..."
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
            <ErrorMessage name={name} component="div" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="text-sm text-gray-600">
        Press Ctrl + Enter to {isLastQuestion ? 'submit' : 'continue'}
      </div>
    </div>
  );
};

export default TextAreaInput;