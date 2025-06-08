# Truck Repair Assistant - Development Plan (Updated Architecture)

## 📋 Project Overview

**Name:** Truck Repair Assistant
**Type:** Web application with GitHub Pages deployment
**Target Audience:** Truck drivers in USA
**Main Goal:** AI-powered assistant for truck diagnosis and repair

## 🎯 Key Features

### 1. Truck Model & Configuration Selection
- Database of popular truck models
- Filtering system by year, make, model
- Static JSON data for simplified deployment

### 2. Multimodal Assistance
- YouTube video tutorials (embedded)
- Digital repair manuals
- AI engineer powered by GitHub Models (GPT-4o)

### 3. AI Diagnosis
- Training on real breakdown data
- Engine sound recognition
- Interactive diagnosis with questions

### 4. Geolocation Services
- Map of nearby services using OpenStreetMap
- Integration with Nominatim API (free alternative)
- Service ratings and reviews

### 5. Repair Solutions
- Step-by-step instructions with checklists
- Videos with transcripts
- Temporary solutions and hacks
- Parts lists with pricing

## 🏗️ System Architecture (Updated)

### Frontend (Web)
```
Next.js with Static Export
├── UI Components (Tailwind CSS + Radix UI)
├── State Management (Zustand)
├── PWA capabilities
├── Responsive design
└── Static hosting on GitHub Pages
```

### Backend & Database
```
Simplified Architecture
├── Docker PostgreSQL (development)
├── Azure Database for PostgreSQL (production)
├── Static JSON files in repository
├── GitHub repository for file storage
└── No traditional backend API routes
```

### AI/ML Components
```
├── GitHub Models API integration (GPT-4o)
├── Audio analysis (Web Audio API)
├── GitHub Models Whisper for audio
└── Local storage for user data
```

### Database
```
├── Docker PostgreSQL (development)
├── Azure Database for PostgreSQL (production)
├── Static JSON files (truck models, parts)
├── Local storage (user preferences)
└── GitHub repository (static assets)
```

## 📱 Technical Specification

### Phase 1: MVP Web Version (2-3 months)

#### Month 1: Foundation
**Week 1-2:**
- Infrastructure setup (GitHub Pages, Docker)
- Basic Frontend architecture creation
- Design system and UI Kit
- Database setup with Docker

**Week 3-4:**
- Truck model selection module
- Basic AI chat with GitHub Models
- Theme system (light/dark)
- Responsive design

#### Month 2: Key Features
**Week 1-2:**
- YouTube API integration (embedded videos)
- Manual system (static PDF files)
- Basic AI diagnostics
- Audio recording and analysis

**Week 3-4:**
- Service map (OpenStreetMap + Nominatim)
- Checklist system
- Symptom search
- Mobile adaptation

#### Month 3: Polish
**Week 1-2:**
- Simplified parts lookup (JSON data)
- Enhanced AI diagnostics
- Performance optimization
- Offline functionality

**Week 3-4:**
- Testing and bug fixes
- SEO optimization
- Simple analytics integration
- Launch preparation

### Phase 2: Enhanced Features (1-2 months)
- Improved sound recognition
- Solution rating system
- Enhanced parts integration
- Multi-language support

### Phase 3: Mobile Application (2-3 months)
- Progressive Web App improvements
- Native camera integration
- Push notifications (if applicable)
- Enhanced offline mode

## 🛠️ Technology Stack (Updated)

### Frontend
- **Framework**: Next.js 14 with Static Export
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **State Management**: Zustand for client state
- **Audio**: Web Audio API for recording and analysis

### Backend & Database
- **Database**: Docker PostgreSQL (development) / Azure Database for PostgreSQL (production)
- **Static Hosting**: GitHub Pages with static export
- **File Storage**: GitHub repository for static assets
- **Authentication**: GitHub OAuth (optional for user features)

### AI & APIs
- **AI Model**: GitHub Models API (GPT-4o integration)
- **Audio Processing**: Web Speech API + GitHub Models Whisper
- **Maps**: OpenStreetMap with Nominatim API (free alternative)
- **Parts Data**: Simplified JSON files in repository
- **Video Content**: Embedded YouTube videos or repository-hosted content

### Deployment
- **Platform**: GitHub Pages (Static hosting)
- **CI/CD**: GitHub Actions for automated deployment
- **CDN**: GitHub Pages CDN
- **Environment**: GitHub repository branches (main, staging, development)

### DevOps
- **Hosting**: GitHub Pages (Frontend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Simple analytics + error tracking
- **Database**: Docker (local) + Azure Database (production)

## 💰 Estimated Development Cost

### Team (for accelerated development):
- **Full-stack developer**: $80-120k/year
- **UI/UX designer**: $60-90k/year
- **Part-time consultant**: $40-60k/year

### Infrastructure (monthly):
- **Hosting**: $0 (GitHub Pages free)
- **GitHub Models API**: $100-500 (depending on usage)
- **Azure Database**: $20-100 (development tier)
- **Domain**: $12/year

### One-time expenses:
- **Design system**: $3-7k (simplified)
- **Legal matters**: $2-4k
- **Marketing site**: $2-5k

## 🚀 Launch Plan

### Soft Launch (Beta)
1. Testing with 10-20 truck drivers
2. Feedback collection and iterations
3. Critical bug fixes

### Public Launch
1. Marketing campaign
2. Partnerships with truck companies
3. Social media promotion

### Growth Phase
1. Monetization strategy
2. Premium features
3. B2B partnerships

## 📊 Success Metrics

### Technical KPIs:
- Page load time < 2s
- Static site performance score > 95
- 99.9% uptime (GitHub Pages)
- Mobile Core Web Vitals score > 90

### Business KPIs:
- Monthly Active Users
- Problem resolution rate
- User satisfaction score
- Time to problem diagnosis

## 🔒 Security and Compliance

### Phase 1 (MVP):
- HTTPS everywhere (GitHub Pages default)
- Input validation
- Client-side rate limiting
- Basic data encryption in local storage

### Future phases:
- GDPR compliance
- Privacy policy
- Terms of service
- Data export functionality

## 📈 Expansion Roadmap

### 6-12 months:
- Enhanced offline capabilities
- Advanced audio analysis
- Fleet management features
- Parts ordering integration

### 1-2 years:
- AR diagnostics
- Machine learning optimization
- International expansion
- Enterprise features

## 🔄 Migration Benefits

### Cost Reduction:
- **Hosting**: $300/month → $0 (GitHub Pages)
- **AI API**: $500-2000/month → $100-500/month (GitHub Models)
- **Maps API**: $200-500/month → $0 (OpenStreetMap)
- **Total savings**: ~$1000-2800/month

### Simplified Development:
- No backend server management
- Simplified deployment process
- Reduced infrastructure complexity
- Easier maintenance and updates

### Enhanced Performance:
- Static site generation
- CDN delivery worldwide
- Faster load times
- Better SEO

---

*This document will be updated as the project evolves*
