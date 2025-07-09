import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuario no autenticado.' }, { status: 401 });
    }

    const { conversationId } = params;
    if (!conversationId) {
      return NextResponse.json({ error: 'Falta conversationId.' }, { status: 400 });
    }

    console.log('Fetching conversation with ID:', conversationId);

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            senderMusician: { select: { id: true, artisticName: true, profileImageUrl: true, userId: true } },
            senderContractor: { select: { id: true, fullName: true, profileImageUrl: true, userId: true } },
          },
        },
        musicianParticipants: { select: { id: true, artisticName: true, profileImageUrl: true, userId: true } },
        contractorParticipants: { select: { id: true, fullName: true, profileImageUrl: true, userId: true } },
      },
    });

    if (!conversation) {
      console.log('Conversation not found with ID:', conversationId);
      return NextResponse.json({ error: 'Conversación no encontrada.' }, { status: 404 });
    }

    console.log('Returning conversation:', JSON.stringify(conversation, null, 2));
    return NextResponse.json(conversation);

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request, { params }: { params: { conversationId: string } }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuario no autenticado.' }, { status: 401 });
    }

    const { conversationId } = params;
    const { content, senderRole } = await request.json();

    if (!conversationId || !content || !senderRole) {
      return NextResponse.json({ error: 'Faltan conversationId, content o senderRole.' }, { status: 400 });
    }

    const musicianSender = await prisma.musician.findFirst({ where: { userId: user.id } });
    const contractorSender = await prisma.contractor.findFirst({ where: { userId: user.id } });

    let senderMusicianId: string | undefined = undefined;
    let senderContractorId: string | undefined = undefined;

    if (senderRole === 'musician' && musicianSender) {
      senderMusicianId = musicianSender.id;
    } else if (senderRole === 'contractor' && contractorSender) {
      senderContractorId = contractorSender.id;
    } else {
      return NextResponse.json({ error: 'El perfil de remitente especificado no existe.' }, { status: 404 });
    }

    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        content,
        senderMusicianId,
        senderContractorId,
      },
    });
    
    // Also update the conversation's updatedAt timestamp
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
    });

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
