'use client';

import React, { useState, useEffect } from 'react';
import { useConversations } from '../hooks/useMessages';
import { useDashboard } from '../../context/DashboardContext';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useSession } from '@/app/components/useSession';
import ConversationView from './ConversationView';
import type { Conversation, Participant } from '../types';

export default function Messages() {
  const { setPageTitle } = useDashboard();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const { conversations, isLoading } = useConversations(role);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const { session } = useSession();
  const currentUser = session?.user;

  useEffect(() => {
    setPageTitle('Mensajes');
  }, [setPageTitle]);

  const handleConversationSelect = (conversation: Conversation) => {
    router.push(`/dashboard/messages/${conversation.id}`);
  };

  const handleBack = () => {
    router.push('/dashboard/messages');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="h6" color="text.secondary">
          No tenés conversaciones.
        </Typography>
      </Box>
    );
  }

  const conversationList = (
    <List sx={{ p: 0 }}>
      {conversations.map((convo: Conversation) => {
        const otherParticipant = convo.musicianParticipants.find((p: Participant) => p.userId !== currentUser?.id) || convo.contractorParticipants.find((p: Participant) => p.userId !== currentUser?.id);
        const lastMessage = convo.messages[0];

        return (
          <React.Fragment key={convo.id}>
            <ListItemButton
              selected={conversationId === convo.id}
              onClick={() => handleConversationSelect(convo)}
            >
              <ListItemAvatar>
                <Avatar src={otherParticipant?.profileImageUrl || undefined} />
              </ListItemAvatar>
              <ListItemText
                primary={otherParticipant?.artisticName || otherParticipant?.fullName}
                secondary={lastMessage?.content ? `${lastMessage.content.substring(0, 30)}...` : 'Conversación iniciada'}
              />
            </ListItemButton>
         
          </React.Fragment>
        );
      })}
    </List>
  );

  if (isMobile) {
    return (
      <Box component={Paper} sx={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        {conversationId ? (
          <ConversationView conversationId={conversationId} onBack={handleBack} />
        ) : (
          conversationList
        )}
      </Box>
    );
  }

  return (
    <Box
      component={Paper}
      elevation={0}
      sx={{
        height: 'calc(100% - 0px)',
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
      }}
    >
      <Box sx={{ overflowY: 'auto', backgroundColor: 'background.default' }}>
        {conversationList}
      </Box>
      <Box>
        <ConversationView conversationId={conversationId} onBack={handleBack} />
      </Box>
    </Box>
  );
}
