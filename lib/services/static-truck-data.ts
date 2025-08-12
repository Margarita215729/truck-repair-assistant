/**
 * Static Truck Data Loader
 * Provides truck data from static JSON files when MongoDB is not available
 */

import path from 'path';
import fs from 'fs';

export interface StaticTruckData {
  make: string;
  model: string;
  model_year: number;
  fuel: string;
  payload_lb: number;
  notes: string;
  uid: string;
  market: string;
}

export interface TruckModel {
  id: string;
  make: string;
  model: string;
  engines: string[];
  years: number[];
  commonIssues: string[];
}

class StaticTruckDataService {
  private trucksData: StaticTruckData[] | null = null;
  private trucksNonUS: StaticTruckData[] | null = null;

  private loadStaticData(): StaticTruckData[] {
    if (this.trucksData) return this.trucksData;

    try {
      // Load US trucks data
      const usDataPath = path.join(process.cwd(), 'Static data for production', 'truck_dataset.json');
      const usData = JSON.parse(fs.readFileSync(usDataPath, 'utf8'));
      const usDataArray = usData.trucks || [];

      // Load non-US trucks data
      const nonUSDataPath = path.join(process.cwd(), 'Static data for production', 'truck_dataset_non_us.json');
      let nonUSDataArray: StaticTruckData[] = [];
      
      if (fs.existsSync(nonUSDataPath)) {
        const nonUSData = JSON.parse(fs.readFileSync(nonUSDataPath, 'utf8'));
        nonUSDataArray = nonUSData.trucks || [];
      }
      
      // Merge all data
      this.trucksData = [...usDataArray, ...nonUSDataArray];
      this.trucksNonUS = nonUSDataArray;

      console.log(`Loaded ${this.trucksData.length} truck models from static data`);
      return this.trucksData;
    } catch (error) {
      console.error('Error loading static truck data:', error);
      this.trucksData = [];
      return this.trucksData;
    }
  }

  getAllMakes(): string[] {
    const data = this.loadStaticData();
    const makes = [...new Set(data.map(truck => truck.make))];
    return makes.sort();
  }

  getModelsByMake(make: string): string[] {
    const data = this.loadStaticData();
    const models = [...new Set(
      data
        .filter(truck => truck.make.toLowerCase() === make.toLowerCase())
        .map(truck => truck.model)
    )];
    return models.sort();
  }

  getTrucksByMakeModel(make: string, model: string): StaticTruckData[] {
    const data = this.loadStaticData();
    return data.filter(
      truck => 
        truck.make.toLowerCase() === make.toLowerCase() && 
        truck.model.toLowerCase() === model.toLowerCase()
    );
  }

  searchTrucks(query: string): StaticTruckData[] {
    const data = this.loadStaticData();
    const searchQuery = query.toLowerCase();
    
    return data.filter(truck => 
      truck.make.toLowerCase().includes(searchQuery) ||
      truck.model.toLowerCase().includes(searchQuery) ||
      truck.notes.toLowerCase().includes(searchQuery)
    ).slice(0, 20); // Limit results
  }

  // Convert static data to our TruckModel format
  convertToTruckModel(staticTrucks: StaticTruckData[]): TruckModel[] {
    const groupedByMakeModel = new Map<string, StaticTruckData[]>();
    
    // Group trucks by make+model
    staticTrucks.forEach(truck => {
      const key = `${truck.make}|${truck.model}`;
      if (!groupedByMakeModel.has(key)) {
        groupedByMakeModel.set(key, []);
      }
      groupedByMakeModel.get(key)!.push(truck);
    });

    // Convert to TruckModel format
    return Array.from(groupedByMakeModel.entries()).map(([key, trucks]) => {
      const [make, model] = key.split('|');
      const years = [...new Set(trucks.map(t => t.model_year))].sort();
      
      // Extract common engines from notes
      const engines = this.extractEnginesFromNotes(trucks);
      const commonIssues = this.extractCommonIssues(trucks);
      
      return {
        id: trucks[0].uid,
        make,
        model,
        engines,
        years,
        commonIssues
      };
    });
  }

  private extractEnginesFromNotes(trucks: StaticTruckData[]): string[] {
    const engines = new Set<string>();
    
    trucks.forEach(truck => {
      const notes = truck.notes.toLowerCase();
      
      // Common engine patterns
      if (notes.includes('cummins')) engines.add('Cummins');
      if (notes.includes('detroit') || notes.includes('dd15') || notes.includes('dd13')) engines.add('Detroit Diesel');
      if (notes.includes('caterpillar') || notes.includes('cat c15') || notes.includes('c15')) engines.add('Caterpillar');
      if (notes.includes('paccar')) engines.add('PACCAR');
      if (notes.includes('volvo')) engines.add('Volvo');
      if (notes.includes('mack')) engines.add('Mack');
      
      // If no specific engine found, use fuel type
      if (engines.size === 0) {
        engines.add(`${truck.fuel} Engine`);
      }
    });
    
    return Array.from(engines);
  }

  private extractCommonIssues(trucks: StaticTruckData[]): string[] {
    const issues = new Set<string>();
    
    trucks.forEach(truck => {
      const notes = truck.notes.toLowerCase();
      
      // Extract issues from notes
      if (notes.includes('discontinued')) issues.add('Parts availability may be limited');
      if (notes.includes('payload')) issues.add('Payload capacity considerations');
      if (notes.includes('fuel efficiency')) issues.add('Fuel efficiency optimization needed');
      if (notes.includes('safety')) issues.add('Safety system maintenance required');
    });
    
    // Add some generic common issues for trucks
    issues.add('Engine maintenance');
    issues.add('Brake system checks');
    issues.add('Transmission service');
    
    return Array.from(issues);
  }

  // Get all truck models in our format
  getAllTruckModels(): TruckModel[] {
    const data = this.loadStaticData();
    return this.convertToTruckModel(data);
  }
}

export const staticTruckDataService = new StaticTruckDataService();