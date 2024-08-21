import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import ProgressBar from './ProgressBar';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import NumberInput from './NumberInput';
import { OnboardingFormValues, QuestionConfig } from '../types';

interface CoreOnboardingProps {
  onSubmit: (values: OnboardingFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialValues: Partial<OnboardingFormValues>;
}

const CoreOnboarding: React.FC<CoreOnboardingProps> = ({ onSubmit, isSubmitting, initialValues }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const coreQuestions: QuestionConfig[] = [
    { 
      name: 'companyName', 
      label: 'What is your company name?', 
      component: TextInput
    },
    { 
      name: 'website', 
      label: 'What is your company website?', 
      component: TextInput
    },
    { 
      name: 'industry', 
      label: 'What industry are you in?', 
      component: SelectInput,
      options: [
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'saas', label: 'SaaS' },
        { value: 'finance', label: 'Finance' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'education', label: 'Education' },
        { value: 'other', label: 'Other' },
      ]
    },
    { 
      name: 'adSpend', 
      label: 'What is your monthly advertising spend?', 
      component: NumberInput
    },
    { 
      name: 'primaryGoal', 
      label: 'What is your primary advertising goal?', 
      component: SelectInput,
      options: [
        { value: 'brand_awareness', label: 'Brand Awareness' },
        { value: 'lead_generation', label: 'Lead Generation' },
        { value: 'sales', label: 'Sales' },
        { value: 'customer_retention', label: 'Customer Retention' },
        { value: 'other', label: 'Other' },
      ]
    },
  ];

  const validationSchema = Yup.object().shape({
    companyName: Yup.string().required('Company name is required'),
    website: Yup.string()
      .matches(
        /^www\..+\..+$/,
        'Please enter a valid website starting with www.'
      )
      .required('Website is required'),
    industry: Yup.string().required('Industry is required'),
    adSpend: Yup.number().positive('Ad spend must be a positive number').required('Ad spend is required'),
    primaryGoal: Yup.string().required('Primary goal is required'),
  });

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => Math.min(prev + 1, coreQuestions.length - 1));
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion(prev => Math.max(prev - 1, 0));
  };

  return (
    <Formik
      initialValues={initialValues as OnboardingFormValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        if (currentQuestion === coreQuestions.length - 1) {
          await onSubmit(values);
        } else {
          handleNextQuestion();
        }
        setSubmitting(false);
      }}
    >
      {({ values, errors, touched, isValid }) => (
        <Form className="max-w-2xl mx-auto">
          <div className="mb-8">
            <ProgressBar currentStep={currentQuestion + 1} totalSteps={coreQuestions.length} />
          </div>
          
          <AnimatePresence mode="wait">
            {currentQuestion < coreQuestions.length && (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-lg rounded-lg p-8"
              >
                {React.createElement(coreQuestions[currentQuestion].component, {
                  name: coreQuestions[currentQuestion].name,
                  label: coreQuestions[currentQuestion].label,
                  options: coreQuestions[currentQuestion].options,
                  onSubmit: handleNextQuestion,
                  isLastQuestion: currentQuestion === coreQuestions.length - 1,
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            {currentQuestion > 0 && (
              <motion.button
                type="button"
                onClick={handlePreviousQuestion}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </motion.button>
            )}
            {currentQuestion < coreQuestions.length - 1 ? (
              <motion.button
                type="button"
                onClick={handleNextQuestion}
                disabled={!isValid || isSubmitting}
                className={`px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-colors duration-200 ${
                  (!isValid || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              >
                {isSubmitting ? 'Submitting...' : 'Next'}
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 transition-colors duration-200 ${
                  (!isValid || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              >
                {isSubmitting ? 'Submitting...' : 'Complete Core Onboarding'}
              </motion.button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CoreOnboarding;