'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { TruckServiceLocator, ServiceLocation } from '../../lib/maps/simple-service-locator';
import { Loader2, MapPin } from 'lucide-react';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token from environment variables
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiYnUtYnUtbGEiLCJhIjoiY21icjZyYW16MDZ2dzJvb2x1cnNpMXVnZSJ9.tGnqUE-702-EErENDdTKPQ';

// Service type configurations
const SERVICE_CONFIGS = {
  truck_repair: {
    label: 'Truck Repair Shops',
    icon: '🔧',
    color: '#dc2626',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300'
  },
  truck_stop: {
    label: 'Truck Stops',
    icon: '⛽',
    color: '#2563eb',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300'
  },
  parts_store: {
    label: 'Parts Stores',
    icon: '🛍️',
    color: '#16a34a',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300'
  },
  towing: {
    label: 'Towing Services',
    icon: '🚛',
    color: '#ea580c',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300'
  }
};

interface ExtendedServiceLocation extends ServiceLocation {
  lat: number;
  lon: number;
  display_name?: string;
  serviceType?: string;
}

interface MapboxServiceMapProps {
  userLocation?: { lat: number; lng: number } | null;
  selectedServiceType?: keyof typeof SERVICE_CONFIGS;
  onServiceSelect?: (service: ExtendedServiceLocation) => void;
  onServiceTypeChange?: (serviceType: string) => void;
  searchRadius?: number;
  className?: string;
}

export function MapboxServiceMap({
  userLocation,
  selectedServiceType = 'truck_repair',
  onServiceSelect,
  onServiceTypeChange,
  searchRadius = 50,
  className = "h-96 w-full"
}: MapboxServiceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [services, setServices] = useState<ExtendedServiceLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ExtendedServiceLocation | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const truckServiceLocator = useMemo(() => new TruckServiceLocator(), []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const initialCenter: [number, number] = userLocation 
      ? [userLocation.lng, userLocation.lat] 
      : [-95.7129, 37.0902]; // Center of US

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: initialCenter,
      zoom: userLocation ? 12 : 4,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    // Add attribution
    map.current.addControl(new mapboxgl.AttributionControl({
      compact: true
    }));

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [userLocation]);

  // Create custom marker element
  const createMarkerElement = (service: ExtendedServiceLocation, isUserLocation = false) => {
    const el = document.createElement('div');
    
    if (isUserLocation) {
      el.className = 'user-location-marker';
      el.innerHTML = `
        <div class="relative">
          <div class="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
          <div class="absolute inset-0 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-75"></div>
        </div>
      `;
    } else {
      const config = SERVICE_CONFIGS[service.serviceType as keyof typeof SERVICE_CONFIGS] || SERVICE_CONFIGS.truck_repair;
      el.className = 'service-marker cursor-pointer transform transition-transform hover:scale-110';
      el.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 ${config.bgColor} ${config.borderColor} border-2 rounded-full shadow-lg flex items-center justify-center">
            <span class="text-lg">${config.icon}</span>
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-current ${config.textColor}"></div>
        </div>
      `;
    }
    
    return el;
  };

  // Create popup content
  const createPopupContent = (service: ExtendedServiceLocation) => {
    const config = SERVICE_CONFIGS[service.serviceType as keyof typeof SERVICE_CONFIGS] || SERVICE_CONFIGS.truck_repair;
    
    return `
      <div class="p-4 max-w-sm">
        <div class="flex items-start gap-3 mb-3">
          <div class="w-8 h-8 ${config.bgColor} ${config.borderColor} border rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-sm">${config.icon}</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 text-sm leading-tight">
              ${service.name || service.display_name || 'Service Location'}
            </h3>
            <p class="text-xs ${config.textColor} mt-1">${config.label}</p>
          </div>
        </div>
        
        ${service.address ? `
          <div class="flex items-start gap-2 mb-2">
            <svg class="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p class="text-xs text-gray-600">${service.address}</p>
          </div>
        ` : ''}
        
        ${service.distance ? `
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <p class="text-xs text-blue-600 font-medium">${service.distance.toFixed(1)} miles away</p>
          </div>
        ` : ''}
        
        <div class="flex gap-2 mt-3">
          ${service.phone ? `
            <a href="tel:${service.phone}" class="flex-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors text-center">
              📞 Call
            </a>
          ` : ''}
          
          <button onclick="getDirections(${service.lat}, ${service.lon})" class="flex-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors">
            🧭 Directions
          </button>
        </div>
        
        ${service.website ? `
          <a href="${service.website}" target="_blank" class="block mt-2 px-3 py-1.5 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition-colors text-center">
            🌐 Website
          </a>
        ` : ''}
      </div>
    `;
  };

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    const userMarker = new mapboxgl.Marker(createMarkerElement({} as ExtendedServiceLocation, true))
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 text-center">
          <div class="font-semibold text-blue-600 mb-1">📍 Your Location</div>
          <div class="text-xs text-gray-600">
            ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}
          </div>
        </div>
      `))
      .addTo(map.current);

    markersRef.current.push(userMarker);

    // Center map on user location
    map.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 12,
      duration: 1000
    });

    return () => {
      userMarker.remove();
    };
  }, [userLocation]);

  // Search for services
  const searchServices = useCallback(async () => {
    const currentLocation = userLocation || { lat: 37.0902, lng: -95.7129 };
    
    setIsLoading(true);
    setError(null);

    try {
      const foundServices = await truckServiceLocator.findNearbyServices(
        currentLocation.lat,
        currentLocation.lng,
        {
          serviceType: selectedServiceType,
          radius: searchRadius,
          maxResults: 20
        }
      );

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
  }, [userLocation, selectedServiceType, searchRadius, truckServiceLocator]);

  // Add service markers to map
  useEffect(() => {
    if (!map.current || !services.length) return;

    // Clear existing service markers (but keep user location marker)
    const serviceMarkers = markersRef.current.filter(marker => 
      !marker.getElement().classList.contains('user-location-marker')
    );
    serviceMarkers.forEach(marker => marker.remove());
    markersRef.current = markersRef.current.filter(marker => 
      marker.getElement().classList.contains('user-location-marker')
    );

    // Add service markers
    services.forEach(service => {
      const marker = new mapboxgl.Marker(createMarkerElement(service))
        .setLngLat([service.lon, service.lat])
        .setPopup(new mapboxgl.Popup({ 
          offset: 25,
          closeButton: false,
          closeOnClick: false
        }).setHTML(createPopupContent(service)))
        .addTo(map.current!);

      // Add click handler
      marker.getElement().addEventListener('click', () => {
        setSelectedService(service);
        onServiceSelect?.(service);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers if we have services
    if (services.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add user location to bounds
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      
      // Add all service locations to bounds
      services.forEach(service => {
        bounds.extend([service.lon, service.lat]);
      });

      map.current.fitBounds(bounds, { 
        padding: 50,
        maxZoom: 15,
        duration: 1000
      });
    }
  }, [services, userLocation, onServiceSelect]);

  // Search when dependencies change
  useEffect(() => {
    searchServices();
  }, [searchServices]);

  // Add global function for directions (for popup buttons)
  useEffect(() => {
    (window as Window & { getDirections?: (lat: number, lon: number) => void }).getDirections = (lat: number, lon: number) => {
      const currentLocation = userLocation || { lat: 37.0902, lng: -95.7129 };
      const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${lat},${lon}`;
      window.open(url, '_blank');
    };

    return () => {
      delete (window as Window & { getDirections?: (lat: number, lon: number) => void }).getDirections;
    };
  }, [userLocation]);

  return (
    <div className={`relative ${className} rounded-xl overflow-hidden shadow-2xl border border-gray-200`}>
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 space-y-3 min-w-[280px]">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Service Locator</h3>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Service Type
          </label>
          <select
            value={selectedServiceType}
            onChange={(e) => onServiceTypeChange?.(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {Object.entries(SERVICE_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-600">Searching...</span>
              </>
            ) : error ? (
              <span className="text-sm text-red-600">Error: {error}</span>
            ) : (
              <span className="text-sm text-gray-600">
                Found {services.length} services
              </span>
            )}
          </div>
          
          <button
            onClick={searchServices}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Selected Service Details */}
      {selectedService && (
        <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 ${SERVICE_CONFIGS[selectedService.serviceType as keyof typeof SERVICE_CONFIGS]?.bgColor || 'bg-gray-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className="text-sm">
                {SERVICE_CONFIGS[selectedService.serviceType as keyof typeof SERVICE_CONFIGS]?.icon || '📍'}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">
                {selectedService.name || selectedService.display_name}
              </h4>
              {selectedService.distance && (
                <p className="text-xs text-blue-600 font-medium">
                  {selectedService.distance.toFixed(1)} miles away
                </p>
              )}
              {selectedService.address && (
                <p className="text-xs text-gray-600 mt-1">
                  {selectedService.address}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedService(null)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
