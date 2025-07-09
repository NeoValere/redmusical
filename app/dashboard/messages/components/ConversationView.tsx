'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMessages } from '../hooks/useMessages';
import { mutate } from 'swr';
import { useParams } from 'next/navigation';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Box,
  CircularProgress,
  Paper,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';
import { useSession } from '@/app/components/useSession';
import type { Conversation, Message, Participant } from '@/app/dashboard/messages/types';

interface ConversationViewProps {
  conversationId: string | null;
  onBack: () => void;
}

const ConversationView = ({ conversationId, onBack }: ConversationViewProps) => {
  const { messages, isLoading, mutate: mutateMessages, conversation } = useMessages(conversationId);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    console.log('Conversation data in View:', conversation);
    console.log('Messages in View:', messages);
    console.log('Is Loading in View:', isLoading);
  }, [conversation, messages, isLoading]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const messageListRef = useRef<HTMLDivElement>(null);
  const { session } = useSession();
  const currentUser = session?.user;

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const otherParticipant = useMemo(() => {
    if (!conversation || !currentUser) return null;
    const musician = conversation.musicianParticipants.find((p: Participant) => p.userId !== currentUser.id);
    if (musician) return { ...musician, name: musician.artisticName || 'Usuario' };
    const contractor = conversation.contractorParticipants.find((p: Participant) => p.userId !== currentUser.id);
    if (contractor) return { ...contractor, name: contractor.fullName || 'Usuario' };
    return null;
  }, [conversation, currentUser]);

  const senderRole = useMemo(() => {
    if (!conversation || !currentUser) return null;
    if (conversation.musicianParticipants.some((p: Participant) => p.userId === currentUser.id)) return 'musician';
    if (conversation.contractorParticipants.some((p: Participant) => p.userId === currentUser.id)) return 'contractor';
    return null;
  }, [conversation, currentUser]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !conversationId) return;

    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      content: newMessage,
      createdAt: new Date().toISOString(),
      senderMusician: senderRole === 'musician' ? { userId: currentUser?.id, artisticName: 'Tú' } as Participant : null,
      senderContractor: senderRole === 'contractor' ? { userId: currentUser?.id, fullName: 'Tú' } as Participant : null,
    };

    mutateMessages(
      (currentData: any) => ({
        ...currentData,
        messages: [...(currentData?.messages || []), tempMessage],
      }),
      false
    );
    setNewMessage('');

    await fetch(`/api/messages/${conversationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage, senderRole }),
    });

    mutateMessages();
    mutate('/api/conversations');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!conversation) {
    return (
      <Box sx={{ p : "20px" , display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography  color="text.secondary">
          Seleccioná una conversación para ver los mensajes
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: isMobile ? '100%' : '100vh' }}>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={onBack} aria-label="back" sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
          )}
          <Avatar src={otherParticipant?.profileImageUrl || undefined} sx={{ mr: 2 }} />
          <Typography variant="h6" color="text.primary" noWrap>{otherParticipant?.name}</Typography>
        </Toolbar>
      </AppBar>
      <Box
        ref={messageListRef}
        sx={{
          background : "transparent" ,
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            },
          },
        }}
      >
        <List>
          {messages.map((msg: Message) => {
            const senderId = msg.senderMusician?.userId || msg.senderContractor?.userId;
            const isMe = senderId === currentUser?.id;
            return (
              <ListItem
                key={msg.id}
                sx={{
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: isMe ? '#004a77' : 'grey.800',
                    color: 'text.primary',
                    borderRadius: '20px',
                    maxWidth: '70%',
                  }}
                >
                  <ListItemText
                    primary={msg.content}
                    secondary={new Date(msg.createdAt).toLocaleTimeString()}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </Paper>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Box sx={{ p: 1, backgroundColor: 'background.paper' }}>
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

export default ConversationView;
