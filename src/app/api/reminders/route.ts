import { NextResponse } from 'next/server';
import { getCurrentAccount, toErrorResponse } from '@/lib/auth/account';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export async function GET(request: Request) {
  try {
    await getCurrentAccount();
    const cookieHeader = request.headers.get('cookie') ?? '';
    const { search } = new URL(request.url);

    const backendRes = await fetch(`${BACKEND_URL}/api/reminders${search}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    await getCurrentAccount();
    const cookieHeader = request.headers.get('cookie') ?? '';
    const body = await request.json().catch(() => ({}));

    const backendRes = await fetch(`${BACKEND_URL}/api/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    return toErrorResponse(err);
  }
}
