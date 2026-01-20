# Customer Portal - Jifeline

## Overview
A modern Customer Portal web application that integrates with the Jifeline Customer API. This application follows a BFF (Backend-for-Frontend) pattern to securely proxy API requests and manage authentication tokens.

## Recent Changes
- **2026-01-20**: Initial MVP implementation with full authentication flow, dashboard, profile management, vehicles browser, products/favorites, cart calculator, tickets management, chats viewer, employees CRUD, service center status, system data, and messenger tools.

## Tech Stack
- **Frontend**: React with TypeScript, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Express.js (BFF proxy pattern)
- **Data Fetching**: TanStack React Query
- **Routing**: Wouter
- **Validation**: Zod schemas
- **State Management**: React Context for auth and theme

## Project Architecture

```
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── error-panel.tsx
│   │   │   ├── json-viewer.tsx
│   │   │   ├── page-header.tsx
│   │   │   ├── skeleton-card.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── lib/               # Utilities and contexts
│   │   │   ├── auth-context.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── queryClient.ts
│   │   ├── pages/             # Page components
│   │   │   ├── login.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── vehicles.tsx
│   │   │   ├── products.tsx
│   │   │   ├── cart.tsx
│   │   │   ├── tickets.tsx
│   │   │   ├── chats.tsx
│   │   │   ├── employees.tsx
│   │   │   ├── service-center.tsx
│   │   │   ├── system.tsx
│   │   │   └── messenger.tsx
│   │   ├── App.tsx            # Main app with routing
│   │   └── main.tsx           # Entry point
├── server/                    # Backend BFF
│   ├── index.ts               # Express server setup
│   ├── routes.ts              # API routes (auth + proxy)
│   └── storage.ts             # Session management
├── shared/                    # Shared types
│   └── schema.ts              # TypeScript interfaces and Zod schemas
└── design_guidelines.md       # UI/UX design system
```

## Authentication Flow
1. User logs in via `/login` with either:
   - **Pincode**: Connector UUID + pincode (calls `/v2/authenticate/pincode`)
   - **OTP**: One-time password (calls `/v1/authenticate/otp`)
2. BFF receives tokens from external API
3. Session is stored server-side with access token, refresh token, and expiry time
4. Session ID is set as httpOnly cookie
5. Frontend never sees the actual access/refresh tokens
6. All API requests go through BFF which injects the Bearer token

### Token Refresh
The BFF implements automatic token refresh in two ways:
- **Proactive refresh**: Before proxying requests, checks if token expires within 5 minutes and refreshes preemptively
- **Reactive refresh**: On 401 responses from the API, attempts to refresh the token and retry the failed request

## Environment Variables
The application requires the following environment variable:
- `API_BASE_URL`: Base URL of the Jifeline API (without trailing slash)

Example:
```
API_BASE_URL=https://api.jifeline.com
```

## Running the Application
```bash
npm run dev
```
This starts both the Express backend and Vite frontend dev server on port 5000.

## API Endpoints (BFF)

### Authentication
- `POST /api/auth/login-pincode` - Login with connector UUID and pincode
- `POST /api/auth/login-otp` - Login with OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/session` - Get current session info

### Users & Customers
- `GET /api/users/me` - Get current user
- `GET /api/customers/me` - Get current customer
- `PUT /api/customers/me` - Update customer details
- `GET /api/customer-wallet` - Get wallet balance

### Vehicles
- `GET /api/vehicles/makes` - List vehicle makes
- `GET /api/vehicles/model-groups` - List model groups
- `GET /api/vehicles/models` - List models
- `GET /api/vehicles/model-variants` - List variants

### Products
- `GET /api/products` - List products
- `GET /api/product-groups` - List product groups
- `POST /api/favorite-products` - Add favorite
- `DELETE /api/favorite-products/:id` - Remove favorite

### Cart
- `POST /api/cart/calculate-prices` - Calculate cart prices

### Tickets
- `GET /api/prepared-tickets` - List prepared tickets
- `POST /api/tickets` - Create new ticket

### Employees
- `GET /api/employees` - List employees
- `POST /api/employees` - Add employee
- `GET /api/employees/:id` - Get employee
- `PUT /api/employees/:id` - Update employee

### Service Center
- `GET /api/service-center` - Get service center info
- `GET /api/service-center/status` - Get current status

### System
- `GET /api/system/countries` - List countries
- `GET /api/system/currencies` - List currencies

### Messenger
- `GET /api/channels/:id` - Get channel
- `POST /api/translate` - Translate text
- `POST /api/channel-actions/send-control-message` - Send control message
- `GET /api/channel-attachments` - Get attachments
- `POST /api/channel-attachments` - Create attachment

## User Preferences
- Dark/Light theme toggle (persisted in localStorage)
- Session-based authentication (httpOnly cookies)

## Key Design Decisions
1. **BFF Pattern**: All API calls go through the Express backend to:
   - Avoid CORS issues
   - Keep tokens secure (never exposed to browser)
   - Add request validation with Zod
   - Handle token refresh automatically

2. **Session Storage**: Using in-memory storage for MVP. For production, consider Redis or database-backed sessions.

3. **Component Library**: Using shadcn/ui for consistent, accessible UI components.

4. **Type Safety**: Full TypeScript with shared schemas between frontend and backend.

## Production Considerations
Before deploying to production, consider:
1. **Session Storage**: Replace in-memory session storage with Redis or PostgreSQL for durability across restarts and horizontal scaling
2. **Token Refresh Endpoint**: Verify the refresh endpoint path (`/v1/authenticate/refresh`) matches the actual Jifeline API specification
3. **Rate Limiting**: Add rate limiting middleware to prevent abuse
4. **Error Logging**: Integrate proper logging service for debugging production issues
5. **Query Key Patterns**: The React Query URL builder expects path segments followed by an optional query params object - ensure all pages follow this pattern
