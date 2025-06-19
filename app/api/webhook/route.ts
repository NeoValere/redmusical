import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import prisma from '@/lib/prisma';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});
const paymentClient = new Payment(client);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('MercadoPago Webhook received:', body);

    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const payment = await paymentClient.get({ id: paymentId });

      if (payment.status === 'approved') {
        const externalReference = payment.external_reference;
        if (!externalReference) {
          console.error('External reference is missing from payment:', payment);
          return NextResponse.json({ error: 'External reference missing' }, { status: 400 });
        }
        const [userId, role] = externalReference.split('-');

        // Update user's premium status based on role
        if (role === 'musician') {
          await prisma.musician.update({
            where: { id: userId },
            data: { isPremium: true },
          });
          console.log(`Musician ${userId} is now premium.`);
        } else if (role === 'contractor') {
          await prisma.contractor.update({
            where: { id: userId },
            data: { isPremium: true },
          });
          console.log(`Contractor ${userId} is now premium.`);
        }

        // Record the payment
        await prisma.payment.create({
          data: {
            userId: userId,
            role: role,
            amount: payment.transaction_amount,
            status: payment.status,
          },
        });
        console.log(`Payment recorded for user ${userId}, role ${role}.`);
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error processing MercadoPago webhook:', error);
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}
