import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { staticTruckDataService } from '@/lib/services/static-truck-data';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'truck-repair-assistant';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({
      success: false,
      error: 'Search query is required'
    }, { status: 400 });
  }

  // If MongoDB is not configured, use static data
  if (!MONGODB_URI) {
    return handleStaticSearch(query);
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const trucksCollection = db.collection('trucks');
    
    // Search trucks by make, model, or engine
    const searchRegex = new RegExp(query, 'i');
    const trucks = await trucksCollection.find({
      $or: [
        { make: { $regex: searchRegex } },
        { model: { $regex: searchRegex } },
        { engines: { $elemMatch: { $regex: searchRegex } } }
      ]
    }).limit(20).toArray();
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      trucks: trucks.map(truck => ({
        id: truck._id.toString(),
        make: truck.make,
        model: truck.model,
        year: truck.year,
        engines: truck.engines || ['Unknown Engine'],
        commonIssues: truck.commonIssues || [],
        specifications: truck.specifications || {}
      }))
    });
    
  } catch (error) {
    console.error('MongoDB error, falling back to static data:', error);
    return handleStaticSearch(query);
  }
}

function handleStaticSearch(query: string) {
  try {
    const trucks = staticTruckDataService.searchTrucks(query);
    const truckModels = staticTruckDataService.convertToTruckModel(trucks);
    
    return NextResponse.json({
      success: true,
      trucks: truckModels.map(truck => ({
        id: truck.id,
        make: truck.make,
        model: truck.model,
        year: truck.years[0] || new Date().getFullYear(),
        engines: truck.engines,
        commonIssues: truck.commonIssues,
        specifications: { years: truck.years }
      }))
    });
  } catch (error) {
    console.error('Error searching static truck data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search trucks' },
      { status: 500 }
    );
  }
}
