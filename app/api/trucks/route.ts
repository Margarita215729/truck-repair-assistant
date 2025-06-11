import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB_NAME || 'truck-repair-assistant';

export async function GET(request: NextRequest) {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const trucksCollection = db.collection('trucks');
    
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    
    if (make && model) {
      // Get specific truck details
      const trucks = await trucksCollection.find({ 
        make: { $regex: new RegExp(make, 'i') },
        model: { $regex: new RegExp(model, 'i') }
      }).toArray();
      
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
    } else if (make) {
      // Get models for a specific make
      const models = await trucksCollection.distinct('model', { 
        make: { $regex: new RegExp(make, 'i') }
      });
      
      await client.close();
      
      return NextResponse.json({
        success: true,
        models: models.sort()
      });
    } else {
      // Get all makes
      const makes = await trucksCollection.distinct('make');
      
      await client.close();
      
      return NextResponse.json({
        success: true,
        makes: makes.sort()
      });
    }
    
  } catch (error) {
    console.error('Error fetching truck data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch truck data' },
      { status: 500 }
    );
  }
}
