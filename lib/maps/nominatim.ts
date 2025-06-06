export interface ServiceLocation {
  name: string;
  address: string;
  coordinates: [number, number];
  distance?: number;
  phone?: string;
  website?: string;
  rating?: number;
  openingHours?: string;
  services?: string[];
}

export interface SearchOptions {
  radius?: number; // in miles
  maxResults?: number;
  serviceType?: 'truck_repair' | 'truck_stop' | 'parts_store' | 'towing';
}

export class NominatimService {
  private baseUrl = 'https://nominatim.openstreetmap.org';
  private userAgent = 'TruckRepairAssistant/1.0';

  async findNearbyServices(
    lat: number, 
    lng: number, 
    options: SearchOptions = {}
  ): Promise<ServiceLocation[]> {
    const {
      radius = 50,
      maxResults = 20,
      serviceType = 'truck_repair'
    } = options;

    const queries = this.getSearchQueries(serviceType);
    const bbox = this.calculateBoundingBox(lat, lng, radius);
    const allResults: ServiceLocation[] = [];

    for (const query of queries) {
      try {
        const response = await fetch(
          `${this.baseUrl}/search?` +
          `q=${encodeURIComponent(query)}&` +
          `format=json&` +
          `bounded=1&` +
          `viewbox=${bbox.join(',')}&` +
          `limit=${Math.ceil(maxResults / queries.length)}&` +
          `addressdetails=1&` +
          `extratags=1`,
          {
            headers: {
              'User-Agent': this.userAgent
            }
          }
        );

        if (!response.ok) {
          console.warn(`Nominatim request failed for query: ${query}`);
          continue;
        }

        const results = await response.json();
        const processedResults = this.processResults(results, lat, lng);
        allResults.push(...processedResults);

        // Add delay to respect Nominatim usage policy
        await this.delay(1000);
      } catch (error) {
        console.error(`Error searching for ${query}:`, error);
      }
    }

    // Remove duplicates and sort by distance
    const uniqueResults = this.removeDuplicates(allResults);
    return uniqueResults
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, maxResults);
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?` +
        `q=${encodeURIComponent(address)}&` +
        `format=json&` +
        `limit=1`,
        {
          headers: {
            'User-Agent': this.userAgent
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const results = await response.json();
      if (results.length > 0) {
        return {
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  private getSearchQueries(serviceType: string): string[] {
    const queryMap: Record<string, string[]> = {
      truck_repair: [
        'truck repair service',
        'diesel mechanic',
        'commercial vehicle repair'
      ],
      truck_stop: [
        'truck stop',
        'travel center'
      ],
      parts_store: [
        'truck parts store',
        'heavy duty parts'
      ],
      towing: [
        'heavy duty towing',
        'truck towing service'
      ]
    };

    return queryMap[serviceType] || queryMap.truck_repair;
  }

  private calculateBoundingBox(lat: number, lng: number, radiusMiles: number): number[] {
    const degreeRadius = radiusMiles / 69; // 1 degree ≈ 69 miles
    return [
      lng - degreeRadius, // left
      lat - degreeRadius, // bottom
      lng + degreeRadius, // right
      lat + degreeRadius  // top
    ];
  }

  private processResults(results: any[], userLat: number, userLng: number): ServiceLocation[] {
    return results.map(result => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const distance = this.calculateDistance(userLat, userLng, lat, lng);

      return {
        name: result.display_name.split(',')[0] || 'Unknown Service',
        address: this.formatAddress(result),
        coordinates: [lat, lng] as [number, number],
        distance,
        phone: result.extratags?.phone,
        website: result.extratags?.website,
        openingHours: result.extratags?.opening_hours,
        services: this.extractServices(result)
      };
    });
  }

  private formatAddress(result: any): string {
    const address = result.address || {};
    const parts = [
      address.house_number,
      address.road,
      address.city || address.town,
      address.state,
      address.postcode
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  private extractServices(result: any): string[] {
    const services: string[] = [];
    const tags = result.extratags || {};
    
    if (tags.amenity === 'fuel') services.push('Fuel');
    if (tags.service === 'vehicle:repair') services.push('Repair');
    if (tags.shop === 'car_parts') services.push('Parts');
    if (tags.amenity === 'restaurant') services.push('Food');
    
    return services;
  }

  private removeDuplicates(results: ServiceLocation[]): ServiceLocation[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const key = `${result.name}-${result.address}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const nominatimService = new NominatimService();
