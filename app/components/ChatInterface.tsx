import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, Paper, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Message } from '../types/ChatTypes';
import { Question } from '../types/QuestionTypes';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  initialQuestion: Question | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, initialQuestion }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const theme = useTheme();

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000); // Simulating AI response time
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Paper 
        elevation={3}
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          mb: 2, 
          p: 2, 
          backgroundColor: theme.palette.background.default,
          '&::-webkit-scrollbar': {
            width: '0.4em'
          },
          '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)',
            outline: '1px solid slategrey'
          }
        }}
      >
        {messages.length === 0 && initialQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <SmartToyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Paper
                elevation={1}
                sx={{
                  maxWidth: '70%',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                }}
              >
                <Typography variant="body1">{initialQuestion.text}</Typography>
              </Paper>
            </Box>
          </motion.div>
        )}
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              {message.role !== 'user' && (
                <SmartToyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              )}
              <Paper
                elevation={1}
                sx={{
                  maxWidth: '70%',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: message.role === 'user' ? theme.palette.primary.main : theme.palette.background.paper,
                  color: message.role === 'user' ? theme.palette.primary.contrastText : theme.palette.text.primary,
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Paper>
              {message.role === 'user' && (
                <PersonIcon sx={{ ml: 1, color: theme.palette.primary.main }} />
              )}
            </Box>
          </motion.div>
        ))}
        {isTyping && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <SmartToyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Paper
              elevation={1}
              sx={{
                maxWidth: '70%',
                p: 2,
                borderRadius: '12px',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
              }}
            >
              <CircularProgress size={20} />
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>
      <Paper
        component="form"
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ mr: 1, '& fieldset': { border: 'none' } }}
        />
        <IconButton color="primary" onClick={handleSend} disabled={!input.trim()}>
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default ChatInterface;