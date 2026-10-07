import { NextResponse } from 'next/server';
import { getCurrentAccount, toErrorResponse } from '@/lib/auth/account';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    await getCurrentAccount();
    const { id } = await context.params;
    const cookieHeader = request.headers.get('cookie') ?? '';

    const backendRes = await fetch(`${BACKEND_URL}/api/reminders/${encodeURIComponent(id)}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await getCurrentAccount();
    const { id } = await context.params;
    const cookieHeader = request.headers.get('cookie') ?? '';
    const body = await request.json().catch(() => ({}));

    const backendRes = await fetch(`${BACKEND_URL}/api/reminders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
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

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await getCurrentAccount();
    const { id } = await context.params;
    const cookieHeader = request.headers.get('cookie') ?? '';

    const backendRes = await fetch(`${BACKEND_URL}/api/reminders/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { cookie: cookieHeader },
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    return toErrorResponse(err);
  }
}
