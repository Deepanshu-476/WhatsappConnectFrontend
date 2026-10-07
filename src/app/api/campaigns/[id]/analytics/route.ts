import { NextResponse } from 'next/server';
import { getCurrentAccount, toErrorResponse } from '@/lib/auth/account';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getCurrentAccount();
    const { id } = await params;
    const cookieHeader = request.headers.get('cookie') ?? '';

    const backendRes = await fetch(`${BACKEND_URL}/api/campaigns/${id}/analytics`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    return toErrorResponse(err);
  }
}
