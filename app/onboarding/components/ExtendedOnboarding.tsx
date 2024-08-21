import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import ProgressBar from './ProgressBar';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import TextAreaInput from './TextAreaInput';
import CheckboxGroup from './CheckboxGroup';
import { OnboardingFormValues, QuestionConfig } from '../types';

interface ExtendedOnboardingProps {
  onSubmit: (values: Partial<OnboardingFormValues>) => Promise<void>;
  isSubmitting: boolean;
  initialValues: Partial<OnboardingFormValues>;
}

const ExtendedOnboarding: React.FC<ExtendedOnboardingProps> = ({ onSubmit, isSubmitting, initialValues }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const extendedQuestions: QuestionConfig[] = [
    { 
      name: 'adChannels', 
      label: 'Which advertising channels do you use?', 
      component: CheckboxGroup,
      options: [
        { value: 'search', label: 'Search' },
        { value: 'social_media', label: 'Social Media' },
        { value: 'display', label: 'Display' },
        { value: 'video', label: 'Video' },
        { value: 'other', label: 'Other' },
      ]
    },
    { 
      name: 'otherAdChannel', 
      label: 'Please specify the other advertising channel', 
      component: TextInput,
      condition: (values) => values.adChannels?.includes('other')
    },
    { 
      name: 'targetAudience', 
      label: 'Who is your target audience?', 
      component: TextInput
    },
    { 
      name: 'audienceDescription', 
      label: 'Describe your target audience in more detail', 
      component: TextAreaInput
    },
    { 
      name: 'mainKPI', 
      label: 'What is your main KPI?', 
      component: SelectInput,
      options: [
        { value: 'cpc', label: 'Cost per Click (CPC)' },
        { value: 'cpa', label: 'Cost per Acquisition (CPA)' },
        { value: 'roas', label: 'Return on Ad Spend (ROAS)' },
        { value: 'ctr', label: 'Click-Through Rate (CTR)' },
        { value: 'other', label: 'Other' },
      ]
    },
    { 
      name: 'otherKPI', 
      label: 'Please specify the other KPI', 
      component: TextInput,
      condition: (values) => values.mainKPI === 'other'
    },
    { 
      name: 'currentPerformance', 
      label: 'What is your current performance for this KPI?', 
      component: TextInput
    },
    { 
      name: 'targetPerformance', 
      label: 'What is your target performance for this KPI?', 
      component: TextInput
    },
    { 
      name: 'mainChallenge', 
      label: 'What is your main challenge with advertising?', 
      component: SelectInput,
      options: [
        { value: 'budget_allocation', label: 'Budget Allocation' },
        { value: 'targeting', label: 'Targeting' },
        { value: 'creative', label: 'Creative' },
        { value: 'measurement', label: 'Measurement' },
        { value: 'other', label: 'Other' },
      ]
    },
    { 
      name: 'otherChallenge', 
      label: 'Please specify the other challenge', 
      component: TextInput,
      condition: (values) => values.mainChallenge === 'other'
    },
  ];

  const validationSchema = Yup.object().shape({
    adChannels: Yup.array().min(1, 'Please select at least one advertising channel'),
    otherAdChannel: Yup.string().when('adChannels', {
      is: (adChannels: string[]) => Array.isArray(adChannels) && adChannels.includes('other'),
      then: schema => schema.required('Please specify the other advertising channel'),
      otherwise: schema => schema
    }),
    targetAudience: Yup.string().required('Target audience is required'),
    audienceDescription: Yup.string().required('Audience description is required'),
    mainKPI: Yup.string().required('Main KPI is required'),
    otherKPI: Yup.string().when('mainKPI', {
      is: 'other',
      then: schema => schema.required('Please specify the other KPI'),
      otherwise: schema => schema
    }),
    currentPerformance: Yup.string().required('Current performance is required'),
    targetPerformance: Yup.string().required('Target performance is required'),
    mainChallenge: Yup.string().required('Main challenge is required'),
    otherChallenge: Yup.string().when('mainChallenge', {
      is: 'other',
      then: schema => schema.required('Please specify the other challenge'),
      otherwise: schema => schema
    }),
  });

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => Math.min(prev + 1, extendedQuestions.length - 1));
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion(prev => Math.max(prev - 1, 0));
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        if (currentQuestion === extendedQuestions.length - 1) {
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
            <ProgressBar currentStep={currentQuestion + 1} totalSteps={extendedQuestions.length} />
          </div>
          
          <AnimatePresence mode="wait">
            {currentQuestion < extendedQuestions.length && (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-lg rounded-lg p-8"
              >
                {React.createElement(extendedQuestions[currentQuestion].component, {
                  name: extendedQuestions[currentQuestion].name,
                  label: extendedQuestions[currentQuestion].label,
                  options: extendedQuestions[currentQuestion].options,
                  onSubmit: handleNextQuestion,
                  isLastQuestion: currentQuestion === extendedQuestions.length - 1,
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
            {currentQuestion < extendedQuestions.length - 1 ? (
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
                {isSubmitting ? 'Submitting...' : 'Complete Extended Onboarding'}
              </motion.button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ExtendedOnboarding;