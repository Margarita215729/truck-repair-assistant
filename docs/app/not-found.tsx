'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">🚫 Страница не найдена</h2>
        <p className="text-gray-700 mb-6">
          Запрашиваемый маршрут не существует. Проверьте URL или вернитесь на главную страницу.
        </p>
        <Link 
          href="/" 
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 inline-block"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
