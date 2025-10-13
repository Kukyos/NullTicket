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

    return NextResponse.json({
      status: 'healthy',
      backend: 'healthy',
      database: backendHealth.database || 'unknown',
      ai_services: backendHealth.ai_services || 'unknown',
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