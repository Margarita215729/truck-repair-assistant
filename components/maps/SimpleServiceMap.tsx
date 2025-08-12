'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapPin, Loader2, Navigation, Search, Map } from 'lucide-react';

interface ServiceLocation {
  name: string;
  address: string;
  coordinates: [number, number];
  distance?: number;
  phone?: string;
  website?: string;
  rating?: number;
  openingHours?: string;
  services?: string[];
  serviceType?: string;
}

interface SimpleServiceMapProps {
  userLocation?: { lat: number; lng: number } | null;
  selectedServiceType?: string;
  onServiceSelect?: (service: ServiceLocation) => void;
  onServiceTypeChange?: (serviceType: string) => void;
  searchRadius?: number;
  className?: string;
}

// Simple service locator without external map dependencies
export function SimpleServiceMap({
  userLocation,
  selectedServiceType = 'truck_repair',
  onServiceSelect,
  onServiceTypeChange,
  searchRadius = 50,
  className = "h-96 w-full"
}: SimpleServiceMapProps) {
  const [services, setServices] = useState<ServiceLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceLocation | null>(null);

  const serviceTypes = [
    { value: 'truck_repair', label: 'Truck Repair', icon: '🔧', color: 'bg-red-100 text-red-800' },
    { value: 'truck_stop', label: 'Truck Stops', icon: '⛽', color: 'bg-blue-100 text-blue-800' },
    { value: 'parts_store', label: 'Parts Stores', icon: '🛍️', color: 'bg-green-100 text-green-800' },
    { value: 'towing', label: 'Towing Services', icon: '🚛', color: 'bg-orange-100 text-orange-800' }
  ];

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Load services from API
  const loadServices = useCallback(async () => {
    if (!userLocation) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/maps/services?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${searchRadius}&type=${selectedServiceType}`
      );
      const data = await response.json();

      if (data.success && data.services) {
        const servicesWithDistance = data.services.map((service: ServiceLocation) => ({
          ...service,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            service.coordinates[0],
            service.coordinates[1]
          )
        })).sort((a: ServiceLocation, b: ServiceLocation) => (a.distance || 0) - (b.distance || 0));

        setServices(servicesWithDistance);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      // Provide mock data as fallback
      setServices([
        {
          name: 'Pete\'s Truck Repair',
          address: '123 Highway 1, Trucker City, TX',
          coordinates: [userLocation.lat + 0.01, userLocation.lng + 0.01],
          distance: 2.5,
          phone: '(555) 123-4567',
          services: ['Engine Repair', 'Brake Service', 'Electrical'],
          rating: 4.5
        },
        {
          name: 'Highway Service Center',
          address: '456 Interstate Blvd, Repair Town, TX',
          coordinates: [userLocation.lat - 0.02, userLocation.lng + 0.02],
          distance: 5.8,
          phone: '(555) 987-6543',
          services: ['Full Service', 'Parts', 'Towing'],
          rating: 4.2
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, selectedServiceType, searchRadius, calculateDistance]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleServiceSelect = (service: ServiceLocation) => {
    setSelectedService(service);
    onServiceSelect?.(service);
  };

  const handleServiceTypeChange = (serviceType: string) => {
    onServiceTypeChange?.(serviceType);
  };

  const currentServiceType = serviceTypes.find(type => type.value === selectedServiceType) || serviceTypes[0];

  return (
    <div className={`${className} bg-white rounded-lg border border-gray-200 overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Service Locator</h3>
          </div>
          {userLocation && (
            <span className="text-xs text-gray-500">
              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </span>
          )}
        </div>

        {/* Service Type Selector */}
        <div className="flex flex-wrap gap-2">
          {serviceTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleServiceTypeChange(type.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedServiceType === type.value
                  ? type.color
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!userLocation ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Location Required</p>
              <p className="text-gray-500 text-sm">Please enable location services to find nearby services</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Finding Services...</p>
              <p className="text-gray-500 text-sm">Searching within {searchRadius} miles</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {services.length === 0 ? (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No Services Found</p>
                  <p className="text-gray-500 text-sm">Try expanding your search radius</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {services.map((service, index) => (
                  <div
                    key={index}
                    onClick={() => handleServiceSelect(service)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedService?.name === service.name
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${currentServiceType.color}`}>
                        {currentServiceType.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{service.name}</h4>
                        <p className="text-sm text-gray-600 truncate mb-1">{service.address}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {service.distance && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {service.distance.toFixed(1)} mi
                            </span>
                          )}
                          {service.rating && (
                            <span className="flex items-center gap-1">
                              ⭐ {service.rating}/5
                            </span>
                          )}
                          {service.phone && (
                            <span>📞 Available</span>
                          )}
                        </div>

                        {service.services && service.services.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {service.services.slice(0, 3).map((svc, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {svc}
                              </span>
                            ))}
                            {service.services.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{service.services.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with External Map Link */}
      {userLocation && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <a
            href={`https://www.google.com/maps/search/truck+repair/@${userLocation.lat},${userLocation.lng},12z`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            <Map className="w-4 h-4" />
            View Full Map
          </a>
        </div>
      )}
    </div>
  );
}