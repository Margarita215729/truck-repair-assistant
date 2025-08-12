import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { staticTruckDataService } from '@/lib/services/static-truck-data';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'truck-repair-assistant';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const make = searchParams.get('make');
  const model = searchParams.get('model');

  // If MongoDB is not configured, use static data
  if (!MONGODB_URI) {
    return handleStaticData(make, model);
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const trucksCollection = db.collection('trucks');
    
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
    console.error('MongoDB error, falling back to static data:', error);
    return handleStaticData(make, model);
  }
}

function handleStaticData(make: string | null, model: string | null) {
  try {
    if (make && model) {
      // Get specific truck details
      const trucks = staticTruckDataService.getTrucksByMakeModel(make, model);
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
    } else if (make) {
      // Get models for a specific make
      const models = staticTruckDataService.getModelsByMake(make);
      
      return NextResponse.json({
        success: true,
        models: models
      });
    } else {
      // Get all makes
      const makes = staticTruckDataService.getAllMakes();
      
      return NextResponse.json({
        success: true,
        makes: makes
      });
    }
  } catch (error) {
    console.error('Error using static truck data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch truck data' },
      { status: 500 }
    );
  }
}
