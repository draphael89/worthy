import React, { useCallback, useRef, useEffect } from 'react';
import { useField, useFormikContext } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/solid';

interface SelectInputProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  onSubmit: () => void;
  isLastQuestion: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({ name, label, options, onSubmit, isLastQuestion }) => {
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    selectRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      // Handle previous question navigation
      // This functionality should be implemented in the parent component
    }
  }, [onSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFieldValue(name, e.target.value);
    setFieldTouched(name, true, false);
  }, [name, setFieldValue, setFieldTouched]);

  return (
    <div className="space-y-4">
      <label htmlFor={name} className="block text-2xl font-semibold text-gray-800">
        {label}
      </label>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <select
          ref={selectRef}
          {...field}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={`w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 appearance-none bg-white ${
            meta.touched && meta.error ? 'border-red-500' : ''
          }`}
          aria-label={label}
          aria-describedby={`${name}-error`}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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

export default SelectInput;