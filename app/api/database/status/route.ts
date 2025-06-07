import { NextResponse } from 'next/server';
import { databaseService } from '@/lib/services/database';

export async function GET() {
  try {
    // Проверка подключения к базе данных
    const dbStatus = await databaseService.testConnection();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Попытка инициализации схемы базы данных
    const initResult = await databaseService.initializeSchema();
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      message: 'Database schema initialized successfully',
      result: initResult
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
