import React from 'react';
import { Field, FieldProps } from 'formik';

interface CheckboxGroupProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ name, label, options }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <Field name={name}>
              {({ field }: FieldProps) => (
                <input
                  type="checkbox"
                  id={`${name}-${option.value}`}
                  {...field}
                  value={option.value}
                  checked={(field.value as string[]).includes(option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              )}
            </Field>
            <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-gray-900">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;