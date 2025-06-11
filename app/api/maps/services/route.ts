import { NextRequest, NextResponse } from 'next/server';
import { truckServiceLocator } from '../../../../lib/maps/simple-service-locator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const serviceType = searchParams.get('serviceType') || 'truck_repair';
    const radius = parseInt(searchParams.get('radius') || '50');
    const maxResults = parseInt(searchParams.get('maxResults') || '20');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const openNow = searchParams.get('openNow') === 'true';
    const sortBy = searchParams.get('sortBy') || 'distance';

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Valid lat and lng parameters are required' },
        { status: 400 }
      );
    }

    const services = await truckServiceLocator.findNearbyServices(lat, lng, {
      serviceType: serviceType as 'truck_repair' | 'truck_stop' | 'parts_store' | 'towing',
      radius,
      maxResults,
      minRating,
      openNow,
      sortBy: sortBy as 'distance' | 'rating' | 'relevance'
    });

    return NextResponse.json({
      success: true,
      services,
      count: services.length,
      searchParams: {
        lat,
        lng,
        serviceType,
        radius,
        maxResults,
        minRating,
        openNow,
        sortBy
      }
    });

  } catch (error) {
    console.error('Service search API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
