#!/bin/bash
# Скрипт для подготовки файлов проекта перед сборкой

echo "Starting prepare-build script..."

# Проверка существования исходной директории
if [ ! -d "data/trucks" ]; then
  echo "Error: Source directory data/trucks does not exist!"
  exit 1
fi

# Проверка существования файла моделей
if [ ! -f "data/trucks/models.ts" ]; then
  echo "Error: models.ts file not found in data/trucks directory!"
  ls -la data/trucks/
  exit 1
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
