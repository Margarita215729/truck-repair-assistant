'use client';

import { MapboxServiceMap } from './MapboxServiceMap';
import { ServiceLocation } from '../../lib/maps/enhanced-service-locator';

// Extended ServiceLocation interface for map component compatibility
interface ExtendedServiceLocation extends ServiceLocation {
  lat: number;
  lon: number;
  display_name?: string;
  serviceType?: string;
}

interface ServiceMapProps {
  userLocation?: { lat: number; lng: number } | null;
  selectedServiceType?: string;
  onServiceSelect?: (service: ExtendedServiceLocation) => void;
  onServiceTypeChange?: (serviceType: string) => void;
  searchRadius?: number; // in miles
  className?: string;
}

// Main ServiceMap component - now uses the professional Mapbox implementation
export function ServiceMap({ 
  userLocation, 
  selectedServiceType = 'truck_repair',
  onServiceSelect,
  onServiceTypeChange,
  searchRadius = 50,
  className = "h-96 w-full rounded-lg"
}: ServiceMapProps) {
  
  // Handle service selection and convert to ExtendedServiceLocation format
  const handleServiceSelect = (service: ServiceLocation) => {
    const extendedService: ExtendedServiceLocation = {
      ...service,
      lat: service.coordinates[0],
      lon: service.coordinates[1],
      serviceType: selectedServiceType
    };
    onServiceSelect?.(extendedService);
  };

  return (
    <MapboxServiceMap
      userLocation={userLocation}
      selectedServiceType={selectedServiceType as 'truck_repair' | 'truck_stop' | 'parts_store' | 'towing'}
      onServiceSelect={handleServiceSelect}
      onServiceTypeChange={onServiceTypeChange}
      searchRadius={searchRadius}
      className={className}
    />
  );
}
