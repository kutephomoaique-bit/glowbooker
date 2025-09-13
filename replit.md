# Beauty Booking Website - HOME BASE Salon

## Overview

This is a full-stack beauty salon booking website built for "HOME BASE Beauty Salon," specializing in nail, eyelash, and facial services. The application provides a luxurious user experience with comprehensive booking management, admin controls, and customer engagement features. Built with modern web technologies, it offers both customer-facing features and administrative tools for managing services, bookings, and content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **Routing**: Wouter for client-side routing with role-based page access
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Theme**: Pink and gold luxury aesthetic with custom CSS variables and gradients
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation schemas
- **Authentication Flow**: Protected routes with user role checking (ADMIN/CUSTOMER)

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with centralized error handling and request logging
- **File Structure**: Monolithic structure with shared schema between client and server

### Database Schema Design
- **User Management**: Users table with role-based access (ADMIN/CUSTOMER) 
- **Service Organization**: Hierarchical structure with service categories and individual services
- **Booking System**: Complete booking lifecycle with status tracking (PENDING/CONFIRMED/CANCELLED/DONE)
- **Content Management**: Dynamic content settings, gallery images, promotions, and customer feedback
- **Promotional Features**: Event-based promotions with flexible scoping (global, category, or service-specific)

### Authentication & Authorization
- **Provider**: Replit Auth with OpenID Connect for seamless integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Role System**: Two-tier access control (ADMIN/CUSTOMER) with route protection
- **User Management**: Automatic user creation/updates with profile information sync

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless for scalable data storage
- **Session Store**: PostgreSQL-based session management via connect-pg-simple
- **Authentication**: Replit Auth service for user identity management

### Frontend Libraries
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS with custom design system variables
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts integration (Playfair Display, Inter)

### Development & Build Tools
- **Build System**: Vite with custom configuration for client/server separation
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **Development Plugins**: Replit-specific plugins for error handling and development experience

### Optional Integrations
- **Image Storage**: Cloudinary support with local fallback for image uploads
- **Email**: Potential integration for booking confirmations and notifications
- **Payment Processing**: Architecture ready for payment gateway integration