import type { NextRequest, NextResponse } from 'next/server';

// Функция для перенаправлений и middleware
export default function middleware(_req: NextRequest): NextResponse | undefined {
  // На данный момент не выполняем никаких действий
  return undefined;
}

export const config = {
  matcher: [
    /*
     * Пути для которых middleware будет работать, например:
     * '/api/:path*',
     * '/old-routes/:path*',
     */
  ],
};
