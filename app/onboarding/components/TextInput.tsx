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
  const { setFieldTouched, submitForm, isSubmitting, isValid } = useFormikContext();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isValid && !isSubmitting) {
        onSubmit();
      }
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
          innerRef={inputRef}
          {...field}
          type="text"
          onKeyDown={handleKeyDown}
          onBlur={() => setFieldTouched(name, true)}
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
            <ErrorMessage name={name} component="div" />
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