import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Paper, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // TODO: Implement actual AI response logic
      setTimeout(() => {
        const aiMessage: Message = { id: (Date.now() + 1).toString(), text: "I'm an AI assistant. How can I help you?", sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>AI Assistant</Typography>
      <Paper elevation={3} sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 2 }}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: message.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main', mr: message.sender === 'user' ? 0 : 1, ml: message.sender === 'user' ? 1 : 0 }}>
                  {message.sender === 'user' ? 'U' : 'AI'}
                </Avatar>
                <Paper elevation={1} sx={{ p: 1, maxWidth: '70%', bgcolor: message.sender === 'user' ? 'primary.light' : 'secondary.light' }}>
                  <Typography variant="body1">{message.text}</Typography>
                </Paper>
              </Box>
            </Box>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </Paper>
      <Box sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button variant="contained" color="primary" endIcon={<SendIcon />} onClick={handleSend} sx={{ ml: 1 }}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default AIChat;