import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-4f35.up.railway.app';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: ticketId } = await params;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const body = await request.json();
    console.log('Ticket update request:', { ticketId, body });

    // Handle both status-only updates and full updates with resolution
    const { status, resolution, ...otherFields } = body;

    if (status === 'resolved' && resolution) {
      // For resolution with message, we need to make two calls:
      // 1. Update status
      // 2. Update resolution message
      
      // First, update the status
      const statusUrl = `${API_BASE_URL}/api/tickets/${ticketId}/status?status=${encodeURIComponent(status)}`;
      console.log('Calling Railway status update URL:', statusUrl);

      const statusResponse = await fetch(statusUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!statusResponse.ok) {
        const statusErrorText = await statusResponse.text();
        console.error('Status update failed:', statusErrorText);
        return NextResponse.json(
          { error: `Failed to update ticket status: ${statusResponse.status} ${statusResponse.statusText}` },
          {
            status: statusResponse.status,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }

      // Then, update the resolution message
      const resolutionUrl = `${API_BASE_URL}/api/tickets/${ticketId}`;
      console.log('Calling Railway resolution update URL:', resolutionUrl);

      const resolutionResponse = await fetch(resolutionUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolution }),
      });

      if (!resolutionResponse.ok) {
        const resolutionErrorText = await resolutionResponse.text();
        console.error('Resolution update failed:', resolutionErrorText);
        // Status was updated but resolution failed - we should still return success for status
        console.warn('Resolution update failed, but status was updated successfully');
      }

      // Return success for the status update
      return NextResponse.json(
        { 
          message: 'Ticket resolved successfully',
          status_updated: true,
          resolution_updated: resolutionResponse.ok
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    } else if (status) {
      // Handle status-only updates (existing logic)
      const railwayUrl = `${API_BASE_URL}/api/tickets/${ticketId}/status?status=${encodeURIComponent(status)}`;
      console.log('Calling Railway PUT URL:', railwayUrl);

      const response = await fetch(railwayUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Railway PUT response status:', response.status);
      const responseText = await response.text();
      console.log('Railway PUT response body:', responseText);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          return NextResponse.json(errorData, {
            status: response.status,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          });
        } catch (e) {
          return NextResponse.json(
            { error: `Backend error: ${response.status} ${response.statusText} - ${responseText}` },
            {
              status: response.status,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
            }
          );
        }
      }

      // Try to parse successful response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid JSON response from backend' },
          {
            status: 502,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }

      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } else {
      // Handle other field updates
      const railwayUrl = `${API_BASE_URL}/api/tickets/${ticketId}`;
      console.log('Calling Railway general update URL:', railwayUrl);

      const response = await fetch(railwayUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: `Backend error: ${response.status} ${response.statusText} - ${errorText}` },
          {
            status: response.status,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }

      const data = await response.json();
      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
  } catch (error) {
    console.error('Ticket update error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: `Ticket update error: ${errorMessage}`,
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}