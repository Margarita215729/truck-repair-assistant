import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const dataFiles = {
      truckDataset: '/workspaces/truck-repair-assistant/truck_dataset.json',
      truckDatasetNonUS: '/workspaces/truck-repair-assistant/truck_dataset_non_us.json',
      truckSchema: '/workspaces/truck-repair-assistant/truck_schema.json',
      truckManuals: '/workspaces/truck-repair-assistant/truck_manuals_dataset_final.csv'
    };

    const results: Record<string, any> = {};

    // Проверка каждого файла данных
    for (const [key, filePath] of Object.entries(dataFiles)) {
      try {
        const stats = fs.statSync(filePath);
        const exists = fs.existsSync(filePath);
        
        if (exists && filePath.endsWith('.json')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          results[key] = {
            exists: true,
            size: stats.size,
            lastModified: stats.mtime,
            type: 'json',
            recordCount: Array.isArray(data) ? data.length : Object.keys(data).length,
            sampleKeys: Array.isArray(data) && data.length > 0 
              ? Object.keys(data[0]) 
              : Object.keys(data).slice(0, 5)
          };
        } else if (exists && filePath.endsWith('.csv')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n').filter(line => line.trim());
          
          results[key] = {
            exists: true,
            size: stats.size,
            lastModified: stats.mtime,
            type: 'csv',
            recordCount: lines.length - 1, // Исключая заголовок
            headers: lines[0] ? lines[0].split(',') : []
          };
        } else {
          results[key] = {
            exists: false,
            error: 'File not found'
          };
        }
      } catch (error) {
        results[key] = {
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Проверка моделей из компонентов
    try {
      const modelsPath = '/workspaces/truck-repair-assistant/components/data/trucks/models.ts';
      const modelsExists = fs.existsSync(modelsPath);
      
      results.truckModels = {
        exists: modelsExists,
        path: modelsPath,
        type: 'typescript-module',
        note: 'Hardcoded truck models used in application'
      };
    } catch (error) {
      results.truckModels = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      dataFiles: results,
      summary: {
        totalFiles: Object.keys(dataFiles).length + 1,
        existingFiles: Object.values(results).filter(r => r.exists).length,
        missingFiles: Object.values(results).filter(r => !r.exists).length
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
