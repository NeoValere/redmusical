import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ musicianId: string }> }) {
  const params = await props.params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { musicianId } = params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: musicianId,
          },
          {
            senderId: musicianId,
            receiverId: userId,
          },
        ],
      },
      orderBy: {
        sentAt: 'asc',
      },
      include: {
        sender: {
          select: {
            fullName: true,
            profileImageUrl: true,
          }
        }
      }
    });

    const formattedMessages = messages.map(message => ({
      id: message.id,
      text: message.content,
      sender: message.senderId === userId ? 'me' : 'them',
      timestamp: new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: message.sender.fullName,
      senderImage: message.sender.profileImageUrl,
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse(JSON.stringify({ error: 'Error fetching messages' }), { status: 500 });
  }
}

export async function POST(request: Request, props: { params: Promise<{ musicianId: string }> }) {
  const params = await props.params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { musicianId } = params;
  const { text } = await request.json();

  try {
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId: musicianId,
        content: text,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return new NextResponse(JSON.stringify({ error: 'Error sending message' }), { status: 500 });
  }
}
