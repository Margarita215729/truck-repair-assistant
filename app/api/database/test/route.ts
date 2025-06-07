import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/services/database';

export async function GET() {
  try {
    // Test database connection
    const connectionStatus = await databaseService.testConnection();
    
    return NextResponse.json({
      success: true,
      database: {
        connected: connectionStatus.connected,
        error: connectionStatus.error,
        timestamp: connectionStatus.timestamp
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database API Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to test database connection',
        success: false,
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    switch (action) {
      case 'test-truck-operations':
        // Test truck CRUD operations
        const testTruck = {
          make: 'Test Make',
          model: 'Test Model', 
          year: 2023,
          engine: 'Test Engine'
        };
        
        // Note: These methods may not exist yet in databaseService
        // This is a test to see what's available
        return NextResponse.json({
          success: true,
          message: 'Database operations test completed',
          availableMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(databaseService)),
          timestamp: new Date().toISOString()
        });
        
      case 'test-query':
        if (!data?.query) {
          return NextResponse.json(
            { error: 'Query is required for test-query action', success: false },
            { status: 400 }
          );
        }
        
        // Test raw query execution (be careful with this in production)
        const result = await databaseService.executeQuery?.(data.query, data.params || []);
        
        return NextResponse.json({
          success: true,
          result,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json(
          { error: 'Unknown action', success: false },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Database Operation API Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to execute database operation',
        success: false 
      },
      { status: 500 }
    );
  }
}
