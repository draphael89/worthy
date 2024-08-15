import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Fade } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from './ChatInterface';
import ProfileSection from './ProfileSection';
import QuestionSuggestions from './QuestionSuggestions';
import ProfileCompletionBar from './ProfileCompletionBar';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, initializeQuestions, generateNextQuestion } from '../redux/actions/chatActions';
import { useAIContext } from 'app/contexts/AIContext';
import { RootState, AppDispatch } from '../redux/store';
import profileUtils from 'app/utils/profileUtils';
import { Question } from '../types/QuestionTypes';
import { useSpring, animated } from 'react-spring';
import { useTheme } from '@mui/material/styles';

const logger = (message: string, data?: any) => {
  console.log(`[AIChat] ${message}`, data);
};

const AIChat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const aiContext = useAIContext();
  const theme = useTheme();

  const chatMessages = useSelector((state: RootState) => state.chat.messages);
  const profile = useSelector((state: RootState) => state.profile);
  const questions = useSelector((state: RootState) => state.chat.questions);

  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [initialQuestion, setInitialQuestion] = useState<Question | null>(null);

  const handleSendMessage = useCallback(async (message: string) => {
    logger('Sending message', message);
    await dispatch(sendMessage(message, aiContext));
    setIsGeneratingQuestion(true);
    try {
      const nextQuestion = await dispatch(generateNextQuestion());
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
      }
    } catch (error) {
      console.error('Failed to generate next question:', error);
    } finally {
      setIsGeneratingQuestion(false);
    }
  }, [dispatch, aiContext]);

  const handleQuestionSelect = useCallback((question: Question) => {
    logger('Question selected', question);
    handleSendMessage(question.text);
  }, [handleSendMessage]);

  useEffect(() => {
    const initQuestions = async () => {
      if (questions.length === 0 && !isGeneratingQuestion) {
        logger('Initializing questions');
        setIsGeneratingQuestion(true);
        try {
          await dispatch(initializeQuestions());
          const initialQ = questions[0];
          if (initialQ) {
            setCurrentQuestion(initialQ);
            setInitialQuestion(initialQ);
          }
          logger('Questions initialized successfully');
        } catch (error) {
          console.error('Failed to initialize questions:', error);
        } finally {
          setIsGeneratingQuestion(false);
        }
      }
    };

    initQuestions();
  }, [dispatch, questions, isGeneratingQuestion]);

  const profileCompletionPercentage = profile ? profileUtils.getProfileCompletionPercentage(profile) : 0;

  const fadeProps = useSpring({
    opacity: isGeneratingQuestion ? 0.5 : 1,
    config: { duration: 300 },
  });

  return (
    <Box sx={{ flexGrow: 1, height: '100%', p: 2, backgroundColor: theme.palette.background.default }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>AI Chat Assistant</Typography>
              <animated.div style={fadeProps}>
                <ChatInterface messages={chatMessages} onSendMessage={handleSendMessage} initialQuestion={initialQuestion} />
              </animated.div>
              <AnimatePresence>
                {isGeneratingQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
              {currentQuestion && (
                <Fade in={!isGeneratingQuestion} timeout={500}>
                  <Box mt={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: theme.palette.text.secondary }}>Suggested Question:</Typography>
                    <QuestionSuggestions questions={[currentQuestion]} onSelectQuestion={handleQuestionSelect} />
                  </Box>
                </Fade>
              )}
            </Paper>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>User Profile</Typography>
              <ProfileCompletionBar completion={profileCompletionPercentage} />
              {profile && <ProfileSection profile={profile} />}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIChat;