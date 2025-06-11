#!/usr/bin/env node

/**
 * Import Truck Data Script
 * 
 * Imports truck data from JSON files into MongoDB Atlas
 * Run this script to populate the database with production truck data
 * 
 * Usage: node scripts/import-truck-data.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Environment variables
const MONGODB_URI = 'mongodb+srv://Truck_repair_assistant:Kryak333@truck-repair-assistant.o4e42ym.mongodb.net/truck-repair-assistant?retryWrites=true&w=majority';
const DB_NAME = process.env.MONGODB_DB_NAME || 'truck-repair-assistant';

async function importTruckData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await client.connect();
    
    const db = client.db(DB_NAME);
    const trucksCollection = db.collection('trucks');
    
    // Clear existing data
    console.log('🗑️ Clearing existing truck data...');
    await trucksCollection.deleteMany({});
    
    // Load US truck data
    console.log('📂 Loading US truck dataset...');
    const usDataPath = path.join(__dirname, '../Static data for production/truck_dataset.json');
    const usData = JSON.parse(fs.readFileSync(usDataPath, 'utf8'));
    
    // Load non-US truck data
    console.log('📂 Loading non-US truck dataset...');
    const nonUsDataPath = path.join(__dirname, '../Static data for production/truck_dataset_non_us.json');
    const nonUsData = JSON.parse(fs.readFileSync(nonUsDataPath, 'utf8'));
    
    // Combine datasets
    const allTrucks = [...usData.trucks, ...nonUsData.trucks];
    
    // Transform data for our application
    const transformedTrucks = allTrucks.map(truck => ({
      uid: truck.uid,
      make: truck.make,
      model: truck.model,
      year: truck.model_year,
      fuel: truck.fuel,
      payloadLb: truck.payload_lb,
      market: truck.market,
      notes: truck.notes,
      schemaVersion: truck.schema_version,
      // Add common issues based on make/model patterns
      commonIssues: generateCommonIssues(truck.make, truck.model, truck.model_year),
      // Add engine data (basic mapping)
      engines: generateEngineData(truck.make, truck.model, truck.model_year),
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Insert data
    console.log(`💾 Importing ${transformedTrucks.length} truck records...`);
    const result = await trucksCollection.insertMany(transformedTrucks);
    
    console.log(`✅ Successfully imported ${result.insertedCount} truck records`);
    
    // Create indexes for better performance
    console.log('🔍 Creating database indexes...');
    await trucksCollection.createIndex({ make: 1, model: 1, year: 1 });
    await trucksCollection.createIndex({ uid: 1 }, { unique: true });
    await trucksCollection.createIndex({ market: 1 });
    
    console.log('✅ Database indexes created');
    
    // Display summary
    const summary = await trucksCollection.aggregate([
      {
        $group: {
          _id: '$make',
          count: { $sum: 1 },
          models: { $addToSet: '$model' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n📊 Import Summary:');
    summary.forEach(s => {
      console.log(`  ${s._id}: ${s.count} trucks, ${s.models.length} models`);
    });
    
  } catch (error) {
    console.error('❌ Error importing truck data:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🎉 Data import completed successfully!');
  }
}

/**
 * Generate common issues based on truck make/model/year
 */
function generateCommonIssues(make, model, year) {
  const issues = [];
  
  // Age-based issues
  const age = new Date().getFullYear() - year;
  if (age > 10) {
    issues.push('Electrical system aging', 'Transmission wear', 'Engine seal deterioration');
  } else if (age > 5) {
    issues.push('DPF cleaning required', 'Brake pad replacement');
  }
  
  // Make-specific issues
  if (make === 'Freightliner') {
    issues.push('Detroit engine oil pressure issues', 'Air brake system maintenance');
  } else if (make === 'Peterbilt') {
    issues.push('PACCAR engine maintenance', 'Electrical harness inspection');
  } else if (make === 'Kenworth') {
    issues.push('PACCAR engine diagnostics', 'Suspension system checks');
  } else if (make === 'Volvo') {
    issues.push('D13 engine EGR issues', 'Transmission software updates');
  } else if (make === 'Mack') {
    issues.push('MP8 engine maintenance', 'Differential service');
  }
  
  // Model-specific issues
  if (model.includes('Cascadia')) {
    issues.push('Detroit Assurance system calibration');
  } else if (model.includes('579')) {
    issues.push('PACCAR MX-13 engine issues');
  }
  
  return issues.slice(0, 5); // Limit to 5 issues
}

/**
 * Generate engine data based on truck make/model/year
 */
function generateEngineData(make, model, year) {
  const engines = [];
  
  // Freightliner engines
  if (make === 'Freightliner') {
    engines.push('Detroit DD15', 'Detroit DD13');
    if (year >= 2017) engines.push('Detroit DD16');
  }
  
  // Peterbilt engines
  else if (make === 'Peterbilt') {
    engines.push('PACCAR MX-13', 'PACCAR MX-11');
    if (year >= 2018) engines.push('Cummins X15');
  }
  
  // Kenworth engines
  else if (make === 'Kenworth') {
    engines.push('PACCAR MX-13', 'Cummins ISX15');
    if (year >= 2017) engines.push('PACCAR MX-11');
  }
  
  // Volvo engines
  else if (make === 'Volvo') {
    engines.push('Volvo D13', 'Volvo D11');
    if (year >= 2021) engines.push('Volvo D13TC');
  }
  
  // Mack engines
  else if (make === 'Mack') {
    engines.push('Mack MP8', 'Mack MP7');
    if (year >= 2019) engines.push('Mack MP8TC');
  }
  
  // Mercedes-Benz engines (non-US)
  else if (make === 'Mercedes-Benz') {
    engines.push('OM471', 'OM470', 'OM936');
  }
  
  // Scania engines (non-US)
  else if (make === 'Scania') {
    engines.push('DC13', 'DC16', 'DC09');
  }
  
  // Default engines for unknown makes
  if (engines.length === 0) {
    engines.push('Diesel Engine', 'Unknown Engine');
  }
  
  return engines;
}

// Run the import
if (require.main === module) {
  importTruckData().catch(console.error);
}

module.exports = { importTruckData };
