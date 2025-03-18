# Agent Dashboard Testing Checklist

This document provides a comprehensive testing checklist for the agent dashboard system. Use this checklist to manually verify that all components are working as expected.

## Prerequisites

- Ensure your development server is running (`npm run dev`)
- Have valid agent credentials to log in
- Create mock chat sessions with different statuses (active, waiting, closed)

## API Endpoint Tests

You can use the `test-agent-dashboard.mjs` script to automatically test all API endpoints:

```bash
node test-agent-dashboard.mjs
```

Alternatively, you can manually test each endpoint:

- [ ] `/api/agent/me` - Returns authenticated agent information
- [ ] `/api/agent/dashboard-stats` - Returns key metrics for the dashboard
- [ ] `/api/agent/recent-activity` - Returns recent activity items
- [ ] `/api/agent/analytics` - Returns analytics data
- [ ] `/api/agent/sessions` - Returns chat sessions with pagination

## Main Dashboard Page Tests

- [ ] Dashboard loads without errors
- [ ] Agent name appears in the welcome message
- [ ] Connection status indicator shows correctly
- [ ] Stats cards display correctly:
  - [ ] Active Chats count
  - [ ] Waiting Customers count
  - [ ] Resolved Today count
  - [ ] Average Response Time
  - [ ] Total Sessions Today
- [ ] Quick Actions links work:
  - [ ] "View Active Chats" navigates to active chats page
  - [ ] "Check Waiting Queue" navigates to waiting chats page
  - [ ] "View Chat History" navigates to history page
- [ ] Recent Activity section displays activities
- [ ] Empty state is handled correctly when no activities

## Active Chats Page Tests

- [ ] Page loads without errors
- [ ] Active chat sessions are displayed in a list
- [ ] Each chat session displays customer information correctly
- [ ] Each chat session displays message count and last message
- [ ] "View Details" button navigates to the correct session
- [ ] Empty state is handled correctly when no active chats
- [ ] Error states are handled correctly

## Waiting Chats Page Tests

- [ ] Page loads without errors
- [ ] Waiting chat sessions are displayed in a list
- [ ] Each chat session displays customer information correctly
- [ ] Each chat session displays message count and wait time
- [ ] "Assist" button navigates to the correct session
- [ ] Empty state is handled correctly when no waiting chats
- [ ] Error states are handled correctly

## Chat History Page Tests

- [ ] Page loads without errors
- [ ] Closed chat sessions are displayed in a table
- [ ] Each row displays customer information correctly
- [ ] Each row displays last message and date
- [ ] "View Details" button navigates to the correct session
- [ ] Pagination works correctly:
  - [ ] Page numbers are displayed correctly
  - [ ] Next and previous buttons work
  - [ ] Current page is highlighted
- [ ] Search functionality works:
  - [ ] Searching by customer name returns correct results
  - [ ] Searching by email returns correct results
- [ ] Date filter works:
  - [ ] "Today" filter shows only today's sessions
  - [ ] "Yesterday" filter shows only yesterday's sessions
  - [ ] "Last 7 days" filter shows correct date range
  - [ ] "Last 30 days" filter shows correct date range
  - [ ] "Last 90 days" filter shows correct date range
- [ ] Empty state is handled correctly when no history or no search results
- [ ] Error states are handled correctly

## Analytics Page Tests

- [ ] Page loads without errors
- [ ] Metrics cards display correctly:
  - [ ] Chat Sessions Today
  - [ ] Resolution Rate
  - [ ] Average Response Time
  - [ ] Total Chat Sessions
- [ ] Charts render correctly:
  - [ ] Busiest Days chart
  - [ ] Peak Hours chart
- [ ] Performance Insights section shows relevant recommendations
- [ ] Date range filters work:
  - [ ] "This Week" filter updates the analytics data
  - [ ] "This Month" filter updates the analytics data
  - [ ] "All Time" filter updates the analytics data
- [ ] Empty state is handled correctly when no analytics data
- [ ] Error states are handled correctly

## Session Detail Page Tests

- [ ] Page loads without errors
- [ ] Customer information is displayed correctly
- [ ] Chat messages are displayed in the correct order
- [ ] System messages are styled differently
- [ ] Message timestamps are displayed correctly
- [ ] Message input field works correctly
- [ ] Send button works correctly
- [ ] Session status is displayed correctly
- [ ] Close session button works (if session is active)
- [ ] Error states are handled correctly

## Cross-cutting Concerns

- [ ] Authentication works correctly (redirects to login if not authenticated)
- [ ] Loading states are shown appropriately during data fetching
- [ ] Error messages are displayed correctly and can be dismissed
- [ ] Responsive design works on different screen sizes
- [ ] Real-time updates work when new waiting sessions are created
- [ ] Real-time updates work when sessions are closed

## Edge Cases

- [ ] Handling of very long customer names or email addresses
- [ ] Handling of very long messages
- [ ] Handling of a large number of sessions (pagination works correctly)
- [ ] Handling of a large number of messages in a session
- [ ] Handling of network failures and reconnection
- [ ] Handling of session timeouts or expired sessions

## Performance Tests

- [ ] Dashboard loads quickly (under 2 seconds)
- [ ] Charts render quickly (under 1 second)
- [ ] History page handles large datasets efficiently
- [ ] Analytics calculations don't cause UI blocking

## Automated Tests

In addition to manual testing, run the automated Cypress tests:

```bash
# Install Cypress if not already installed
npm install cypress --save-dev

# Run Cypress tests
npx cypress run --spec "cypress/e2e/agent-dashboard.spec.js"
```

## Reporting Issues

If you find any issues during testing, please:

1. Take a screenshot of the issue
2. Note the steps to reproduce the issue
3. Note the expected behavior vs. actual behavior
4. Check browser console for any errors
5. Create an issue in the project repository with all the above information
