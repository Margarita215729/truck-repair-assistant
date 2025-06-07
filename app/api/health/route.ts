import { NextResponse } from 'next/server';

// Явно указываем, что этот маршрут статический для совместимости с режимом export
export const dynamic = 'force-static';
export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(), // Это будет время сборки, не реальное
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
