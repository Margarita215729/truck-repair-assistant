'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NominatimService, ServiceLocation } from '../../lib/maps/nominatim';
import 'leaflet/dist/leaflet.css';

// Extended ServiceLocation interface for map component
interface ExtendedServiceLocation extends ServiceLocation {
  lat: number;
  lon: number;
  display_name?: string;
  serviceType?: string;
}

// Fix for default markers in Leaflet with Next.js
// Next.js/Leaflet compatibility workaround
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different service types
const createCustomIcon = (color: string) => new L.Icon({
  iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const serviceIcons = {
  truck_repair: createCustomIcon('red'),
  truck_stop: createCustomIcon('blue'),
  parts_store: createCustomIcon('green'),
  towing: createCustomIcon('orange'),
  default: createCustomIcon('grey')
};

interface ServiceMapProps {
  userLocation?: { lat: number; lng: number } | null;
  selectedServiceType?: string;
  onServiceSelect?: (service: ExtendedServiceLocation) => void;
  onServiceTypeChange?: (serviceType: string) => void;
  searchRadius?: number; // in miles
  className?: string;
}

// Component to update map view when user location changes
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

export function ServiceMap({ 
  userLocation, 
  selectedServiceType = 'truck_repair',
  onServiceSelect,
  onServiceTypeChange,
  searchRadius = 50,
  className = "h-96 w-full rounded-lg"
}: ServiceMapProps) {
  const [services, setServices] = useState<ExtendedServiceLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // Center of US
  const [mapZoom, setMapZoom] = useState(4);

  // Memoize nominatimService to avoid useEffect dependency warning
  const nominatimService = useMemo(() => new NominatimService(), []);


  // Get user location if not provided
  useEffect(() => {
    if (!userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newCenter: [number, number] = [position.coords.latitude, position.coords.longitude];
            setMapCenter(newCenter);
            setMapZoom(12);
          },
          (error) => {
            console.error('Error getting user location:', error);
            // Fallback to IP-based location detection could be added here
          }
        );
      }
    } else {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(12);
    }
  }, [userLocation]);

  // Search for services when location or service type changes
  useEffect(() => {
    const searchForServices = async () => {
      const currentLocation = userLocation || 
        (mapCenter[0] !== 39.8283 ? { lat: mapCenter[0], lng: mapCenter[1] } : null);
      
      if (!currentLocation) return;

      setIsLoading(true);
      setError(null);

      try {
        const foundServices = await nominatimService.findNearbyServices(
          currentLocation.lat,
          currentLocation.lng,
          {
            serviceType: selectedServiceType as 'truck_repair' | 'truck_stop' | 'parts_store' | 'towing',
            radius: typeof searchRadius === 'string' ? parseInt(searchRadius) : searchRadius,
            maxResults: 20
          }
        );
        
        // Преобразуем ServiceLocation в ExtendedServiceLocation
        const extendedServices: ExtendedServiceLocation[] = foundServices.map((service: ServiceLocation) => ({
          ...service,
          lat: service.coordinates[0],
          lon: service.coordinates[1],
          serviceType: selectedServiceType
        }));
        
        setServices(extendedServices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to find services');
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchForServices();
  }, [userLocation, selectedServiceType, searchRadius, mapCenter, nominatimService]);

  const getServiceIcon = (service: ExtendedServiceLocation) => {
    const serviceType = service.serviceType || 'default';
    return serviceIcons[serviceType as keyof typeof serviceIcons] || serviceIcons.default;
  };

  const handleServiceClick = (service: ExtendedServiceLocation) => {
    onServiceSelect?.(service);
  };

  const getDirectionsUrl = (service: ExtendedServiceLocation) => {
    const currentLocation = userLocation || { lat: mapCenter[0], lng: mapCenter[1] };
    return `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${service.lat},${service.lon}`;
  };

  if (typeof window === 'undefined') {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-[1000] bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-blue-900 rounded-xl shadow-2xl backdrop-blur-md p-4 space-y-3 border border-blue-200 dark:border-blue-800 animate-fade-in">
        <div className="text-sm font-medium text-gray-700">Service Type:</div>
        <select
          value={selectedServiceType}
          onChange={(e) => onServiceTypeChange?.(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1"
        >
          <option value="truck_repair">🔧 Repair Shops</option>
          <option value="truck_stop">⛽ Truck Stops</option>
          <option value="parts_store">🛍️ Parts Stores</option>
          <option value="towing">🚛 Towing Services</option>
        </select>
        
        {isLoading && (
          <div className="text-xs text-blue-600 flex items-center">
            <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Searching...
          </div>
        )}
        
        {error && (
          <div className="text-xs text-red-600">
            Error: {error}
          </div>
        )}
        
        <div className="text-xs text-gray-600">
          Found: {services.length} services
        </div>
      </div>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className={className + ' shadow-2xl border-2 border-blue-200 dark:border-blue-800 rounded-2xl transition-all duration-500'}
        style={{ height: '100%', width: '100%' }}
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-blue-600">📍 Your Location</div>
                <div className="text-sm text-gray-600">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Service markers */}
        {services.map((service, index) => (
          <Marker
            key={index}
            position={[service.lat, service.lon]}
            icon={getServiceIcon(service)}
            eventHandlers={{
              click: () => handleServiceClick(service)
            }}
          >
            <Popup>
              <div className="min-w-[200px] max-w-[300px]">
                <div className="font-semibold text-gray-800 mb-2">
                  {service.name || service.display_name}
                </div>
                
                {service.address && (
                  <div className="text-sm text-gray-600 mb-2">
                    📍 {service.address}
                  </div>
                )}
                
                {service.distance && (
                  <div className="text-sm text-blue-600 mb-2">
                    📏 {service.distance.toFixed(1)} miles away
                  </div>
                )}
                
                {service.phone && (
                  <div className="text-sm text-gray-600 mb-2">
                    📞 <a href={`tel:${service.phone}`} className="text-blue-600 hover:underline">
                      {service.phone}
                    </a>
                  </div>
                )}
                
                {service.website && (
                  <div className="text-sm text-gray-600 mb-2">
                    🌐 <a 
                      href={service.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
                
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleServiceClick(service)}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                  >
                    Select
                  </button>
                  
                  <a
                    href={getDirectionsUrl(service)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                  >
                    Directions
                  </a>
                  
                  {service.phone && (
                    <a
                      href={`tel:${service.phone}`}
                      className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                    >
                      Call
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
