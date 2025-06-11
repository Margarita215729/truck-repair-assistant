// Nominatim API service for geocoding (free alternative to Google Maps)
export interface Location {
  lat: number;
  lon: number;
  display_name: string;
  address?: {
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  phone?: string;
  location: Location;
  services: string[];
  rating?: number;
  distance?: number;
}

export class NominatimService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_NOMINATIM_URL || 'https://nominatim.openstreetmap.org';
  private readonly userAgent = 'TruckRepairAssistant/1.0';

  async geocodeAddress(address: string): Promise<Location[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': this.userAgent,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      return data.map((item: { lat: string; lon: string; display_name: string; address?: Record<string, string> }) => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        display_name: item.display_name,
        address: item.address,
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<Location | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': this.userAgent,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        display_name: data.display_name,
        address: data.address,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  async findNearbyServices(lat: number, lon: number, radius: number = 50): Promise<ServiceLocation[]> {
    // Since Nominatim doesn't have business search, we'll simulate with static data
    // In a real app, you might use Overpass API for OSM business data
    const mockServices: ServiceLocation[] = [
      {
        id: '1',
        name: 'Mike\'s Truck Repair',
        address: '123 Highway St, Anytown, USA',
        phone: '(555) 123-4567',
        location: { lat: lat + 0.01, lon: lon + 0.01, display_name: 'Mike\'s Truck Repair' },
        services: ['Engine Repair', 'Brake Service', 'Oil Change'],
        rating: 4.5,
      },
      {
        id: '2',
        name: 'Highway Truck Service',
        address: '456 Route 66, Somewhere, USA',
        phone: '(555) 987-6543',
        location: { lat: lat - 0.02, lon: lon + 0.03, display_name: 'Highway Truck Service' },
        services: ['Transmission', 'Electrical', 'Tire Service'],
        rating: 4.2,
      },
      {
        id: '3',
        name: 'Professional Truck Care',
        address: '789 Industrial Blvd, Worktown, USA',
        phone: '(555) 456-7890',
        location: { lat: lat + 0.03, lon: lon - 0.01, display_name: 'Professional Truck Care' },
        services: ['Preventive Maintenance', 'Diagnostics', 'Welding'],
        rating: 4.8,
      },
    ];

    // Calculate distances and filter by radius
    return mockServices
      .map(service => ({
        ...service,
        distance: this.calculateDistance(lat, lon, service.location.lat, service.location.lon),
      }))
      .filter(service => service.distance! <= radius)
      .sort((a, b) => a.distance! - b.distance!);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async getCurrentLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location = await this.reverseGeocode(latitude, longitude);
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }
}

// Singleton instance
export const nominatimService = new NominatimService();
