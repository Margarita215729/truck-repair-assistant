import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Read truck dataset
    const datasetPath = join(process.cwd(), 'truck_dataset.json');
    const dataset = JSON.parse(readFileSync(datasetPath, 'utf-8'));
    
    // Read truck schema
    const schemaPath = join(process.cwd(), 'truck_schema.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    
    // Get truck models from components
    const { TRUCK_MODELS } = await import('@/components/data/trucks/models');
    
    return NextResponse.json({
      success: true,
      data: {
        dataset: {
          totalTrucks: dataset.length,
          sample: dataset.slice(0, 3), // First 3 records as sample
          path: 'truck_dataset.json'
        },
        schema: {
          structure: schema,
          path: 'truck_schema.json'
        },
        models: {
          total: TRUCK_MODELS.length,
          makes: [...new Set(TRUCK_MODELS.map(truck => truck.make))],
          sample: TRUCK_MODELS.slice(0, 3),
          source: 'components/data/trucks/models.ts'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Data API Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch truck data',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchCriteria } = await request.json();
    
    // Read truck dataset
    const datasetPath = join(process.cwd(), 'truck_dataset.json');
    const dataset = JSON.parse(readFileSync(datasetPath, 'utf-8'));
    
    // Get truck models from components
    const { TRUCK_MODELS } = await import('@/components/data/trucks/models');
    
    // Search in dataset
    let datasetResults = dataset;
    let modelsResults = TRUCK_MODELS;
    
    if (searchCriteria) {
      if (searchCriteria.make) {
        datasetResults = dataset.filter((truck: any) => 
          truck.make?.toLowerCase().includes(searchCriteria.make.toLowerCase())
        );
        modelsResults = TRUCK_MODELS.filter(truck => 
          truck.make.toLowerCase().includes(searchCriteria.make.toLowerCase())
        );
      }
      
      if (searchCriteria.model) {
        datasetResults = datasetResults.filter((truck: any) => 
          truck.model?.toLowerCase().includes(searchCriteria.model.toLowerCase())
        );
        modelsResults = modelsResults.filter(truck => 
          truck.model.toLowerCase().includes(searchCriteria.model.toLowerCase())
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      searchCriteria,
      results: {
        dataset: {
          count: datasetResults.length,
          results: datasetResults.slice(0, 10) // Limit to 10 results
        },
        models: {
          count: modelsResults.length,
          results: modelsResults.slice(0, 10)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Data Search API Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to search truck data',
        success: false 
      },
      { status: 500 }
    );
  }
}
