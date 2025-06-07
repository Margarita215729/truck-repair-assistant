import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '2.1.0',
    services: {
      ai: {
        github: true,
        azure: true
      },
      maps: true
    }
  });
}
