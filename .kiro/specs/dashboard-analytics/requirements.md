# Requirements Document

## Introduction

This feature will replace the hardcoded dashboard data with real-time analytics from the backend. The dashboard currently displays static values for total bookings, active users, revenue, booking trends, and court utilization. We need to create backend endpoints that provide actual data and update the frontend to consume these endpoints, giving administrators meaningful insights into their court booking system.

## Requirements

### Requirement 1

**User Story:** As an administrator, I want to see real-time booking statistics on the dashboard, so that I can monitor the current performance of my court booking system.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display the actual total number of bookings for the current month
2. WHEN the dashboard loads THEN the system SHALL display the actual number of active users currently online or recently active
3. WHEN the dashboard loads THEN the system SHALL display the actual revenue generated for the current month
4. WHEN any of these metrics change THEN the system SHALL reflect the updated values on the next dashboard refresh

### Requirement 2

**User Story:** As an administrator, I want to see booking trends over time, so that I can understand usage patterns and plan accordingly.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display a bar chart showing actual daily booking counts for the current week
2. WHEN the week changes THEN the system SHALL update the chart to show the new week's data
3. WHEN there are no bookings for a day THEN the system SHALL display zero for that day
4. WHEN hovering over chart bars THEN the system SHALL show the exact number of bookings for that day

### Requirement 3

**User Story:** As an administrator, I want to see court utilization statistics, so that I can understand which court types are most popular and optimize my offerings.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display a pie chart showing actual utilization percentages by court type
2. WHEN calculating utilization THEN the system SHALL base percentages on actual booking hours vs available hours for each court type
3. WHEN there are no bookings for a court type THEN the system SHALL display 0% utilization for that type
4. WHEN hovering over chart segments THEN the system SHALL show the exact utilization percentage and court type name

### Requirement 4

**User Story:** As an administrator, I want the dashboard data to load quickly and handle errors gracefully, so that I can always access the information I need.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL fetch all analytics data within 2 seconds under normal conditions
2. WHEN an API endpoint fails THEN the system SHALL display an appropriate error message instead of the affected metric
3. WHEN the network is unavailable THEN the system SHALL show cached data if available or a "Data unavailable" message
4. WHEN data is loading THEN the system SHALL display loading indicators for each metric section

### Requirement 5

**User Story:** As an administrator, I want to see today's bookings summary on the dashboard, so that I can quickly understand the current day's activity and manage operations effectively.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display the actual number of bookings scheduled for today
2. WHEN the dashboard loads THEN the system SHALL display the number of completed bookings for today
3. WHEN the dashboard loads THEN the system SHALL display the number of pending/confirmed bookings remaining for today
4. WHEN the day changes THEN the system SHALL automatically update to show the new day's booking data
5. WHEN there are no bookings for today THEN the system SHALL display zero values with appropriate messaging

### Requirement 6

**User Story:** As an administrator, I want the dashboard to be responsive and work on different devices, so that I can check analytics from anywhere.

#### Acceptance Criteria

1. WHEN viewing the dashboard on mobile devices THEN the system SHALL display metrics in a single column layout
2. WHEN viewing the dashboard on tablets THEN the system SHALL maintain readability of charts and metrics
3. WHEN viewing the dashboard on desktop THEN the system SHALL display the full three-column layout for metrics
4. WHEN charts are displayed on smaller screens THEN the system SHALL maintain their functionality and readability