'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,

} from '@mui/material';

import Grid from '@mui/material/Grid';
import { ArrowBack, Send } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
}

// Mock data for a conversation
const mockMessages: Message[] = [
  { id: '1', text: '¡Hola! Me interesa tu perfil.', sender: 'me', timestamp: '10:00 AM' },
  { id: '2', text: '¡Hola! Gracias por tu interés. ¿En qué puedo ayudarte?', sender: 'them', timestamp: '10:01 AM' },
  { id: '3', text: 'Estoy buscando un guitarrista para un evento el próximo mes.', sender: 'me', timestamp: '10:02 AM' },
];

const musicianData = {
  name: 'Carlos Rock',
  avatar: 'https://source.unsplash.com/random/100x100?musician,1',
};

export default function ConversationPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const router = useRouter();
  const params = useParams();
  const musicianId = params.musicianId as string;

  useEffect(() => {
    // Simulate API call to fetch messages for the conversation
    if (musicianId) {
      console.log(`Fetching messages for musician ${musicianId}`);
      setTimeout(() => {
        setMessages(mockMessages);
        setLoading(false);
      }, 1000);
    }
  }, [musicianId]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    const message: Message = {
      id: (messages.length + 1).toString(),
      text: newMessage,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, message]);
    setNewMessage('');
    // Here you would typically make an API call to send the message
    console.log('Sending message:', message);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.back()} aria-label="back">
            <ArrowBack />
          </IconButton>
          <Avatar src={musicianData.avatar} sx={{ mr: 2 }} />
          <Typography variant="h6">{musicianData.name}</Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <List>
          {messages.map((msg) => (
            <ListItem key={msg.id} sx={{ justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start' }}>
              <Paper
                elevation={3}
                sx={{
                  p: 1.5,
                  bgcolor: msg.sender === 'me' ? 'primary.main' : 'grey.300',
                  color: msg.sender === 'me' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: '20px',
                  maxWidth: '70%',
                }}
              >
                <ListItemText primary={msg.text} secondary={msg.timestamp} secondaryTypographyProps={{ color: msg.sender === 'me' ? 'rgba(255,255,255,0.7)' : 'text.secondary' }} />
              </Paper>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 2, backgroundColor: 'background.paper' }} component={Paper} square>
        <Grid container spacing={2} alignItems="center">
          <Grid sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Escribí un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </Grid>
          <Grid>
            <Button
              variant="contained"
              color="primary"
              endIcon={<Send />}
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              Enviar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
