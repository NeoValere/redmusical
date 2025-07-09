import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

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

    const musicianProfile = await prisma.musician.findFirst({ where: { userId: user.id } });
    const contractorProfile = await prisma.contractor.findFirst({ where: { userId: user.id } });

    let whereClause: any = { 
      // Impossible condition to ensure no results if role is specified but profile doesn't exist
      id: '-1' 
    };

    if (role === 'musician' && musicianProfile) {
      whereClause = {
        musicianParticipants: { some: { id: musicianProfile.id } },
      };
    } else if (role === 'contractor' && contractorProfile) {
      whereClause = {
        contractorParticipants: { some: { id: contractorProfile.id } },
      };
    } else if (!role) {
      // If no role is specified, fetch all conversations for the user
      const orClauses = [];
      if (musicianProfile) {
        orClauses.push({ musicianParticipants: { some: { id: musicianProfile.id } } });
      }
      if (contractorProfile) {
        orClauses.push({ contractorParticipants: { some: { id: contractorProfile.id } } });
      }
      if (orClauses.length > 0) {
        whereClause = { OR: orClauses };
      }
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        musicianParticipants: {
          select: { id: true, artisticName: true, profileImageUrl: true, userId: true },
        },
        contractorParticipants: {
          select: { id: true, fullName: true, profileImageUrl: true, userId: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(conversations);

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
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

    const { recipientId, senderRole } = await request.json();
    console.log('Creating conversation with recipientId:', recipientId, 'and senderRole:', senderRole);

    if (!recipientId || !senderRole) {
      return NextResponse.json({ error: 'Faltan recipientId o senderRole.' }, { status: 400 });
    }

    const senderId = user.id;

    // Find sender profiles
    const musicianSender = await prisma.musician.findFirst({ where: { userId: senderId } });
    const contractorSender = await prisma.contractor.findFirst({ where: { userId: senderId } });

    let senderMusicianId: string | null = null;
    let senderContractorId: string | null = null;

    if (senderRole === 'musician' && musicianSender) {
      senderMusicianId = musicianSender.id;
    } else if (senderRole === 'contractor' && contractorSender) {
      senderContractorId = contractorSender.id;
    } else {
      return NextResponse.json({ error: 'El perfil de remitente especificado no existe.' }, { status: 404 });
    }

    // Find recipient profile (must be a musician)
    const recipientMusician = await prisma.musician.findFirst({ where: { OR: [{ userId: recipientId }, { id: recipientId }] } });
    if (!recipientMusician) {
      return NextResponse.json({ error: 'El perfil del destinatario no fue encontrado.' }, { status: 404 });
    }
    const recipientMusicianId = recipientMusician.id;

    // Check if a conversation already exists between the participants
    const where: any = {
      AND: [
        { musicianParticipants: { some: { id: recipientMusicianId } } },
      ]
    };
    if (senderMusicianId) {
      where.AND.push({ musicianParticipants: { some: { id: senderMusicianId } } });
    }
    if (senderContractorId) {
      where.AND.push({ contractorParticipants: { some: { id: senderContractorId } } });
    }

    const existingConversation = await prisma.conversation.findFirst({ where });

    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id }, { status: 200 });
    }

    // Create a new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        musicianParticipants: {
          connect: [{ id: recipientMusicianId }].concat(senderMusicianId ? [{ id: senderMusicianId }] : []),
        },
        contractorParticipants: {
          connect: senderContractorId ? [{ id: senderContractorId }] : [],
        },
        messages: {
          create: {
            content: '¡Hola! 👋',
            senderMusicianId: senderMusicianId,
            senderContractorId: senderContractorId,
          },
        },
      },
    });

    console.log('Successfully created conversation with ID:', newConversation.id);
    return NextResponse.json({ conversationId: newConversation.id }, { status: 201 });

  } catch (error) {
    console.error('Error al crear la conversación:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
