export interface TruckData {
  id: string;
  make: string;
  model: string;
  year: number;
  engines: string[];
  commonIssues: string[];
  specifications?: Record<string, any>;
}

export interface TruckModel {
  id: string;
  make: string;
  model: string;
  engines: string[];
  years: number[];
  commonIssues: string[];
}

class TruckDataService {
  private baseUrl = '/api/trucks';

  async getAllMakes(): Promise<string[]> {
    try {
      const response = await fetch(this.baseUrl);
      const data = await response.json();
      return data.success ? data.makes : [];
    } catch (error) {
      console.error('Error fetching makes:', error);
      return [];
    }
  }

  async getModelsByMake(make: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}?make=${encodeURIComponent(make)}`);
      const data = await response.json();
      return data.success ? data.models : [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  async getTruckDetails(make: string, model: string): Promise<TruckData[]> {
    try {
      const response = await fetch(`${this.baseUrl}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
      const data = await response.json();
      return data.success ? data.trucks : [];
    } catch (error) {
      console.error('Error fetching truck details:', error);
      return [];
    }
  }

  async searchTrucks(query: string): Promise<TruckData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.success ? data.trucks : [];
    } catch (error) {
      console.error('Error searching trucks:', error);
      return [];
    }
  }
}

export const truckDataService = new TruckDataService();
