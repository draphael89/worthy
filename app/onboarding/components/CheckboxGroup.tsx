import React from 'react';
import { Field, FieldProps, useField } from 'formik';

interface CheckboxGroupProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ name, label, options }) => {
  const [field, meta, helpers] = useField(name);

  const handleChange = (value: string) => {
    const currentValues = field.value || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];
    helpers.setValue(newValues);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="checkbox"
              id={`${name}-${option.value}`}
              checked={(field.value || []).includes(option.value)}
              onChange={() => handleChange(option.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-gray-900">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {meta.touched && meta.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}
    </div>
  );
};

export default CheckboxGroup;