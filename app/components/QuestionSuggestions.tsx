import React from 'react';
import { Button, Box, Tooltip } from '@mui/material';
import { Question } from '../types/QuestionTypes';
import { motion } from 'framer-motion';

interface QuestionSuggestionsProps {
  questions: Question[];
  onSelectQuestion: (question: Question) => void;
}

const QuestionSuggestions: React.FC<QuestionSuggestionsProps> = ({ questions, onSelectQuestion }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
      {questions.map((question) => (
        <motion.div
          key={question.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Tooltip title="Click to ask this question" arrow>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => onSelectQuestion(question)}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                },
              }}
            >
              {question.text}
            </Button>
          </Tooltip>
        </motion.div>
      ))}
    </Box>
  );
};

export default QuestionSuggestions;