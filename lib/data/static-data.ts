/**
 * Static Data for Production Deployment
 * Pre-loaded data for service locations and repair guides
 */

import type { ServiceLocation, RepairGuide } from '../db/local-storage';

// Service Locations Data
export const serviceLocationsData: ServiceLocation[] = [
  {
    id: 'loc-1',
    name: 'Highway Truck Service',
    address: '1234 Interstate Blvd, Dallas, TX 75001',
    latitude: 32.7767,
    longitude: -96.7970,
    phone: '(555) 123-4567',
    services: ['Oil Change', 'Brake Repair', 'Engine Diagnostics', 'Transmission Service'],
    rating: 4.5,
    reviewCount: 150,
    hours: 'Mon-Fri 6AM-10PM, Sat-Sun 8AM-6PM',
    website: 'https://example.com'
  },
  {
    id: 'loc-2',
    name: '24/7 Emergency Repairs',
    address: '5678 Highway 35, Houston, TX 75002',
    latitude: 29.7604,
    longitude: -95.3698,
    phone: '(555) 987-6543',
    services: ['Emergency Repair', 'Towing', 'Mobile Service', 'Roadside Assistance'],
    rating: 4.2,
    reviewCount: 89,
    hours: '24/7',
    website: 'https://example.com'
  },
  {
    id: 'loc-3',
    name: 'Fleet Maintenance Pro',
    address: '9012 Industrial Park Dr, Austin, TX 75003',
    latitude: 30.2672,
    longitude: -97.7431,
    phone: '(555) 456-7890',
    services: ['Preventive Maintenance', 'Fleet Service', 'DOT Inspections', 'Annual Inspections'],
    rating: 4.8,
    reviewCount: 220,
    hours: 'Mon-Fri 7AM-7PM',
    website: 'https://example.com'
  },
  {
    id: 'loc-4',
    name: 'Diesel Specialists Inc',
    address: '1111 Truck Route 66, San Antonio, TX 78201',
    latitude: 29.4241,
    longitude: -98.4936,
    phone: '(555) 321-0987',
    services: ['Diesel Engine Repair', 'Turbo Service', 'Injection System', 'Engine Rebuild'],
    rating: 4.6,
    reviewCount: 175,
    hours: 'Mon-Sat 8AM-6PM',
    website: 'https://example.com'
  },
  {
    id: 'loc-5',
    name: 'Air Brake Masters',
    address: '2222 Commerce St, Fort Worth, TX 76102',
    latitude: 32.7555,
    longitude: -97.3308,
    phone: '(555) 654-3210',
    services: ['Air Brake Service', 'Brake Pad Replacement', 'ABS Diagnostics', 'Brake Adjustment'],
    rating: 4.7,
    reviewCount: 132,
    hours: 'Mon-Fri 7AM-9PM, Sat 8AM-5PM',
    website: 'https://example.com'
  }
];

// Repair Guides Data
export const repairGuidesData: RepairGuide[] = [
  {
    id: 'guide-1',
    title: 'Semi Truck Oil Change Step-by-Step',
    description: 'Complete guide to changing oil in commercial trucks with proper procedures and safety tips',
    category: 'maintenance',
    difficulty: 'Beginner',
    duration: '30-45 minutes',
    rating: 4.8,
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    thumbnailUrl: '/images/guides/oil-change-thumb.jpg',
    content: `
# Semi Truck Oil Change Guide

## Required Tools and Materials
- Oil drain pan (15+ gallon capacity)
- Socket wrench set
- Oil filter wrench
- Safety glasses and gloves
- Jack and jack stands
- New oil filter
- Engine oil (check specifications)

## Safety Precautions
1. Ensure engine is warm but not hot
2. Use proper lifting equipment
3. Wear safety gear at all times
4. Work on level ground

## Step-by-Step Process
1. **Preparation**
   - Park on level ground
   - Engage parking brake
   - Allow engine to cool slightly

2. **Drain Old Oil**
   - Locate drain plug
   - Position drain pan
   - Remove drain plug with socket wrench
   - Allow complete drainage (15-20 minutes)

3. **Replace Oil Filter**
   - Locate oil filter
   - Remove old filter
   - Apply thin layer of new oil to new filter gasket
   - Install new filter hand-tight plus 3/4 turn

4. **Refill with New Oil**
   - Replace drain plug with new gasket
   - Add new oil through filler cap
   - Check dipstick for proper level

5. **Final Checks**
   - Start engine and check for leaks
   - Turn off and recheck oil level
   - Dispose of old oil and filter properly

## Tips for Success
- Always use manufacturer-specified oil
- Keep maintenance records
- Check for leaks after driving
    `
  },
  {
    id: 'guide-2',
    title: 'Diesel Engine Troubleshooting',
    description: 'Comprehensive guide to diagnosing common diesel engine problems and their solutions',
    category: 'engine',
    difficulty: 'Intermediate',
    duration: '45-90 minutes',
    rating: 4.9,
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    thumbnailUrl: '/images/guides/diesel-diagnostics-thumb.jpg',
    content: `
# Diesel Engine Troubleshooting Guide

## Common Symptoms and Causes

### Engine Won't Start
**Possible Causes:**
- Dead battery
- Fuel system issues
- Glow plug problems
- Air in fuel lines

**Diagnostic Steps:**
1. Check battery voltage (should be 12.6V+)
2. Test glow plug operation
3. Check fuel supply and quality
4. Inspect air filter

### Poor Performance/Low Power
**Possible Causes:**
- Clogged air filter
- Fuel filter restrictions
- Turbocharger issues
- Injector problems

**Diagnostic Steps:**
1. Check air filter condition
2. Test fuel pressure
3. Inspect turbocharger boost
4. Run injector balance test

### Excessive Smoke

**White Smoke:**
- Unburned fuel
- Coolant leak into cylinders
- Poor injector timing

**Black Smoke:**
- Overfueling
- Restricted air intake
- Faulty turbocharger

**Blue Smoke:**
- Oil burning
- Worn rings or valves
- Turbo seal failure

## Diagnostic Tools
- OBD scanner
- Multimeter
- Fuel pressure gauge
- Compression tester
- Smoke meter

## Safety Reminders
- Always follow lockout/tagout procedures
- Use proper PPE
- Ensure adequate ventilation
- Have fire extinguisher nearby
    `
  },
  {
    id: 'guide-3',
    title: 'Air Brake System Maintenance',
    description: 'Complete maintenance guide for commercial vehicle air brake systems',
    category: 'brakes',
    difficulty: 'Advanced',
    duration: '60-120 minutes',
    rating: 4.7,
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    thumbnailUrl: '/images/guides/air-brakes-thumb.jpg',
    content: `
# Air Brake System Maintenance Guide

## System Overview
Air brake systems use compressed air to operate brake chambers and apply braking force. Regular maintenance is critical for safety and DOT compliance.

## Components to Inspect

### Air Compressor
- Check belt tension
- Inspect for oil leaks
- Test unloader valve operation
- Check air lines for damage

### Air Tanks
- Drain daily to remove moisture
- Inspect for rust and damage
- Check drain valves
- Test pressure relief valves

### Brake Chambers
- Inspect for leaks
- Check pushrod adjustment
- Test spring brake operation
- Examine mounting hardware

### Brake Shoes and Drums
- Measure lining thickness
- Check for uneven wear
- Inspect drum surface
- Verify proper adjustment

## Maintenance Procedures

### Daily Checks
1. Drain air tanks
2. Check air pressure buildup time
3. Test low air warning system
4. Inspect for visible leaks

### Weekly Maintenance
1. Check belt tension
2. Inspect air lines
3. Test parking brake operation
4. Check brake adjustment

### Monthly Service
1. Change air dryer cartridge
2. Inspect governor operation
3. Test safety valve
4. Check brake chamber pushrod travel

## Adjustment Procedures
- Automatic slack adjusters should self-adjust
- Manual adjustment only when necessary
- Follow manufacturer specifications
- Use proper adjustment tools

## Safety Warnings
- Never work under vehicle supported only by air suspension
- Always chock wheels before maintenance
- Relieve air pressure before disconnecting lines
- Use proper lifting equipment
    `
  },
  {
    id: 'guide-4',
    title: 'Pre-Trip Inspection Checklist',
    description: 'DOT-compliant pre-trip inspection guide for commercial drivers',
    category: 'inspection',
    difficulty: 'Beginner',
    duration: '15-30 minutes',
    rating: 4.6,
    videoUrl: 'https://www.youtube.com/watch?v=example4',
    thumbnailUrl: '/images/guides/pre-trip-thumb.jpg',
    content: `
# Pre-Trip Inspection Checklist

## Engine Compartment
- [ ] Oil level and condition
- [ ] Coolant level and condition
- [ ] Power steering fluid
- [ ] Windshield washer fluid
- [ ] Battery condition and connections
- [ ] Belts for proper tension and condition
- [ ] Hoses for leaks and wear
- [ ] Air compressor belt
- [ ] Wiring for damage

## Cab and Controls
- [ ] Seats properly adjusted and secure
- [ ] Mirrors clean and properly adjusted
- [ ] Windshield clean and undamaged
- [ ] Wipers in good condition
- [ ] Dashboard warning lights
- [ ] Gauges reading normal
- [ ] Horn operation
- [ ] Heater/defroster operation

## Fuel and Exhaust
- [ ] Fuel tank secure and not leaking
- [ ] Fuel level adequate for trip
- [ ] Fuel cap tight
- [ ] Exhaust system secure
- [ ] DEF (diesel exhaust fluid) level
- [ ] No exhaust leaks

## Brakes and Suspension
- [ ] Air pressure builds to 125 PSI
- [ ] Low air warning activates
- [ ] Air loss rate within limits
- [ ] Brake chamber condition
- [ ] Slack adjuster arm travel
- [ ] Suspension components secure
- [ ] Shock absorbers not leaking

## Wheels and Tires
- [ ] Tire pressure correct
- [ ] Tread depth adequate (4/32" minimum)
- [ ] No cuts, bulges, or damage
- [ ] Valve stems secure
- [ ] Wheel rims undamaged
- [ ] Lug nuts tight and present
- [ ] Hub oil level (if equipped)

## Lights and Reflectors
- [ ] Headlights clean and working
- [ ] Tail lights operational
- [ ] Brake lights functioning
- [ ] Turn signals working
- [ ] Hazard lights operational
- [ ] Clearance lights working
- [ ] Reflectors clean and secure

## Final Checks
- [ ] Emergency equipment present
- [ ] Load properly secured
- [ ] Documentation complete
- [ ] Route planned
- [ ] Weather conditions assessed

Remember: A thorough pre-trip inspection can prevent breakdowns, accidents, and DOT violations.
    `
  },
  {
    id: 'guide-5',
    title: 'Transmission Service Guide',
    description: 'Maintenance procedures for manual and automatic truck transmissions',
    category: 'transmission',
    difficulty: 'Intermediate',
    duration: '90-180 minutes',
    rating: 4.5,
    videoUrl: 'https://www.youtube.com/watch?v=example5',
    thumbnailUrl: '/images/guides/transmission-thumb.jpg',
    content: `
# Transmission Service Guide

## Manual Transmission Service

### Oil Change Procedure
1. **Preparation**
   - Warm transmission to operating temperature
   - Position vehicle on level surface
   - Gather tools and new oil

2. **Drain Old Oil**
   - Remove drain plug
   - Allow complete drainage
   - Inspect drain plug and gasket

3. **Refill Process**
   - Install drain plug with new gasket
   - Add specified oil through fill hole
   - Check level with dipstick or fill to bottom of fill hole

### Clutch Adjustment
1. Check free play at pedal
2. Adjust linkage as needed
3. Test clutch engagement point
4. Verify proper operation

## Automatic Transmission Service

### Fluid and Filter Change
1. **Preparation**
   - Warm transmission
   - Raise vehicle safely
   - Position drain pan

2. **Drain and Inspect**
   - Remove drain plug or pan
   - Inspect old fluid for contamination
   - Check for metal particles

3. **Filter Replacement**
   - Remove old filter
   - Clean filter mounting surface
   - Install new filter with gasket
   - Torque to specification

4. **Refill and Test**
   - Add new fluid gradually
   - Start engine and cycle through gears
   - Check fluid level when warm
   - Test shift quality

## Common Issues

### Hard Shifting (Manual)
- Low oil level
- Wrong oil viscosity
- Clutch problems
- Synchronizer wear

### Slipping (Automatic)
- Low fluid level
- Worn bands or clutches
- Valve body issues
- Torque converter problems

## Maintenance Schedule
- **Manual:** Change oil every 100,000 miles
- **Automatic:** Service every 50,000 miles
- **Both:** Check levels monthly

## Safety Notes
- Always use manufacturer-specified fluids
- Dispose of old oil properly
- Never overfill transmission
- Check for leaks after service
    `
  }
];

// Function to initialize static data in localStorage
export function initializeStaticData() {
  if (typeof window === 'undefined') return;
  
  // Check if data already exists
  const existingLocations = localStorage.getItem('serviceLocations');
  const existingGuides = localStorage.getItem('repairGuides');
  
  // Initialize service locations if not present
  if (!existingLocations) {
    localStorage.setItem('serviceLocations', JSON.stringify(serviceLocationsData));
  }
  
  // Initialize repair guides if not present
  if (!existingGuides) {
    localStorage.setItem('repairGuides', JSON.stringify(repairGuidesData));
  }
}

// Function to get demo truck data
export function getDemoTruckData() {
  return [
    {
      id: 'demo-truck-1',
      make: 'Freightliner',
      model: 'Cascadia',
      year: 2020,
      vin: '1FUJGBDV4LLBXXXXX',
      mileage: 150000,
      engineType: 'diesel',
      transmission: 'automatic',
      usageType: 'heavy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-truck-2',
      make: 'Peterbilt',
      model: '579',
      year: 2019,
      vin: '1XPXDB9X5KD111111',
      mileage: 200000,
      engineType: 'diesel',
      transmission: 'manual',
      usageType: 'heavy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
}

// Function to get demo maintenance records
export function getDemoMaintenanceData() {
  return [
    {
      id: 'demo-maint-1',
      truckId: 'demo-truck-1',
      serviceType: 'Oil Change',
      description: 'Regular oil and filter change',
      serviceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mileageAtService: 148000,
      cost: 250.00,
      serviceProvider: 'Highway Service Center',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-maint-2',
      truckId: 'demo-truck-1',
      serviceType: 'Brake Inspection',
      description: 'Full brake system inspection and pad replacement',
      serviceDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mileageAtService: 145000,
      cost: 800.00,
      serviceProvider: 'Truck Stop Repairs',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-maint-3',
      truckId: 'demo-truck-2',
      serviceType: 'Annual DOT Inspection',
      description: 'Department of Transportation safety inspection',
      serviceDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mileageAtService: 195000,
      cost: 150.00,
      serviceProvider: 'Certified Inspection Station',
      createdAt: new Date().toISOString(),
    }
  ];
}

// Function to initialize demo data
export function initializeDemoData() {
  if (typeof window === 'undefined') return;
  
  // Check if demo data already exists
  const existingTrucks = localStorage.getItem('trucks');
  const existingMaintenance = localStorage.getItem('maintenanceRecords');
  
  // Initialize demo trucks if no trucks exist
  if (!existingTrucks || JSON.parse(existingTrucks).length === 0) {
    localStorage.setItem('trucks', JSON.stringify(getDemoTruckData()));
  }
  
  // Initialize demo maintenance records if none exist
  if (!existingMaintenance || JSON.parse(existingMaintenance).length === 0) {
    localStorage.setItem('maintenanceRecords', JSON.stringify(getDemoMaintenanceData()));
  }
}
