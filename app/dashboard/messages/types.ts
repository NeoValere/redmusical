export interface Participant {
  id: string;
  userId: string;
  artisticName?: string;
  fullName?: string;
  profileImageUrl?: string | null;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderMusician: Participant | null;
  senderContractor: Participant | null;
}

export interface Conversation {
  id: string;
  musicianParticipants: Participant[];
  contractorParticipants: Participant[];
  messages: { content: string, createdAt: string }[];
}
