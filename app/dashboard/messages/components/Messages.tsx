'use client';

import React, { useState, useEffect } from 'react';
import { useConversations, useMessages } from '../hooks/useMessages';
import { mutate } from 'swr';
import { useDashboard } from '../../context/DashboardContext';
import { useParams } from 'next/navigation';
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


interface Conversation {
  musicianId: string;
  musicianName: string;
  lastMessage: string;
  lastMessageAt: string;
  musicianImage: string;
}


const ConversationView = ({ conversation, onBack }: { conversation: Conversation | null, onBack: () => void }) => {
  const params = useParams();
  const musicianId = params.musicianId as string;
  const { messages, isLoading } = useMessages(musicianId ?? null);
  const [newMessage, setNewMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const messageListRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    setNewMessage('');
    await fetch(`/api/messages/${conversation?.musicianId}`, {
      method: 'POST',
      body: JSON.stringify({ text: newMessage }),
    });
    mutate([`/api/messages`, conversation?.musicianId]);
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

  if (isLoading) {
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
          {messages.map((msg: Message) => (
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
  const { conversations, isLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const params = useParams();
  const musicianId = params.musicianId as string;

  useEffect(() => {
    setPageTitle('Mensajes');
  }, [setPageTitle]);

  useEffect(() => {
    if (conversations && conversations.length > 0) {
      if (musicianId) {
        const conversation = conversations.find((c: Conversation) => c.musicianId === musicianId);
        setSelectedConversation(conversation);
      } else {
        setSelectedConversation(conversations[0]);
      }
    }
  }, [conversations, musicianId]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (conversations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
        <Typography variant="h6" color="text.secondary">
          No tenés mensajes aún.
        </Typography>
      </Box>
    );
  }

  const conversationList = (
    <List>
      {Array.isArray(conversations) && conversations.map((convo: Conversation) => (
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
