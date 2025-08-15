# Design Document

## Overview

This design implements real-time dashboard analytics for the court booking system by creating backend endpoints that aggregate booking data and updating the frontend to consume these endpoints. The solution leverages the existing NestJS backend structure and Prisma ORM to efficiently query and aggregate data, while maintaining the current React dashboard UI with real data integration.

## Architecture

### Backend Architecture

The dashboard analytics will be implemented using the existing dashboard module structure:

- **DashboardController**: RESTful endpoints for analytics data
- **DashboardService**: Business logic for data aggregation and calculations
- **PrismaService**: Database queries for booking, court, and user data
- **DTOs**: Type-safe data transfer objects for API responses

### Frontend Architecture

- **Dashboard Components**: Update existing components to fetch real data
- **API Layer**: New dashboard API functions in the existing API structure
- **State Management**: React hooks for data fetching and loading states
- **Error Handling**: Graceful error handling with fallback UI

### Data Flow

1. Frontend dashboard loads and requests analytics data
2. Backend aggregates data from bookings, courts, and users tables
3. Calculated metrics are returned as JSON responses
4. Frontend updates UI components with real data
5. Charts and metrics display actual values instead of hardcoded data

## Components and Interfaces

### Backend Components

#### Dashboard Service Methods

```typescript
interface DashboardService {
  getOverviewMetrics(): Promise<OverviewMetricsDto>
  getWeeklyBookingStats(): Promise<WeeklyBookingStatsDto>
  getCourtUtilizationStats(): Promise<CourtUtilizationDto>
  getTodaysBookingSummary(): Promise<TodaysBookingSummaryDto>
}
```

#### Dashboard Controller Endpoints

- `GET /api/dashboard/overview` - Total bookings, active users, revenue
- `GET /api/dashboard/weekly-bookings` - Daily booking counts for current week
- `GET /api/dashboard/court-utilization` - Utilization percentages by court type
- `GET /api/dashboard/todays-summary` - Today's booking statistics

### Frontend Components

#### Updated Dashboard Components

- **DashboardContent**: Main container with data fetching logic
- **BookingsChart**: Consumes real weekly booking data
- **CourtUtilizationChart**: Displays actual court utilization percentages
- **MetricCards**: Show real-time overview metrics

#### API Integration

```typescript
interface DashboardAPI {
  getOverviewMetrics(): Promise<OverviewMetrics>
  getWeeklyBookingStats(): Promise<WeeklyBookingStats>
  getCourtUtilizationStats(): Promise<CourtUtilization>
  getTodaysBookingSummary(): Promise<TodaysBookingSummary>
}
```

## Data Models

### Overview Metrics DTO

```typescript
interface OverviewMetricsDto {
  totalBookingsThisMonth: number
  activeUsers: number
  revenueThisMonth: number
  todaysBookings: number
  completedTodaysBookings: number
  pendingTodaysBookings: number
}
```

### Weekly Booking Stats DTO

```typescript
interface WeeklyBookingStatsDto {
  weeklyData: Array<{
    day: string // Mon, Tue, Wed, etc.
    bookings: number
    date: string // YYYY-MM-DD
  }>
  weekStart: string
  weekEnd: string
}
```

### Court Utilization DTO

```typescript
interface CourtUtilizationDto {
  utilizationData: Array<{
    name: string // Court type name
    value: number // Utilization percentage
    color: string // Chart color
    totalHours: number // Total available hours
    bookedHours: number // Total booked hours
  }>
  calculationPeriod: string // e.g., "Last 30 days"
}
```

### Today's Booking Summary DTO

```typescript
interface TodaysBookingSummaryDto {
  totalBookings: number
  completedBookings: number
  pendingBookings: number
  confirmedBookings: number
  cancelledBookings: number
  noShowBookings: number
  totalRevenue: number
}
```

## Error Handling

### Backend Error Handling

- Database connection errors return 503 Service Unavailable
- Invalid date ranges return 400 Bad Request
- Authentication failures return 401 Unauthorized
- Unexpected errors return 500 Internal Server Error

### Frontend Error Handling

- Network errors show "Unable to load data" message
- Loading states display skeleton components
- Failed metrics show "Data unavailable" instead of numbers
- Retry mechanisms for transient failures

### Fallback Strategies

- Cache previous successful responses in localStorage
- Display cached data with "Last updated" timestamp
- Graceful degradation to "No data available" messages
- Individual metric failure doesn't break entire dashboard

## Testing Strategy

### Backend Testing

#### Unit Tests
- Service method calculations with mock data
- DTO validation and transformation
- Error handling scenarios
- Date range calculations

#### Integration Tests
- Database queries with test data
- Controller endpoint responses
- Authentication middleware integration
- Performance with large datasets

### Frontend Testing

#### Component Tests
- Chart rendering with real data
- Loading state displays
- Error state handling
- Responsive layout behavior

#### API Integration Tests
- Successful data fetching
- Error response handling
- Loading state management
- Data transformation accuracy

### Performance Testing

- Dashboard load time under 2 seconds
- Database query optimization
- Concurrent user load testing
- Memory usage monitoring

## Implementation Considerations

### Database Query Optimization

- Use Prisma aggregation functions for efficient counting
- Index optimization for date-based queries
- Batch queries to reduce database round trips
- Caching strategies for frequently accessed data

### Security Considerations

- JWT authentication for all dashboard endpoints
- Input validation for date parameters
- Rate limiting for dashboard API calls
- Sanitization of aggregated data responses

### Performance Optimization

- Database connection pooling
- Response caching for static periods
- Lazy loading of chart components
- Debounced refresh mechanisms

### Scalability Considerations

- Pagination for large datasets
- Background job processing for heavy calculations
- CDN caching for static dashboard assets
- Database read replicas for analytics queries