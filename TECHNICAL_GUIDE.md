# Technical Implementation Guide - Truck Repair Assistant (Updated Architecture)

## Architecture Overview

This guide outlines the updated technical implementation for the Truck Repair Assistant application, designed to help truck drivers diagnose and repair their vehicles using AI-powered assistance.

### Updated Technology Stack

#### Frontend
- **Framework**: Next.js 14 with App Router (Static Export for GitHub Pages)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI or Shadcn/ui
- **State Management**: Zustand or React Context
- **Audio Recording**: Web Audio API or react-audio-voice-recorder

#### Backend & Database
- **Database**: Docker PostgreSQL container (development) / Azure Database for PostgreSQL (production)
- **Container Runtime**: Docker Desktop (local) / Azure Container Instances (cloud)
- **File Storage**: GitHub Repository static files
- **Authentication**: GitHub OAuth via GitHub Apps

#### AI & APIs
- **AI Model**: GitHub Models API (GPT-4o via GitHub's AI service)
- **Audio Processing**: Web Speech API or GitHub Models Whisper
- **Parts Data**: Simplified JSON files hosted in repository
- **Service Locations**: OpenStreetMap Nominatim API (free alternative)
- **Video Content**: Embedded YouTube videos or repository-hosted content

#### Deployment
- **Platform**: GitHub Pages (Static hosting)
- **Database**: Docker container (local) / Azure Database for PostgreSQL (production)
- **CDN**: GitHub Pages CDN
- **Environment**: GitHub repository branches (main, staging, development)

## Project Setup Instructions

### 1. Next.js with Static Export Configuration

```bash
# Initialize project
npx create-next-app@latest truck-repair-assistant --typescript --tailwind --eslint --app
cd truck-repair-assistant

# Configure for static export
```

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/truck-repair-assistant' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/truck-repair-assistant/' : '',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### 2. Updated Dependencies

```bash
# Core dependencies
npm install @octokit/rest  # GitHub API client
npm install github-models  # GitHub Models AI API
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react zustand
npm install react-hook-form @hookform/resolvers zod

# Audio and media
npm install recordrtc

# Maps (OpenStreetMap)
npm install react-leaflet leaflet
npm install -D @types/leaflet

# Utilities
npm install clsx tailwind-merge date-fns axios

# Development
npm install -D @types/recordrtc
npm install -D prettier eslint-config-prettier
npm install -D @tailwindcss/typography @tailwindcss/forms
```

### 3. Environment Variables

```env
# .env.local
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
NEXT_PUBLIC_GITHUB_MODELS_ENDPOINT=https://models.inference.ai.azure.com
NEXT_PUBLIC_BASE_PATH=/truck-repair-assistant
NEXT_PUBLIC_NOMINATIM_ENDPOINT=https://nominatim.openstreetmap.org
```

## GitHub Models Integration

### AI Service Setup

```typescript
// lib/ai/github-models.ts
interface GitHubModelsConfig {
  endpoint: string;
  token: string;
  model: string;
}

class GitHubModelsService {
  private config: GitHubModelsConfig;

  constructor() {
    this.config = {
      endpoint: process.env.NEXT_PUBLIC_GITHUB_MODELS_ENDPOINT!,
      token: process.env.NEXT_PUBLIC_GITHUB_TOKEN!,
      model: 'gpt-4o'
    };
  }

  async diagnoseTruckIssue(
    symptoms: string[],
    truckModel: TruckModel,
    context?: DiagnosisContext
  ): Promise<Diagnosis> {
    const systemPrompt = `You are an expert truck mechanic with 20+ years of experience. 
    Analyze the provided symptoms and truck model to provide accurate diagnosis and repair guidance.`;

    const userPrompt = `
    Truck: ${truckModel.make} ${truckModel.model} ${truckModel.year}
    Engine: ${truckModel.engine}
    Symptoms: ${symptoms.join(', ')}
    ${context?.audioAnalysis ? `Audio Analysis: ${JSON.stringify(context.audioAnalysis)}` : ''}
    
    Please provide:
    1. Most likely diagnosis
    2. Required tools
    3. Step-by-step repair instructions
    4. Safety warnings
    5. Estimated time and difficulty
    `;

    try {
      const response = await fetch(`${this.config.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });

      const result = await response.json();
      return this.parseDiagnosisResponse(result.choices[0].message.content);
    } catch (error) {
      console.error('GitHub Models API error:', error);
      throw new Error('Failed to get AI diagnosis');
    }
  }

  private parseDiagnosisResponse(content: string): Diagnosis {
    // Parse structured response from AI
    // Implementation depends on expected format
    return {
      issue: 'Extracted issue',
      severity: 'medium',
      estimatedTime: 120,
      tools: [],
      steps: [],
      safety: []
    };
  }
}

export const githubModels = new GitHubModelsService();
```

### Audio Analysis with GitHub Models

```typescript
// lib/ai/audio-analysis.ts
export async function analyzeEngineSound(audioBlob: Blob): Promise<AudioAnalysis> {
  const base64Audio = await blobToBase64(audioBlob);
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_GITHUB_MODELS_ENDPOINT}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'whisper-1',
      audio: base64Audio,
      prompt: 'Analyze this truck engine sound for mechanical issues, unusual noises, or performance problems.'
    }),
  });

  const result = await response.json();
  return parseAudioAnalysis(result.text);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:audio/...;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

## Database Setup with Docker

### Docker Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: truck_repair_db
    environment:
      POSTGRES_DB: truck_repair
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

### Database Schema

```sql
-- init-scripts/001_schema.sql
CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  engine_type VARCHAR(100),
  configuration JSONB,
  common_issues TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID REFERENCES trucks(id),
  title VARCHAR(200) NOT NULL,
  symptoms TEXT[],
  solution JSONB,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  estimated_time INTEGER, -- minutes
  required_tools TEXT[],
  required_parts JSONB,
  video_tutorials TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  coordinates POINT NOT NULL,
  phone VARCHAR(20),
  services_offered TEXT[],
  rating DECIMAL(2,1),
  business_hours JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_trucks_make_model ON trucks(make, model);
CREATE INDEX idx_repairs_truck_id ON repairs(truck_id);
CREATE INDEX idx_services_location ON services USING GIST(coordinates);
```

### Simplified Data Management

```typescript
// lib/data/trucks.ts - Static data for GitHub Pages
export const TRUCK_MODELS: TruckModel[] = [
  {
    id: 'peterbilt-379',
    make: 'Peterbilt',
    model: '379',
    years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007],
    engines: ['Caterpillar C15', 'Cummins ISX', 'Detroit Diesel Series 60'],
    commonIssues: [
      'DPF regeneration problems',
      'Turbocharger issues',
      'Air brake system leaks'
    ]
  },
  {
    id: 'kenworth-t680',
    make: 'Kenworth',
    model: 'T680',
    years: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    engines: ['PACCAR MX-13', 'Cummins ISX15', 'Cummins X15'],
    commonIssues: [
      'DEF system problems',
      'Transmission shifting issues',
      'Electrical problems'
    ]
  }
  // ... more truck models
];

// lib/data/repairs.ts
export const REPAIR_GUIDES: RepairGuide[] = [
  {
    id: 'dpf-regeneration',
    title: 'DPF Regeneration Process',
    applicableModels: ['peterbilt-379', 'kenworth-t680'],
    symptoms: ['Black smoke', 'Reduced power', 'DPF warning light'],
    tools: ['OBD scanner', 'Safety glasses', 'Gloves'],
    estimatedTime: 60,
    difficulty: 2,
    steps: [
      {
        step: 1,
        title: 'Connect OBD Scanner',
        description: 'Connect scanner to diagnostic port',
        image: '/images/repairs/dpf-step1.jpg',
        warnings: ['Engine must be warm']
      }
      // ... more steps
    ]
  }
  // ... more repair guides
];
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

## GitHub Pages Deployment

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build
        env:
          NEXT_PUBLIC_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NEXT_PUBLIC_GITHUB_MODELS_ENDPOINT: ${{ secrets.GITHUB_MODELS_ENDPOINT }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next build && next export",
    "deploy": "npm run export && gh-pages -d out"
  }
}
```

## Simplified API Architecture

Since GitHub Pages is static hosting, we'll use client-side APIs and local storage:

### Client-Side Data Management

```typescript
// lib/storage/local-storage.ts
export class LocalStorageService {
  private prefix = 'truck-repair-';

  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  // Specific methods for our app
  saveSelectedTruck(truck: TruckModel): void {
    this.setItem('selected-truck', truck);
  }

  getSelectedTruck(): TruckModel | null {
    return this.getItem<TruckModel>('selected-truck');
  }

  saveDiagnosisHistory(diagnosis: Diagnosis): void {
    const history = this.getDiagnosisHistory();
    history.unshift(diagnosis);
    // Keep only last 50 diagnoses
    this.setItem('diagnosis-history', history.slice(0, 50));
  }

  getDiagnosisHistory(): Diagnosis[] {
    return this.getItem<Diagnosis[]>('diagnosis-history') || [];
  }
}

export const localStorageService = new LocalStorageService();
```

### Offline-First Approach

```typescript
// lib/offline/sync.ts
export class OfflineSync {
  private queue: Array<{ action: string; data: any; timestamp: number }> = [];

  queueAction(action: string, data: any): void {
    this.queue.push({
      action,
      data,
      timestamp: Date.now()
    });
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncQueue();
    }
  }

  async syncQueue(): Promise<void> {
    if (!navigator.onLine) return;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      try {
        await this.processAction(item);
        this.queue.shift(); // Remove processed item
      } catch (error) {
        console.error('Failed to sync action:', error);
        break; // Stop processing if something fails
      }
    }
  }

  private async processAction(item: any): Promise<void> {
    switch (item.action) {
      case 'save-diagnosis':
        // Process diagnosis save
        break;
      case 'log-usage':
        // Process usage logging
        break;
      default:
        console.warn('Unknown action:', item.action);
    }
  }
}

export const offlineSync = new OfflineSync();

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineSync.syncQueue();
  });
}
```

## Testing Strategy

### Unit Tests with Jest and React Testing Library

```typescript
// __tests__/components/TruckSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TruckSelector } from '@/components/TruckSelector';
import { TRUCK_MODELS } from '@/lib/data/trucks';

describe('TruckSelector', () => {
  it('renders truck options', () => {
    render(<TruckSelector trucks={TRUCK_MODELS} onSelect={jest.fn()} />);
    
    expect(screen.getByText('Peterbilt 379')).toBeInTheDocument();
    expect(screen.getByText('Kenworth T680')).toBeInTheDocument();
  });

  it('calls onSelect when truck is selected', () => {
    const onSelect = jest.fn();
    render(<TruckSelector trucks={TRUCK_MODELS} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByText('Peterbilt 379'));
    expect(onSelect).toHaveBeenCalledWith(TRUCK_MODELS[0]);
  });
});

// __tests__/lib/ai/github-models.test.ts
import { githubModels } from '@/lib/ai/github-models';

// Mock fetch
global.fetch = jest.fn();

describe('GitHubModelsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should diagnose truck issue', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Mock diagnosis response' } }]
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    const result = await githubModels.diagnoseTruckIssue(
      ['Engine noise', 'Reduced power'],
      { id: '1', make: 'Peterbilt', model: '379', year: 2020, engine: 'Caterpillar C15' }
    );

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/completions'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer'),
          'Content-Type': 'application/json'
        })
      })
    );
  });
});
```

## Performance Optimization

### Image Optimization for GitHub Pages

```typescript
// next.config.js - Updated for static export
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/truck-repair-assistant' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/truck-repair-assistant/' : '',
  images: {
    unoptimized: true // Required for static export
  },
  // Optimize build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      bundlePagesRouterDependencies: true
    }
  })
}

module.exports = nextConfig
```

### Lazy Loading and Code Splitting

```typescript
// components/LazyComponents.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
export const ServiceMap = dynamic(() => import('./maps/ServiceMap'), {
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false // Disable SSR for map component
});

export const AudioRecorder = dynamic(() => import('./audio/AudioRecorder'), {
  loading: () => <div className="h-20 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false
});

export const AIChat = dynamic(() => import('./ai/AIChat'), {
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
});
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

This updated technical guide reflects the new architecture using GitHub Pages, GitHub Models, and simplified API services while maintaining the core functionality of the truck repair assistant application.
