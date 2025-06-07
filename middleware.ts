export default function middleware(req) {
  // Здесь можно добавить логику перенаправления, если потребуется
  // Например, перенаправление старых маршрутов на новые
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
