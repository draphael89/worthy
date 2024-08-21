import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import ProgressBar from './ProgressBar';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import NumberInput from './NumberInput';
import TextAreaInput from './TextAreaInput';
import CheckboxGroup from './CheckboxGroup';
import { OnboardingFormValues, QuestionConfig } from '../types';

// Props for the QuestionFlow component
interface QuestionFlowProps {
  onSubmit: (values: OnboardingFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const QuestionFlow: React.FC<QuestionFlowProps> = ({ onSubmit, isSubmitting }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const initialValues: OnboardingFormValues = {
    companyName: '',
    website: '',
    industry: '',
    adSpend: 0,
    adChannels: [],
    otherAdChannel: '',
    primaryGoal: '',
    targetAudience: '',
    audienceDescription: '',
    mainKPI: '',
    otherKPI: '',
    currentPerformance: '',
    targetPerformance: '',
    mainChallenge: '',
    otherChallenge: '',
    primaryAdPlatform: '',
    otherAdPlatform: '',
    primaryAnalyticsTool: '',
    otherAnalyticsTool: '',
  };

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
    adChannels: Yup.array().min(1, 'Please select at least one advertising channel'),
    otherAdChannel: Yup.string().when('adChannels', {
      is: (adChannels: string[]) => Array.isArray(adChannels) && adChannels.includes('other'),
      then: schema => schema.required('Please specify the other advertising channel'),
      otherwise: schema => schema
    }),
    primaryGoal: Yup.string().required('Primary goal is required'),
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
    primaryAdPlatform: Yup.string().required('Primary ad platform is required'),
    otherAdPlatform: Yup.string().when('primaryAdPlatform', {
      is: 'other',
      then: schema => schema.required('Please specify the other ad platform'),
      otherwise: schema => schema
    }),
    primaryAnalyticsTool: Yup.string().required('Primary analytics tool is required'),
    otherAnalyticsTool: Yup.string().when('primaryAnalyticsTool', {
      is: 'other',
      then: schema => schema.required('Please specify the other analytics tool'),
      otherwise: schema => schema
    }),
  });

  const questions: QuestionConfig[] = [
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
      condition: (values) => values.adChannels.includes('other')
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
    { 
      name: 'primaryAdPlatform', 
      label: 'What is your primary advertising platform?', 
      component: SelectInput,
      options: [
        { value: 'google_ads', label: 'Google Ads' },
        { value: 'facebook_ads', label: 'Facebook Ads' },
        { value: 'linkedin_ads', label: 'LinkedIn Ads' },
        { value: 'twitter_ads', label: 'Twitter Ads' },
        { value: 'other', label: 'Other' },
      ]
    },
    { 
      name: 'otherAdPlatform', 
      label: 'Please specify the other advertising platform', 
      component: TextInput,
      condition: (values) => values.primaryAdPlatform === 'other'
    },
    { 
      name: 'primaryAnalyticsTool', 
      label: 'What is your primary analytics tool?', 
      component: SelectInput,
      options: [
        { value: 'google_analytics', label: 'Google Analytics' },
        { value: 'adobe_analytics', label: 'Adobe Analytics' },
        { value: 'mixpanel', label: 'Mixpanel' },
        { value: 'segment', label: 'Segment' },
        { value: 'other', label: 'Other' },
      ]
    },
    { 
      name: 'otherAnalyticsTool', 
      label: 'Please specify the other analytics tool', 
      component: TextInput,
      condition: (values) => values.primaryAnalyticsTool === 'other'
    },
  ];

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => Math.min(prev + 1, questions.length - 1));
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion(prev => Math.max(prev - 1, 0));
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        if (currentQuestion === questions.length - 1) {
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
            <ProgressBar currentStep={currentQuestion + 1} totalSteps={questions.length} />
          </div>
          
          <AnimatePresence mode="wait">
            {currentQuestion < questions.length && (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-lg rounded-lg p-8"
              >
                {React.createElement(questions[currentQuestion].component, {
                  name: questions[currentQuestion].name,
                  label: questions[currentQuestion].label,
                  options: questions[currentQuestion].options,
                  onSubmit: handleNextQuestion,
                  isLastQuestion: currentQuestion === questions.length - 1,
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
            {currentQuestion < questions.length - 1 ? (
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
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </motion.button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default QuestionFlow;