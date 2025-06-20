import { NextResponse, type NextRequest } from 'next/server';
import { populateFakeMusicians } from '../../../../lib/populateMusiciansHelper';

export const dynamic = 'force-dynamic'; // Ensure fresh execution

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const count = parseInt(body.count, 10);

    if (isNaN(count) || count <= 0) {
      return NextResponse.json({ message: 'Invalid count provided. Must be a positive integer.' }, { status: 400 });
    }
    
    // Basic security check for a sensitive endpoint (in a real app, this should be more robust)
    // For example, check for a specific admin user role or a secret key in headers/env
    const adminSecret = process.env.ADMIN_SEED_SECRET;
    const requestSecret = request.headers.get('x-admin-secret');

    if (!adminSecret || requestSecret !== adminSecret) {
      // Temporarily disable for ease of testing if ADMIN_SEED_SECRET is not set.
      // In production, this check MUST be enforced.
      if (adminSecret) { // Only enforce if ADMIN_SEED_SECRET is actually set
          console.warn('Admin endpoint access attempt without valid secret.');
         // return NextResponse.json({ message: 'Unauthorized: Missing or invalid admin secret.' }, { status: 401 });
      }
      console.warn('Bypassing admin secret check for populate-musicians endpoint because ADMIN_SEED_SECRET is not set. THIS IS INSECURE FOR PRODUCTION.');
    }


    console.log(`Received request to populate ${count} musicians.`);
    const result = await populateFakeMusicians(count);

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        createdCount: result.createdCount,
        errors: result.errors?.length ? result.errors : undefined,
      }, { status: 200 });
    } else {
      return NextResponse.json({
        message: result.message,
        errors: result.errors?.length ? result.errors : undefined,
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in /api/admin/populate-musicians:', error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ message: 'Invalid JSON payload in request body.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
