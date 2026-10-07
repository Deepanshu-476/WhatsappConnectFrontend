import { NextResponse } from 'next/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole('admin');
    const { id } = await params;
    const cookieHeader = request.headers.get('cookie') ?? '';

    const backendRes = await fetch(`${BACKEND_URL}/api/campaign-settings/opt-outs/${id}`, {
      method: 'DELETE',
      headers: { cookie: cookieHeader },
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    return toErrorResponse(err);
  }
}
