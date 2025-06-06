#!/bin/bash
# Скрипт для подготовки файлов проекта перед сборкой

# Создаем директории для моделей грузовиков (если они еще не существуют)
mkdir -p src/data/trucks
mkdir -p components/data/trucks

# Копируем файлы моделей грузовиков из data в src/data
cp -r data/trucks/* src/data/trucks/ || echo "No model files to copy to src/data/trucks/"

# Копируем файлы моделей грузовиков из data в components/data
cp -r data/trucks/* components/data/trucks/ || echo "No model files to copy to components/data/trucks/"

echo "Project files prepared for build!"
