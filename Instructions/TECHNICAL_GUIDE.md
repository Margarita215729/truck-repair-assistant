# Technical Implementation Guide - Truck Repair Assistant (Updated Architecture)

## Architecture Overview

This guide outlines the updated technical implementation for the Truck Repair Assistant application, designed to help truck drivers diagnose and repair their vehicles using AI-powered assistance.

### Updated Technology Stack

#### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (shadcn/ui)
- **State Management**: Zustand
- **Audio Recording**: Web Audio API

#### Backend & Database
- **Database**: MongoDB Atlas (production)
- **File Storage**: Static JSON files in repository
- **Authentication**: Future feature

#### AI & APIs
- **AI Model**: Azure AI Foundry Agent
- **Audio Processing**: Web Audio API + Whisper (Azure)
- **Parts Data**: Static JSON files hosted in repository
- **Service Locations**: OpenStreetMap Nominatim API
- **Video Content**: Embedded YouTube videos

#### Deployment
- **Platform**: Vercel
- **Database**: MongoDB Atlas


### Database Schema

```javascript
// MongoDB Collections Schema for Truck Repair Assistant

// trucks collection
const truckSchema = {
  _id: ObjectId,
  make: String, // "Peterbilt", "Kenworth", etc.
  model: String, // "579", "T680", etc.
  year: Number,
  engine_type: String, // "Cummins X15", "PACCAR MX-13", etc.
  configuration: Object, // JSON object with truck specifications
  common_issues: [String], // Array of common problems
  created_at: Date,
  updated_at: Date
};

// repairs collection
const repairSchema = {
  _id: ObjectId,
  truck_id: ObjectId, // Reference to trucks collection
  title: String,
  symptoms: [String], // Array of symptoms
  solution: Object, // JSON object with repair instructions
  difficulty_level: Number, // 1-5 scale
  estimated_time: Number, // minutes
  required_tools: [String],
  required_parts: Object, // JSON with parts info
  video_tutorials: [String], // YouTube URLs
  created_at: Date,
  updated_at: Date
};

// services collection
const serviceSchema = {
  _id: ObjectId,
  name: String,
  address: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  phone: String,
  services_offered: [String],
  rating: Number, // 0-5 scale
  business_hours: Object, // JSON with hours
  created_at: Date,
  updated_at: Date
};

// user_sessions collection (for storing chat history)
const sessionSchema = {
  _id: ObjectId,
  session_id: String,
  user_context: Object, // Truck info, location, etc.
  chat_history: [Object], // Array of messages
  created_at: Date,
  expires_at: Date
};
```

## OpenStreetMap Integration

### Service Locator with Nominatim

```typescript
// lib/maps/nominatim.ts
interface ServiceLocation {
  name: string;
  address: string;
  coordinates: [number, number];
  distance?: number;
}

export class NominatimService {
  private baseUrl = 'https://nominatim.openstreetmap.org';

  async findNearbyServices(
    lat: number, 
    lng: number, 
    radius: number = 50
  ): Promise<ServiceLocation[]> {
    const query = `truck repair service`;
    const bbox = this.calculateBoundingBox(lat, lng, radius);
    
    try {
      const response = await fetch(
        `${this.baseUrl}/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `bounded=1&` +
        `viewbox=${bbox.join(',')}&` +
        `limit=20&` +
        `addressdetails=1`
      );

      const results = await response.json();
      return results.map((result: any) => ({
        name: result.display_name.split(',')[0],
        address: result.display_name,
        coordinates: [parseFloat(result.lat), parseFloat(result.lon)] as [number, number],
        distance: this.calculateDistance(lat, lng, parseFloat(result.lat), parseFloat(result.lon))
      }));
    } catch (error) {
      console.error('Nominatim API error:', error);
      return [];
    }
  }

  private calculateBoundingBox(lat: number, lng: number, radiusMiles: number): number[] {
    const radiusDegrees = radiusMiles / 69; // Approximate miles per degree
    return [
      lng - radiusDegrees, // west
      lat - radiusDegrees, // south
      lng + radiusDegrees, // east
      lat + radiusDegrees  // north
    ];
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const nominatimService = new NominatimService();
```

### Leaflet Map Component

```typescript
// components/maps/ServiceMap.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ServiceMapProps {
  userLocation: [number, number];
  services: ServiceLocation[];
  onServiceSelect?: (service: ServiceLocation) => void;
}

// Fix for default markers in react-leaflet
const createIcon = (color: string) => new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = createIcon('red');
const serviceIcon = createIcon('blue');

export function ServiceMap({ userLocation, services, onServiceSelect }: ServiceMapProps) {
  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <MapContainer
        center={userLocation}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User location marker */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>Your Location</Popup>
        </Marker>
        
        {/* Service location markers */}
        {services.map((service, index) => (
          <Marker
            key={index}
            position={service.coordinates}
            icon={serviceIcon}
            eventHandlers={{
              click: () => onServiceSelect?.(service)
            }}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.address}</p>
                {service.distance && (
                  <p className="text-sm text-blue-600">{service.distance.toFixed(1)} miles away</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

## Vercel Deployment

### Environment Variables Configuration

```bash
# Azure AI Foundry (Required)
AZURE_PROJECTS_ENDPOINT=https://your-foundry-project.westus.models.ai
AZURE_AGENT_ID=your-agent-id
AZURE_THREAD_ID=your-thread-id

# Azure OpenAI (Fallback)
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-11-20
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# MongoDB Atlas (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/truck-repair-assistant?retryWrites=true&w=majority

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Vercel Configuration

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```



## Security Considerations

### API Key Management

```typescript
// lib/security/api-keys.ts
export class APIKeyManager {
  private static instance: APIKeyManager;
  private keys: Map<string, string> = new Map();

  static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager();
    }
    return APIKeyManager.instance;
  }

  setKey(service: string, key: string): void {
    // Only store in memory, never in localStorage for sensitive keys
    this.keys.set(service, key);
  }

  getKey(service: string): string | undefined {
    return this.keys.get(service);
  }

  // For less sensitive keys that need persistence
  setPublicKey(service: string, key: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`public_key_${service}`, key);
    }
  }

  getPublicKey(service: string): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`public_key_${service}`);
    }
    return null;
  }
}
```

### Input Validation

```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const truckModelSchema = z.object({
  id: z.string().min(1),
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  year: z.number().min(1980).max(new Date().getFullYear() + 1),
  engine: z.string().min(1).max(100)
});

export const symptomsSchema = z.object({
  symptoms: z.array(z.string().min(1).max(200)).min(1).max(10),
  urgency: z.enum(['low', 'medium', 'high']),
  additionalNotes: z.string().max(500).optional()
});

export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }
  return result.data;
};
```

---

