import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-4f35.up.railway.app';

    // Check backend health
    const backendResponse = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!backendResponse.ok) {
      return NextResponse.json({
        status: 'unhealthy',
        backend: 'unreachable',
        database: 'unknown',
        ai_services: 'unknown',
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }

    const backendHealth = await backendResponse.json();

    // Handle both old and new backend health formats
    const databaseStatus = backendHealth.database || backendHealth.services?.database;
    const aiStatus = backendHealth.ai_services || backendHealth.services?.ai;

    // Convert old format values to new format
    const normalizedDatabase = databaseStatus === 'ok' ? 'healthy' : 
                              databaseStatus === 'healthy' ? 'healthy' : 'unhealthy';
    const normalizedAi = aiStatus === true ? 'healthy' : 
                        aiStatus === 'healthy' ? 'healthy' : 'unhealthy';

    return NextResponse.json({
      status: 'healthy',
      backend: 'healthy',
      database: normalizedDatabase,
      ai_services: normalizedAi,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      backend: 'error',
      database: 'unknown',
      ai_services: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}