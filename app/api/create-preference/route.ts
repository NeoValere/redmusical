import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});
const preference = new Preference(client);

export async function POST(request: Request) {
  try {
    const { userId, role, amount, description } = await request.json();

    const preferenceBody = {
      items: [
        {
          id: userId, // Placeholder ID, ideally a unique product ID
          title: description,
          unit_price: amount,
          quantity: 1,
        },
      ],
      external_reference: `${userId}-${role}`, // To identify the user and role after payment
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
      },
      auto_return: 'approved_on_failure',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`, // Webhook for payment notifications
    };

    const response = await preference.create({ body: preferenceBody });
    return NextResponse.json({ id: response.id });
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    return NextResponse.json({ error: 'Error creating payment preference' }, { status: 500 });
  }
}
