---
applyTo:🛠️ Responsibilities:
- Generate real, full files only: `.tsx`, `.ts`, `.json`, etc.
- Setup and connect to MongoDB Atlas (assume full access to terminal)
- If output is too long, end with `<!-- CONTINUE -->` and resume seamlessly: 
  - Do not repeat previous code or comments
  - Do not add new comments or explanations
- Search for and recommend publicly available REST APIs for:
  - Truck parts catalogs (OEM + aftermarket)
  - Auto service locators
  - VIN decoding and truck diagnostics
  - Shipping/delivery APIs for parts
- Find actual YouTube videos with clear, step-by-step visual tutorials for common truck repair issues (engine, brakes, wiring, tires, etc.)
- Prioritize English-language content, verified creators (truck mechanics, official channels), mobile-friendly visuals, and chapters
- Generate structured lists of results: name, description, direct API URL or video URL, authentication type, usage cost (if available)
- Format results for easy integration in the web app or admin panel
- Cross-reference relevant data (e.g., NHTSA VIN APIs + parts suppliers + mapping)


🛠️ Engineering Instructions (always apply):
- Generate real code only (`.ts`, `.tsx`, `.env`, `.json`, etc.)
- Run all necessary terminal commands automatically (assume full CLI access)
- Use all available VS Code extensions and tools; recommend installing missing but useful ones
- Never use meta descriptions like `<summary>` or explain your steps unless requested
- Respect production status — no breaking code, no unfinished modules
- Generate complete, production-ready code files
- Use real APIs, environment variables, and endpoints
- Use real data structures and types
- Use real database connections and queries
- Use real UI components and libraries
- Use real state management and hooks
- Use real testing frameworks and libraries
- Use real deployment configurations and scripts
- Use real CLI commands and scripts
- Use real error handling and logging
- Use real security practices and configurations
- Use real performance optimizations and configurations
- Use real accessibility practices and configurations
- Clean up temp files. Output must be safe for production. 
- Include basic test coverage (`jest` / `vitest`) when logic requires it.

📦 Modules may include:
- Audio recorder + /api/transcribe handler:
  - Web Audio API for recording audio
  - Whisper API for transcription
- Azure AI Foundry Agent interface:
  - AI diagnosis interface for truck issues
- Service locator map:
  - OpenStreetMap + Nominatim for geolocation
- Repair steps/checklist UI:
  - UI for displaying repair steps and checklists
- MongoDB session storage
- Static JSON loader

🧠 Tech Stack:
- Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI (shadcn/ui), Zustand:
  - React 18, Server Components, Client Components
- Web Audio API, Whisper API, Azure AI Foundry Agent
- OpenStreetMap + Nominatim for geolocation
- Vercel for deployment
- MongoDB Atlas for database
- Jest / Vitest for testing
- Zustand for state management
- Tailwind CSS for styling
- Radix UI (shadcn/ui) for UI components

🛑 Do NOT: 
- Generate incomplete, pseudo-code, or placeholder code
- Return narration, comments, partials, or console logs
- Break the build
- Write anything except final working code unless asked