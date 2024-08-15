import React, { useState, useCallback } from 'react';
import { Formik, Form, FormikHelpers, FormikErrors } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import TextInput from './components/TextInput';
import SelectInput from './components/SelectInput';
import NumberInput from './components/NumberInput';
import TextAreaInput from './components/TextAreaInput';
import ProgressBar from './components/ProgressBar';

// Define the shape of the form values
export interface OnboardingFormValues {
  companyName: string;
  industry: string;
  adSpend: number;
  primaryGoal: string;
  targetAudience: string;
}

// Validation schema for the form
const OnboardingSchema = Yup.object().shape({
  companyName: Yup.string().required('Company name is required'),
  industry: Yup.string().required('Industry is required'),
  adSpend: Yup.number()
    .positive('Ad spend must be a positive number')
    .required('Ad spend is required'),
  primaryGoal: Yup.string().required('Primary goal is required'),
  targetAudience: Yup.string().required('Target audience is required'),
});

interface OnboardingFormProps {
  onSubmit: (values: OnboardingFormValues) => Promise<void>;
}

interface QuestionConfig {
  name: keyof OnboardingFormValues;
  label: string;
  component: React.ComponentType<any>;
  options?: { value: string; label: string }[];
}

// Define the questions for the onboarding process
const questions: QuestionConfig[] = [
  { name: 'companyName', label: 'What is your company name?', component: TextInput },
  { name: 'industry', label: 'What industry are you in?', component: SelectInput, options: [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'adSpend', label: 'What is your monthly ad spend?', component: NumberInput },
  { name: 'primaryGoal', label: 'What is your primary advertising goal?', component: SelectInput, options: [
    { value: 'brand_awareness', label: 'Brand Awareness' },
    { value: 'lead_generation', label: 'Lead Generation' },
    { value: 'sales', label: 'Sales' },
    { value: 'customer_retention', label: 'Customer Retention' },
  ]},
  { name: 'targetAudience', label: 'Describe your target audience', component: TextAreaInput },
];

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSubmit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const initialValues: OnboardingFormValues = {
    companyName: '',
    industry: '',
    adSpend: 0,
    primaryGoal: '',
    targetAudience: '',
  };

  const handleSubmit = useCallback(async (
    values: OnboardingFormValues,
    { setSubmitting }: FormikHelpers<OnboardingFormValues>
  ) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      // Navigate to the dashboard page after successful submission
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting onboarding form:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  }, [onSubmit, router]);

  const handleNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prevQuestion => prevQuestion + 1);
    }
  }, [currentQuestion]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prevQuestion => prevQuestion - 1);
    }
  }, [currentQuestion]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Worthy.ai
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let&apos;s get to know your business better
          </p>
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={OnboardingSchema}
          onSubmit={handleSubmit}
        >
          {({ validateForm, setTouched, submitForm }) => (
            <Form className="mt-8 space-y-6">
              <ProgressBar currentStep={currentQuestion} totalSteps={questions.length} />
              <div className="min-h-[300px] flex flex-col justify-between">
                <div>
                  {currentQuestion < questions.length && React.createElement(questions[currentQuestion].component, {
                    name: questions[currentQuestion].name,
                    label: questions[currentQuestion].label,
                    options: questions[currentQuestion].options,
                  })}
                </div>
                <div className="flex justify-between mt-8">
                  {currentQuestion > 0 && (
                    <motion.button
                      type="button"
                      onClick={handlePrevious}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaArrowLeft className="mr-2" />
                      Previous
                    </motion.button>
                  )}
                  {currentQuestion < questions.length - 1 ? (
                    <motion.button
                      type="button"
                      onClick={() => {
                        validateForm().then((errors: FormikErrors<OnboardingFormValues>) => {
                          const currentFieldName = questions[currentQuestion].name;
                          if (!errors[currentFieldName]) {
                            handleNext();
                          } else {
                            setTouched({ [currentFieldName]: true });
                          }
                        });
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next
                      <FaArrowRight className="ml-2" />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={submitForm}
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Onboarding'}
                    </motion.button>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default OnboardingForm;