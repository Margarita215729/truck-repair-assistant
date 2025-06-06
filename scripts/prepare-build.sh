#!/bin/bash
# Скрипт для подготовки файлов проекта перед сборкой

echo "Starting prepare-build script..."

# Проверка существования исходной директории
if [ ! -d "data/trucks" ]; then
  echo "Warning: Source directory data/trucks does not exist! Creating it..."
  mkdir -p data/trucks
fi

# Проверка существования файла моделей
if [ ! -f "data/trucks/models.ts" ]; then
  echo "Warning: models.ts file not found in data/trucks directory! Creating default models file..."
  
  # Создаем файл с моделями грузовиков непосредственно в скрипте
  cat > data/trucks/models.ts << 'EOL'
export interface TruckModel {
  id: string;
  make: string;
  model: string;
  years: number[];
  engines: string[];
  commonIssues: string[];
}

export const TRUCK_MODELS: TruckModel[] = [
  {
    id: 'peterbilt-379',
    make: 'Peterbilt',
    model: '379',
    years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007],
    engines: ['Caterpillar C15', 'Cummins ISX', 'Detroit Diesel Series 60'],
    commonIssues: ['DPF regeneration problems', 'Turbocharger issues', 'Air brake system leaks']
  },
  {
    id: 'kenworth-t680',
    make: 'Kenworth',
    model: 'T680',
    years: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    engines: ['PACCAR MX-13', 'Cummins ISX15', 'Cummins X15'],
    commonIssues: ['DEF system problems', 'Transmission shifting issues', 'Electrical problems']
  },
  {
    id: 'freightliner-cascadia',
    make: 'Freightliner',
    model: 'Cascadia',
    years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    engines: ['Detroit DD15', 'Cummins ISX', 'Detroit DD13'],
    commonIssues: ['EGR system failures', 'DPF issues', 'Electrical system problems']
  }
];

export function getAllMakes(): string[] {
  const makes = new Set(TRUCK_MODELS.map(truck => truck.make));
  return Array.from(makes).sort();
}

export function getModelsByMake(make: string): TruckModel[] {
  return TRUCK_MODELS.filter(truck => truck.make === make);
}

export function getTruckById(id: string): TruckModel | undefined {
  return TRUCK_MODELS.find(truck => truck.id === id);
}
EOL

  echo "Default models.ts file created successfully"
fi

# Создаем директории для моделей грузовиков (если они еще не существуют)
echo "Creating target directories..."
mkdir -p src/data/trucks
mkdir -p components/data/trucks

echo "Copying truck model files..."
# Копируем файлы моделей грузовиков из data в src/data
cp -rv data/trucks/* src/data/trucks/ || echo "Warning: Failed to copy to src/data/trucks/"

# Копируем файлы моделей грузовиков из data в components/data
cp -rv data/trucks/* components/data/trucks/ || echo "Warning: Failed to copy to components/data/trucks/"

# Проверяем, что файлы скопированы успешно
echo "Verifying copied files..."
if [ -f "src/data/trucks/models.ts" ]; then
  echo "Success: models.ts copied to src/data/trucks/"
else
  echo "Error: models.ts not found in src/data/trucks/"
  exit 1
fi

if [ -f "components/data/trucks/models.ts" ]; then
  echo "Success: models.ts copied to components/data/trucks/"
else
  echo "Error: models.ts not found in components/data/trucks/"
  exit 1
fi

echo "Project files prepared for build!"
