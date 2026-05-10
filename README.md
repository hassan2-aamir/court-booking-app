# Court Booking App

A modern, full-stack court reservation system built with cutting-edge technologies. This project showcases a complete end-to-end application with a robust backend API, intuitive dashboard, and integrated WhatsApp bot for seamless booking management.

## 🎯 Project Overview

Court Booking App is a comprehensive solution for managing sports court reservations. It enables users to browse available courts, make bookings, manage their reservations, and interact with an intelligent WhatsApp bot for quick bookings and notifications. The system includes dynamic pricing with peak-hour rates, availability management, and a professional dashboard for analytics and administration.

## ✨ Key Features

### User Management

- **Role-Based Access Control** - Support for multiple user roles (Admin, Manager, Customer)
- **Phone-Based Authentication** - Sign up and login via phone number with JWT-based sessions
- **User Profiles** - Manage personal information, booking history, and preferences

### Court Management

- **Dynamic Court Listings** - Browse available courts with detailed information and images
- **Flexible Availability** - Set custom availability hours per day and slot duration
- **Blackout Dates** - Define unavailable periods for maintenance or special events
- **Peak Pricing** - Implement dynamic pricing for peak hours to optimize revenue

### Booking System

- **Real-Time Availability** - Check slot availability with live updates
- **Advanced Booking** - Configurable advance booking limits (default: 30 days)
- **Booking Management** - Cancel, reschedule, or view booking history
- **Per-User Limits** - Control max bookings per user per day
- **Booking Status Tracking** - Track confirmed, pending, and cancelled bookings

### Business Analytics

- **Booking Dashboard** - Visualize booking trends and revenue metrics
- **Court Utilization Charts** - Monitor court usage patterns and occupancy rates
- **Revenue Analytics** - Track income by court and time period
- **Business Settings** - Configure pricing, hours, and operational parameters

### WhatsApp Integration

- **Bot Service** - Dedicated WhatsApp bot microservice for instant bookings
- **Automated Notifications** - Send booking confirmations and reminders
- **Conversational Interface** - Natural language booking through WhatsApp

## 🏗️ Project Architecture

```
court-booking-app/
├── backend/                    # NestJS REST API
│   ├── src/
│   │   ├── auth/              # JWT authentication & guards
│   │   ├── bookings/          # Booking logic & controllers
│   │   ├── courts/            # Court management
│   │   ├── dashboard/         # Analytics & metrics
│   │   ├── settings/          # Business configuration
│   │   ├── users/             # User management
│   │   └── whatsapp/          # WhatsApp service integration
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database versioning
│   │   └── seed.ts            # Seed script
│   └── test/                  # E2E tests
│
├── court-booking-dashboard/   # Next.js Admin Dashboard
│   ├── app/                   # Next.js app directory
│   │   ├── bookings/          # Bookings management UI
│   │   ├── courts/            # Court management UI
│   │   ├── dashboard/         # Analytics & charts
│   │   ├── profile/           # User profile page
│   │   ├── settings/          # Business settings
│   │   └── signin/            # Authentication page
│   ├── components/            # Reusable React components
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utilities & API client
│
├── whatsapp-service/          # WhatsApp Bot Microservice
│   ├── src/
│   │   ├── whatsapp-bot/      # Bot logic & handlers
│   │   └── test/
│   └── test/                  # E2E tests
│
└── docker-compose.yaml        # Multi-container orchestration
```

## 🛠️ Tech Stack

### Backend

- **Framework**: NestJS - Progressive Node.js framework for scalable server-side apps
- **Language**: TypeScript - Type-safe JavaScript
- **ORM**: Prisma - Next-generation database toolkit
- **Database**: PostgreSQL - Robust relational database
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator & class-transformer
- **Caching**: Redis with cache-manager
- **Rate Limiting**: Throttler for API protection
- **API Documentation**: Swagger/OpenAPI

### Frontend

- **Framework**: Next.js - React framework with SSR & static generation
- **Styling**: Tailwind CSS - Utility-first CSS framework
- **UI Components**: Shadcn UI - High-quality React components
- **Type Safety**: TypeScript
- **Testing**: Vitest
- **Charts**: Recharts - React charting library

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Microservices**: WhatsApp bot as independent service
- **Process Manager**: Nest CLI

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd court-booking-app
```

2. **Setup environment variables**

```bash
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/court_booking"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="24h"
```

3. **Start with Docker Compose**

```bash
docker-compose up -d
```

### Manual Setup

**Backend**

```bash
cd backend

# Install dependencies
npm install

# Setup database
npm run prisma:migrate
npm run prisma:seed

# Start development server
npm run start:dev
```

**Frontend**

```bash
cd court-booking-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

**WhatsApp Service**

```bash
cd whatsapp-service

# Install dependencies
npm install

# Start service
npm run start:dev
```

## 📊 Database Schema Highlights

The system uses a well-structured PostgreSQL schema:

- **Users** - User accounts with role-based access
- **Courts** - Court information and configuration
- **CourtAvailability** - Weekly availability schedule per court
- **CourtUnavailability** - Blackout dates and maintenance periods
- **PeakSchedule** - Dynamic pricing rules by day and time
- **Bookings** - Booking records with status tracking
- **BusinessSettings** - System-wide configuration

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Rate Limiting** - Throttler guards to prevent abuse
- **Input Validation** - Class-validator for DTO validation
- **CORS** - Configured for secure cross-origin requests
- **Role-Based Access** - Guards for endpoint authorization

## 📈 Scalability Considerations

- **Microservices Architecture** - WhatsApp service can be independently scaled
- **Redis Caching** - Reduces database load for frequently accessed data
- **Database Indexing** - Optimized queries for performance
- **Containerization** - Easy deployment and horizontal scaling
- **Stateless Design** - Backend can run multiple instances

## 📝 API Documentation

Once the backend is running, visit:

```
http://localhost:3000/api/docs
```

Interactive Swagger documentation with all endpoints and models.

## 🚢 Deployment

The application is containerized and ready for deployment:

```bash
# Build containers
docker-compose build

# Deploy to production
docker-compose -f docker-compose.yaml up -d
```

## 📋 Development Workflow

```bash
# Format code
npm run format

# Lint
npm run lint

# Database studio (visual browser)
npm run prisma:studio

# Seed database
npm run prisma:seed
```

## 🎨 UI Components & Styling

The frontend uses Tailwind CSS with custom shadcn/ui components:

- Modal dialogs for booking and court management
- Responsive charts for analytics
- Mobile-optimized navigation
- Loading states and error handling
- Toast notifications for user feedback

## 🔄 WhatsApp Bot Integration

The WhatsApp service provides:

- Natural language booking through WhatsApp
- Automated booking confirmations
- Availability queries
- Cancellation requests
- User notifications

## 📦 Project Structure Benefits

1. **Separation of Concerns** - Each service has a single responsibility
2. **Independent Deployment** - Services can be updated independently
3. **Code Organization** - Feature-based module structure in NestJS
4. **Reusability** - Shared utilities and components
5. **Maintainability** - Clear folder hierarchy and naming conventions

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## 📄 License

UNLICENSED - Internal Project

## 📧 Contact & Support

For questions or support, please reach out to the development team.

---

**Built with ❤️ using NestJS, Next.js, and TypeScript**
