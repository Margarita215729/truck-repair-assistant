# Truck Repair Assistant — TODO (Q2-Q3 2025)

## 🚨 CRITICAL ISSUES TO FIX (Production Blockers)

### Authentication & Deployment Issues
- [ ] **CRITICAL**: Fix Azure AI Foundry authentication in Vercel
  - Current issue: DefaultAzureCredential not working in serverless environment
  - Need to implement explicit credential configuration for production
  - Test authentication with Azure Key Vault or Service Principal
  - Verify all environment variables are properly configured in Vercel

### UI/UX Critical Issues
- [ ] **Fix Service Map Component**: Currently not displaying or filtering correctly
  - Component appears broken in production
  - Map markers not showing truck locations
  - Search/filter functionality not working
  
- [ ] **Fix Common Issues Display**: Not updating when truck model changes
  - Static content not refreshing based on selected truck type
  - Dynamic content loading issues
  
- [ ] **Make Truck Selection Optional**: Allow custom input instead of required dropdowns
  - Many users have trucks not in our predefined lists
  - Add "Other" option with text input fields
  - Validate custom inputs properly

### Data Integration Issues  
- [ ] **Integrate Static Truck Data**: Files in "Static data for production" folder not being used
  - Truck specifications, common issues, repair procedures
  - Import data into MongoDB Atlas
  - Update AI prompts to use this data

### Remove Unnecessary Features
- [ ] **Remove AI Service Dashboard**: Not needed for truck drivers
  - Remove `/dashboard` route and components
  - Clean up navigation to remove dashboard links
  
- [ ] **Remove Urgency Selector**: Broken trucks are inherently urgent
  - Simplify repair request form
  - Remove urgency-based logic from AI processing

### API & Functionality Testing
- [ ] **Verify All API Endpoints Work in Production**
  - Test `/api/ai/*` endpoints with real Azure credentials
  - Test `/api/transcribe` for audio processing
  - Verify MongoDB connections and data operations
  - Test error handling and fallback mechanisms

---

## ⚠️ MIGRATION TASKS - LEGACY CODE CLEANUP

### PostgreSQL to MongoDB Atlas Migration
- [x] Remove `/workspaces/truck-repair-assistant/database/init/01-schema.sql` (PostgreSQL schema)
- [x] Remove any references to `@prisma/client` and `prisma` if found
- [x] Update `/workspaces/truck-repair-assistant/lib/prisma.ts` to use MongoDB connection instead
- [ ] Search and replace PostgreSQL-specific SQL queries with MongoDB operations
- [ ] Remove Docker PostgreSQL configuration files if any exist
- [x] Update database connection strings from PostgreSQL format to MongoDB Atlas format

### GitHub Pages to Vercel Migration
- [x] Remove `gh-pages` package from dependencies if present
- [x] Remove GitHub Actions deployment workflows (.github/workflows/deploy.yml)
- [x] Update `package.json` scripts: remove `deploy` script with gh-pages
- [x] Remove `output: 'export'` from `next.config.js` (already done)
- [x] Remove `basePath` and `assetPrefix` configurations from `next.config.js`
- [x] Update any hardcoded GitHub Pages URLs to Vercel URLs
- [x] Check for `.nojekyll` files and remove them

### GitHub Models to Azure AI Foundry Migration  
- [x] Audit current GitHub Models usage in `/workspaces/truck-repair-assistant/lib/ai/github-models.ts`
- [x] Replace primary AI service calls from GitHub Models to Azure AI Foundry Agent
- [x] Keep GitHub Models as fallback service only
- [x] Update environment variables documentation from `GITHUB_TOKEN` to `AZURE_PROJECTS_ENDPOINT`
- [ ] Update API route `/api/ai/foundry/route.ts` to be primary endpoint
- [ ] Test Azure AI Foundry Agent integration thoroughly
- [ ] Update prompt engineering for Azure AI Foundry format

### Static Export to API Routes Migration
- [x] Remove `export const dynamic = "force-static"` from API routes (partially done)
- [x] Enable dynamic API routes for database operations
- [x] Update Next.js configuration to support API routes on Vercel
- [ ] Test all API endpoints: `/api/ai/*`, `/api/transcribe`, etc.
- [ ] Ensure proper error handling for server-side operations

### Docker to Vercel Serverless Migration
- [x] Remove Docker configuration files (`docker-compose.yml`, `Dockerfile`)
- [x] Remove container-related scripts from package.json (`db:up`, `db:down`, `db:reset`)
- [ ] Update development environment setup documentation
- [x] Remove references to "Docker Desktop (local) / Azure Container Instances (cloud)"
- [ ] Update deployment documentation to reflect Vercel serverless architecture

---

## Расширенная диагностика AI

### Улучшенная обработка аудио (Web Audio API + Whisper)
- [ ] Провести аудит текущей реализации аудиозаписи (AudioRecorder, AudioAnalysisDisplay)
- [ ] Добавить сохранение аудиофайлов в формате, поддерживаемом Whisper (WAV/FLAC)
- [ ] Реализовать отправку аудиофайла на сервер для анализа через Whisper API (Azure)
- [ ] Интегрировать парсинг результата Whisper (транскрипция, ключевые слова)
- [ ] Включить транскрипцию аудио в цепочку диагностики AI (prompt)
- [ ] Покрыть тестами: загрузка, отправка, обработка ошибок, отображение результата

### Многошаговые диалоги с AI (multi-turn, context)
- [ ] Реализовать хранение истории сообщений для каждого чата (Zustand/client, MongoDB Atlas)
- [ ] Модифицировать API/сервисы для передачи всей истории сообщений в Azure AI Foundry
- [ ] Добавить UI для истории диалога и возможности "продолжить" разговор
- [ ] Реализовать логику уточняющих вопросов от AI
- [ ] Покрыть тестами: длинные диалоги, edge-cases, сброс истории

### Расширенная обработка ошибок и fallback-логика
- [ ] Перепроверить все AI-интеграции на предмет обработки ошибок (timeout, network, invalid response)
- [ ] Добавить централизованный обработчик ошибок для AI-сервисов
- [ ] Реализовать fallback: если Azure AI Foundry недоступен — использовать Azure OpenAI
- [ ] В UI добавить информирование пользователя о причинах ошибок и fallback-сценариях
- [ ] Покрыть тестами: имитация ошибок, проверка fallback, пользовательские уведомления

---

## Улучшенная работа с деталями и запчастями

### Интеграция с ценами и наличием (parts lookup, parts pricing)
- [ ] Создать структуру данных для хранения информации о запчастях (JSON/MongoDB Atlas: part_id, name, price, stock, vendor)
- [ ] Реализовать UI-компонент "Поиск запчастей" (PartsLookup)
- [ ] Интегрировать поиск по названию/артикулу, фильтрацию по наличию и цене
- [ ] Добавить отображение цен и наличия (интеграция с внешним API)
- [ ] Связать найденные запчасти с результатами AI-диагностики (рекомендации по ремонту → детали)
- [ ] Покрыть тестами: поиск, фильтрация, edge-cases

### Система временных решений и лайфхаков
- [ ] Добавить в структуру AI-ответа поле "Временное решение/лайфхак"
- [ ] Обновить prompt для AI: просить давать временные решения, если это возможно
- [ ] Реализовать отображение временных решений в UI (DiagnosisForm, Results)
- [ ] Добавить возможность пользователям предлагать свои лайфхаки (crowdsourcing, модерация)
- [ ] Покрыть тестами: отображение, добавление, edge-cases

---
