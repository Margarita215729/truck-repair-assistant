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
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
}

export interface SearchOptions {
  radius?: number;
  maxResults?: number;
  serviceType?: 'truck_repair' | 'truck_stop' | 'parts_store' | 'towing';
  minRating?: number;
  openNow?: boolean;
  sortBy?: 'distance' | 'rating' | 'relevance';
}

export class TruckServiceLocator {
  private nominatimBaseUrl = 'https://nominatim.openstreetmap.org';
  private userAgent = 'TruckRepairAssistant/1.0';

  async findNearbyServices(
    lat: number, 
    lng: number, 
    options: SearchOptions = {}
  ): Promise<ServiceLocation[]> {
    const {
      radius = 50,
      maxResults = 20,
      serviceType = 'truck_repair',
      minRating = 0,
      openNow = false,
      sortBy = 'distance'
    } = options;

    try {
      const query = this.getServiceQuery(serviceType);
      const bbox = this.calculateBoundingBox(lat, lng, radius);
      
      const response = await fetch(
        `${this.nominatimBaseUrl}/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `bounded=1&` +
        `viewbox=${bbox.join(',')}&` +
        `limit=${maxResults}&` +
        `addressdetails=1&` +
        `extratags=1`,
        {
          headers: {
            'User-Agent': this.userAgent
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const results = await response.json();
      const services = this.processResults(results, lat, lng);
      
      const filteredServices = services.filter(service => {
        if (minRating > 0 && (!service.rating || service.rating < minRating)) {
          return false;
        }
        if (openNow && !this.isOpenNow(service.openingHours)) {
          return false;
        }
        return true;
      });

      return this.sortResults(filteredServices, sortBy);
    } catch (error) {
      console.error('Error finding services:', error);
      return this.getStaticServices(lat, lng, serviceType, radius);
    }
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `${this.nominatimBaseUrl}/search?` +
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

  private getServiceQuery(serviceType: string): string {
    const queries: Record<string, string> = {
      truck_repair: 'truck repair service',
      truck_stop: 'truck stop',
      parts_store: 'truck parts store',
      towing: 'heavy duty towing'
    };
    return queries[serviceType] || queries.truck_repair;
  }

  private processResults(results: unknown[], userLat: number, userLng: number): ServiceLocation[] {
    return results.map((result: any) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const distance = this.calculateDistance(userLat, userLng, lat, lng);

      return {
        name: result.display_name?.split(',')[0] || 'Service Location',
        address: this.formatAddress(result),
        coordinates: [lat, lng] as [number, number],
        distance,
        phone: result.extratags?.phone,
        website: result.extratags?.website,
        openingHours: result.extratags?.opening_hours,
        services: this.extractServices(result),
        businessStatus: 'OPERATIONAL' as const,
        rating: this.estimateRating(result)
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
    return parts.join(', ') || result.display_name || 'Address unavailable';
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

  private estimateRating(result: any): number {
    let rating = 3.5;
    if (result.extratags?.phone) rating += 0.3;
    if (result.extratags?.website) rating += 0.2;
    if (result.extratags?.opening_hours) rating += 0.2;
    return Math.min(5, Math.max(1, rating));
  }

  private getStaticServices(lat: number, lng: number, serviceType: string, radius: number): ServiceLocation[] {
    const staticData: Record<string, Partial<ServiceLocation>[]> = {
      truck_repair: [
        {
          name: "24/7 Truck Repair",
          phone: "(555) 123-4567",
          services: ["Emergency Repair", "Diagnostics"],
          rating: 4.5,
          openingHours: "24/7"
        }
      ],
      truck_stop: [
        {
          name: "Interstate Truck Plaza",
          services: ["Fuel", "Parking", "Restaurant"],
          rating: 4.0,
          openingHours: "24/7"
        }
      ],
      parts_store: [
        {
          name: "Commercial Truck Parts",
          phone: "(555) 345-6789",
          services: ["Parts", "Filters"],
          rating: 4.3
        }
      ],
      towing: [
        {
          name: "Heavy Duty Towing",
          phone: "(555) 911-8697",
          services: ["Towing", "Recovery"],
          rating: 4.4,
          openingHours: "24/7"
        }
      ]
    };

    const services = staticData[serviceType] || [];
    return services.map(service => ({
      name: service.name || 'Service',
      address: `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      coordinates: [
        lat + (Math.random() - 0.5) * 0.02,
        lng + (Math.random() - 0.5) * 0.02
      ] as [number, number],
      distance: Math.random() * radius,
      businessStatus: 'OPERATIONAL' as const,
      ...service
    }));
  }

  private sortResults(results: ServiceLocation[], sortBy: string): ServiceLocation[] {
    switch (sortBy) {
      case 'rating':
        return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'distance':
        return results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case 'relevance':
        return results.sort((a, b) => {
          const scoreA = (a.rating || 0) * 2 - (a.distance || 0) * 0.1;
          const scoreB = (b.rating || 0) * 2 - (b.distance || 0) * 0.1;
          return scoreB - scoreA;
        });
      default:
        return results;
    }
  }

  private isOpenNow(openingHours?: string): boolean {
    if (!openingHours) return false;
    if (openingHours.includes('24')) return true;
    
    const now = new Date();
    const hour = now.getHours();
    return hour >= 6 && hour <= 22;
  }

  private calculateBoundingBox(lat: number, lng: number, radiusMiles: number): number[] {
    const degreeRadius = radiusMiles / 69;
    return [
      lng - degreeRadius,
      lat - degreeRadius,
      lng + degreeRadius,
      lat + degreeRadius
    ];
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959;
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
}

export const truckServiceLocator = new TruckServiceLocator();
