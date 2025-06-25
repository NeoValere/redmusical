'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Box,
  CircularProgress,
  Paper,
  Grid,
  TextField,
  Button,
  AppBar,
  Toolbar,
  ListItem,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';

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

interface Conversation {
  musicianId: string;
  musicianName: string;
  lastMessage: string;
  lastMessageAt: string;
  musicianImage: string;
}

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    musicianId: '1',
    musicianName: 'Carlos Rock',
    lastMessage: '¡Hola! Me interesa tu perfil.',
    lastMessageAt: 'Hace 2 horas',
    musicianImage: 'https://source.unsplash.com/random/100x100?musician,1',
  },
  {
    musicianId: '3',
    musicianName: 'Ana Folk',
    lastMessage: 'Gracias por contactarme. ¿Qué tipo de evento es?',
    lastMessageAt: 'Ayer',
    musicianImage: 'https://source.unsplash.com/random/100x100?musician,2',
  },
];

const ConversationView = ({ conversation, onBack }: { conversation: Conversation | null, onBack: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const messageListRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      setLoading(true);
      // Simulate API call to fetch messages for the conversation
      console.log(`Fetching messages for musician ${conversation.musicianId}`);
      setTimeout(() => {
        // In a real app, you'd fetch messages for conversation.musicianId
        setMessages(mockMessages);
        setLoading(false);
      }, 500);
    }
  }, [conversation]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

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
    console.log('Sending message:', message);
  };

  if (!conversation) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="h6" color="text.secondary">
          Seleccioná una conversación para ver los mensajes
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={onBack} aria-label="back" sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
          )}
          <Avatar src={conversation.musicianImage} sx={{ mr: 2 }} />
          <Typography variant="h6" color="text.primary" noWrap>{conversation.musicianName}</Typography>
        </Toolbar>
      </AppBar>
      <Box
        ref={messageListRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          //backgroundColor: 'transparent',
        }}
      >
        <List>
          {messages.map((msg) => (
            <ListItem
              key={msg.id}
              sx={{
                justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: msg.sender === 'me' ? 'primary.main' : 'grey.800',
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
      <Box sx={{ p: 1, borderTop: '1px solid #ddd', backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Escribí un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{ p: '8px' }}
          >
            <Send />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default function Messages() {
  const { setPageTitle } = useDashboard();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setPageTitle('Mensajes');
  }, [setPageTitle]);

  useEffect(() => {
    // Simulate API call to fetch conversations
    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 1000);
  }, []);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  const conversationList = (
    <List>
      {conversations.map((convo) => (
        <React.Fragment key={convo.musicianId}>
          <ListItemButton
            selected={selectedConversation?.musicianId === convo.musicianId}
            onClick={() => handleConversationSelect(convo)}
          >
            <ListItemAvatar>
              <Avatar src={convo.musicianImage} />
            </ListItemAvatar>
            <ListItemText
              primary={convo.musicianName}
              secondary={`${convo.lastMessage.substring(0, 30)}...`}
            />
          </ListItemButton>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );

  if (isMobile) {
    return (
      <Box component={Paper} sx={{ height: 'calc(100vh - 152px)', display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <ConversationView conversation={selectedConversation} onBack={handleBack} />
        ) : (
          conversationList
        )}
      </Box>
    );
  }

  return (
    <Grid container component={Paper} sx={{ height: 'calc(100% - 96px)' }}>
      <Grid size={4} sx={{ borderRight: '1px solid #ddd', overflowY: 'auto' }}>
        {conversationList}
      </Grid>
      <Grid size={8}>
        <ConversationView conversation={selectedConversation} onBack={handleBack} />
      </Grid>
    </Grid>
  );
}
