import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
          },
          {
            receiverId: userId,
          },
        ],
      },
      distinct: ['senderId', 'receiverId'],
      orderBy: {
        sentAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            profileImageUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            profileImageUrl: true,
          },
        },
      },
    });

    const formattedConversations = conversations.map(message => {
      const otherUser = message.senderId === userId ? message.receiver : message.sender;
      return {
        musicianId: otherUser.id,
        musicianName: otherUser.fullName,
        lastMessage: message.content,
        lastMessageAt: new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        musicianImage: otherUser.profileImageUrl,
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return new NextResponse(JSON.stringify({ error: 'Error fetching conversations' }), { status: 500 });
  }
}
