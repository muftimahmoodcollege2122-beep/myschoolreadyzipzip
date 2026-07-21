import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.API_INTERNAL_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${apiUrl}/api/v1/health/live`, { 
      signal: AbortSignal.timeout(5000) 
    });
    const text = await res.text();
    return NextResponse.json({ 
      ok: res.ok, status: res.status, body: text, apiUrl 
    });
  } catch (err: any) {
    return NextResponse.json({ 
      ok: false, error: err.message, apiUrl 
    }, { status: 500 });
  }
}
