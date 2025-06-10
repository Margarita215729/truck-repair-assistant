# MongoDB Atlas Integration Guide - Truck Repair Assistant

## Overview
This guide covers the complete migration from PostgreSQL to MongoDB Atlas for the Truck Repair Assistant application.

## MongoDB Atlas Setup

### 1. Database Structure

```javascript
// Database: truck-repair-assistant
// Collections:

// trucks collection
{
  _id: ObjectId("..."),
  make: "Peterbilt",
  model: "579",
  year: 2023,
  engine_type: "Cummins X15",
  configuration: {
    transmission: "Eaton Fuller 18-speed",
    axles: "Tandem",
    wheelbase: "244\"",
    gvwr: "80000"
  },
  common_issues: [
    "DPF regeneration",
    "EGR valve issues",
    "Turbo problems"
  ],
  created_at: ISODate("2025-06-10T00:00:00Z"),
  updated_at: ISODate("2025-06-10T00:00:00Z")
}

// repairs collection
{
  _id: ObjectId("..."),
  truck_id: ObjectId("..."), // Reference to trucks collection
  title: "DPF Filter Regeneration Procedure",
  symptoms: [
    "Warning light on dashboard",
    "Reduced engine power",
    "Excessive exhaust smoke"
  ],
  solution: {
    steps: [
      "Check DPF status in diagnostics",
      "Initiate manual regeneration",
      "Monitor exhaust temperature"
    ],
    estimated_time: 45,
    difficulty: 3
  },
  difficulty_level: 3,
  estimated_time: 45,
  required_tools: [
    "OBD-II scanner",
    "Temperature gun",
    "Safety equipment"
  ],
  required_parts: {
    parts: [
      {
        name: "DPF Filter",
        part_number: "A029F938",
        price: 1250.00,
        vendor: "Cummins"
      }
    ]
  },
  video_tutorials: [
    "https://youtube.com/watch?v=example1",
    "https://youtube.com/watch?v=example2"
  ],
  created_at: ISODate("2025-06-10T00:00:00Z"),
  updated_at: ISODate("2025-06-10T00:00:00Z")
}

// services collection
{
  _id: ObjectId("..."),
  name: "Mike's Truck Repair",
  address: "1234 Highway 80, Dallas, TX 75201",
  coordinates: {
    lat: 32.7767,
    lng: -96.7970
  },
  phone: "+1-214-555-0123",
  services_offered: [
    "Engine repair",
    "Transmission service",
    "Brake repair",
    "Electrical diagnostics"
  ],
  rating: 4.5,
  business_hours: {
    monday: "8:00-18:00",
    tuesday: "8:00-18:00",
    wednesday: "8:00-18:00",
    thursday: "8:00-18:00",
    friday: "8:00-18:00",
    saturday: "9:00-15:00",
    sunday: "closed"
  },
  created_at: ISODate("2025-06-10T00:00:00Z"),
  updated_at: ISODate("2025-06-10T00:00:00Z")
}

// user_sessions collection (for chat history)
{
  _id: ObjectId("..."),
  session_id: "sess_1234567890",
  user_context: {
    truck: {
      make: "Kenworth",
      model: "T680",
      year: 2022
    },
    location: {
      lat: 39.7392,
      lng: -104.9903
    }
  },
  chat_history: [
    {
      role: "user",
      content: "My truck is making a weird noise",
      timestamp: ISODate("2025-06-10T10:00:00Z")
    },
    {
      role: "assistant", 
      content: "Can you describe the noise? Is it coming from the engine bay?",
      timestamp: ISODate("2025-06-10T10:00:15Z")
    }
  ],
  created_at: ISODate("2025-06-10T10:00:00Z"),
  expires_at: ISODate("2025-06-17T10:00:00Z") // 7 days TTL
}
```

### 2. Indexes for Performance

```javascript
// trucks collection indexes
db.trucks.createIndex({ "make": 1, "model": 1 })
db.trucks.createIndex({ "year": 1 })
db.trucks.createIndex({ "engine_type": 1 })

// repairs collection indexes
db.repairs.createIndex({ "truck_id": 1 })
db.repairs.createIndex({ "symptoms": "text", "title": "text" })
db.repairs.createIndex({ "difficulty_level": 1 })

// services collection indexes
db.services.createIndex({ "coordinates": "2dsphere" })
db.services.createIndex({ "services_offered": 1 })
db.services.createIndex({ "rating": -1 })

// user_sessions collection indexes
db.user_sessions.createIndex({ "session_id": 1 }, { unique: true })
db.user_sessions.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 })
```

## Connection Configuration

### Environment Variables
```bash
# MongoDB Atlas connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/truck-repair-assistant?retryWrites=true&w=majority

# Optional: specific database name
MONGODB_DB_NAME=truck-repair-assistant
```

### Connection Service
```typescript
// lib/db/mongodb.ts
import { MongoClient, Db, Collection } from 'mongodb';

class MongoDBService {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<Db> {
    if (this.db) return this.db;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db(process.env.MONGODB_DB_NAME || 'truck-repair-assistant');
    
    return this.db;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  async getCollection<T>(name: string): Promise<Collection<T>> {
    const db = await this.connect();
    return db.collection<T>(name);
  }
}

export const mongodb = new MongoDBService();
```

## Migration Steps

### 1. Data Migration from PostgreSQL
```typescript
// scripts/migrate-to-mongodb.ts
import { mongodb } from '../lib/db/mongodb';

async function migrateData() {
  // Connect to MongoDB
  const db = await mongodb.connect();
  
  // Example: migrate truck data
  const trucks = [
    {
      make: "Peterbilt",
      model: "579",
      year: 2023,
      engine_type: "Cummins X15",
      configuration: {},
      common_issues: [],
      created_at: new Date(),
      updated_at: new Date()
    }
    // ... more truck data
  ];
  
  await db.collection('trucks').insertMany(trucks);
  console.log(`Migrated ${trucks.length} trucks`);
}
```

### 2. Update API Routes
```typescript
// app/api/trucks/route.ts
import { mongodb } from '@/lib/db/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const trucks = await mongodb.getCollection('trucks');
    const result = await trucks.find({}).toArray();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trucks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const trucks = await mongodb.getCollection('trucks');
    
    const result = await trucks.insertOne({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    return NextResponse.json({ id: result.insertedId });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create truck' },
      { status: 500 }
    );
  }
}
```

## Testing

### Unit Tests
```typescript
// __tests__/mongodb.test.ts
import { mongodb } from '../lib/db/mongodb';

describe('MongoDB Integration', () => {
  beforeAll(async () => {
    await mongodb.connect();
  });

  afterAll(async () => {
    await mongodb.disconnect();
  });

  test('should connect to database', async () => {
    const db = await mongodb.connect();
    expect(db).toBeDefined();
  });

  test('should insert and retrieve truck data', async () => {
    const trucks = await mongodb.getCollection('trucks');
    
    const testTruck = {
      make: "Test",
      model: "Model",
      year: 2023,
      engine_type: "Test Engine",
      configuration: {},
      common_issues: [],
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await trucks.insertOne(testTruck);
    expect(result.insertedId).toBeDefined();
    
    const retrieved = await trucks.findOne({ _id: result.insertedId });
    expect(retrieved?.make).toBe("Test");
    
    // Cleanup
    await trucks.deleteOne({ _id: result.insertedId });
  });
});
```

## Performance Considerations

### Connection Pooling
```typescript
// lib/db/mongodb.ts (updated)
import { MongoClient, MongoClientOptions } from 'mongodb';

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  w: 'majority'
};

// Use connection pooling
export const mongoClient = new MongoClient(process.env.MONGODB_URI!, options);
```

### Aggregation Pipelines
```typescript
// Complex queries using aggregation
async function getTruckWithRepairs(truckId: string) {
  const trucks = await mongodb.getCollection('trucks');
  
  const result = await trucks.aggregate([
    { $match: { _id: new ObjectId(truckId) } },
    {
      $lookup: {
        from: 'repairs',
        localField: '_id',
        foreignField: 'truck_id',
        as: 'repairs'
      }
    },
    {
      $project: {
        make: 1,
        model: 1,
        year: 1,
        engine_type: 1,
        repairCount: { $size: '$repairs' },
        recentRepairs: { $slice: ['$repairs', -5] }
      }
    }
  ]).toArray();
  
  return result[0];
}
```

## Security

### Access Control
```bash
# MongoDB Atlas Security Settings
# 1. IP Whitelist: Add Vercel IP ranges
# 2. Database User: Create read/write user
# 3. Connection String: Use SRV format with SSL

# Environment variable format:
MONGODB_URI=mongodb+srv://truck-app:secure-password@cluster.abcde.mongodb.net/truck-repair-assistant?retryWrites=true&w=majority&ssl=true
```

### Data Validation
```typescript
// lib/db/schemas.ts
import { z } from 'zod';

export const truckSchema = z.object({
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  year: z.number().min(1980).max(new Date().getFullYear() + 1),
  engine_type: z.string().max(100),
  configuration: z.object({}).optional(),
  common_issues: z.array(z.string()).optional()
});

export const repairSchema = z.object({
  truck_id: z.string(),
  title: z.string().min(1).max(200),
  symptoms: z.array(z.string()).min(1),
  solution: z.object({
    steps: z.array(z.string()),
    estimated_time: z.number().positive(),
    difficulty: z.number().min(1).max(5)
  }),
  required_tools: z.array(z.string()).optional(),
  required_parts: z.object({}).optional()
});
```
