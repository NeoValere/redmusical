'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Box,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';

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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch conversations
    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mensajes
      </Typography>
      {conversations.length === 0 ? (
        <Typography>No tenés conversaciones.</Typography>
      ) : (
        <List>
          {conversations.map((convo) => (
            <Link href={`/messages/${convo.musicianId}`} passHref key={convo.musicianId}>
              <ListItemButton component="a">
                <ListItemAvatar>
                  <Avatar src={convo.musicianImage} />
                </ListItemAvatar>
                <ListItemText
                  primary={convo.musicianName}
                  secondary={
                    <>
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {convo.lastMessage}
                      </Typography>
                      {` — ${convo.lastMessageAt}`}
                    </>
                  }
                />
              </ListItemButton>
              <Divider variant="inset" component="li" />
            </Link>
          ))}
        </List>
      )}
    </Container>
  );
}
