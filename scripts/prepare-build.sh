#!/bin/bash
# Скрипт для подготовки файлов проекта перед сборкой

# Создаем директорию для моделей грузовиков в src (если она еще не существует)
mkdir -p src/data/trucks

# Копируем файлы моделей грузовиков из data в src/data
cp -r data/trucks/* src/data/trucks/ || echo "No model files to copy"

echo "Project files prepared for build!"
