// Cypress test script for agent dashboard UI
// Run with: npx cypress run --spec "cypress/e2e/agent-dashboard.spec.js"

describe("Agent Dashboard Tests", () => {
  beforeEach(() => {
    // Mock the agent authentication
    cy.intercept("GET", "/api/agent/me", {
      fixture: "agent.json",
    }).as("getAgentProfile");

    // Mock the dashboard stats
    cy.intercept("GET", "/api/agent/dashboard-stats", {
      fixture: "dashboard-stats.json",
    }).as("getDashboardStats");

    // Mock the recent activity
    cy.intercept("GET", "/api/agent/recent-activity", {
      fixture: "recent-activity.json",
    }).as("getRecentActivity");

    // Mock active sessions
    cy.intercept("GET", "/api/agent/sessions?status=active*", {
      fixture: "active-sessions.json",
    }).as("getActiveSessions");

    // Mock waiting sessions
    cy.intercept("GET", "/api/agent/sessions?status=waiting*", {
      fixture: "waiting-sessions.json",
    }).as("getWaitingSessions");

    // Mock the analytics data
    cy.intercept("GET", "/api/agent/analytics*", {
      fixture: "analytics.json",
    }).as("getAnalytics");

    // Visit the dashboard page
    cy.visit("/agent-dashboard");
    cy.wait("@getAgentProfile");
    cy.wait("@getDashboardStats");
    cy.wait("@getRecentActivity");
  });

  it("should load the main dashboard page correctly", () => {
    // Verify page title and welcome message
    cy.contains("h1", "Welcome").should("be.visible");
    cy.get(".connection-status").should("be.visible");

    // Check if stats cards are displayed
    cy.contains("Active Chats").should("be.visible");
    cy.contains("Waiting Customers").should("be.visible");
    cy.contains("Resolved Today").should("be.visible");
    cy.contains("Avg Response Time").should("be.visible");
    cy.contains("Total Sessions Today").should("be.visible");

    // Check if quick actions section is visible
    cy.contains("h2", "Quick Actions").should("be.visible");
    cy.contains("View Active Chats").should("be.visible");
    cy.contains("View Chat History").should("be.visible");

    // Check if recent activity section is visible
    cy.contains("h2", "Recent Activity").should("be.visible");
  });

  it("should navigate to active chats page", () => {
    cy.contains("View Active Chats").click();
    cy.url().should("include", "/agent-dashboard/active-chats");
    cy.contains("Active Chats").should("be.visible");
  });

  it("should navigate to waiting chats page", () => {
    cy.contains("Check Waiting Queue").click();
    cy.url().should("include", "/agent-dashboard/waiting-chats");
    cy.contains("Waiting Customers").should("be.visible");
  });

  it("should navigate to chat history page", () => {
    cy.contains("View Chat History").click();
    cy.url().should("include", "/agent-dashboard/history");
    cy.contains("Chat History").should("be.visible");

    // Check search functionality
    cy.get('input[placeholder*="Search"]').should("be.visible");
    cy.get("select#dateFilter").should("be.visible");

    // Check if the table is displayed when data is available
    cy.get("table").should("be.visible");
    cy.contains("Customer").should("be.visible");
    cy.contains("Last Message").should("be.visible");
    cy.contains("Date").should("be.visible");
    cy.contains("Messages").should("be.visible");
    cy.contains("Actions").should("be.visible");

    // Test pagination if available
    cy.get('nav[aria-label="Pagination"]').then(($pagination) => {
      if ($pagination.length > 0) {
        cy.get("button").contains("2").click();
        cy.wait("@getHistorySessions");
        cy.url().should("include", "page=2");
      }
    });

    // Test search functionality
    const searchTerm = "test customer";
    cy.get('input[placeholder*="Search"]').type(searchTerm);
    cy.get("form").submit();
    cy.wait("@getHistorySessions");
    cy.url().should("include", `search=${encodeURIComponent(searchTerm)}`);

    // Test date filter
    cy.get("select#dateFilter").select("today");
    cy.wait("@getHistorySessions");
    cy.url().should("include", "date=today");
  });

  it("should navigate to analytics page", () => {
    // Navigate to analytics page
    cy.visit("/agent-dashboard/analytics");
    cy.wait("@getAnalytics");

    // Check page title
    cy.contains("Agent Performance Analytics").should("be.visible");

    // Check date range selector
    cy.contains("This Week").should("be.visible");
    cy.contains("This Month").should("be.visible");
    cy.contains("All Time").should("be.visible");

    // Check metrics sections
    cy.contains("Chat Sessions Today").should("be.visible");
    cy.contains("Resolution Rate").should("be.visible");
    cy.contains("Average Response Time").should("be.visible");
    cy.contains("Total Chat Sessions").should("be.visible");

    // Check charts
    cy.contains("Busiest Days").should("be.visible");
    cy.contains("Peak Hours").should("be.visible");

    // Check insights section
    cy.contains("Performance Insights").should("be.visible");

    // Test date range filter
    cy.contains("This Week").click();
    cy.wait("@getAnalytics");
    cy.url().should("include", "range=week");

    cy.contains("All Time").click();
    cy.wait("@getAnalytics");
    cy.url().should("include", "range=all");
  });

  it("should test error handling on dashboard", () => {
    // Set up error response for dashboard stats
    cy.intercept("GET", "/api/agent/dashboard-stats", {
      statusCode: 500,
      body: { error: "Server error" },
    }).as("getDashboardStatsError");

    // Reload the page
    cy.visit("/agent-dashboard");
    cy.wait("@getAgentProfile");
    cy.wait("@getDashboardStatsError");

    // Check error message is displayed
    cy.contains("Failed to load dashboard data").should("be.visible");
    cy.get("button").contains("×").click();
    cy.contains("Failed to load dashboard data").should("not.exist");
  });
});

// Test fixture examples to create (in cypress/fixtures directory):

/*
agent.json:
{
  "authenticated": true,
  "agent": {
    "id": "agent123",
    "user": {
      "id": "user123",
      "name": "Test Agent",
      "email": "test@example.com",
      "role": "agent"
    }
  },
  "stats": {
    "activeSessions": 2,
    "waitingSessions": 3
  }
}

dashboard-stats.json:
{
  "totalSessionsToday": 10,
  "resolvedSessions": 5,
  "avgResponseTime": 120
}

recent-activity.json:
{
  "activities": [
    {
      "type": "new_session",
      "content": "Customer started a new chat session",
      "timestamp": "5 minutes ago",
      "sessionId": "session123"
    },
    {
      "type": "message",
      "content": "You sent a message: \"How can I help you today?\"",
      "timestamp": "3 minutes ago",
      "sessionId": "session123"
    },
    {
      "type": "session_closed",
      "content": "Chat session with Customer was closed",
      "timestamp": "1 minute ago",
      "sessionId": "session456"
    }
  ]
}

analytics.json:
{
  "metrics": {
    "sessions": {
      "today": 5,
      "yesterday": 8,
      "week": 35,
      "month": 120,
      "total": 450
    },
    "resolutionRate": 85,
    "avgResponseTime": 45,
    "sessionsByDay": [
      { "day": "Monday", "count": 25 },
      { "day": "Tuesday", "count": 18 },
      { "day": "Friday", "count": 15 }
    ],
    "sessionsByHour": [
      { "hour": 14, "count": 15 },
      { "hour": 11, "count": 12 },
      { "hour": 15, "count": 10 },
      { "hour": 10, "count": 8 },
      { "hour": 16, "count": 7 }
    ],
    "peakHour": 14
  }
}

active-sessions.json:
{
  "sessions": [
    {
      "id": "session123",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "status": "active",
      "createdAt": "2023-05-15T10:30:00Z",
      "updatedAt": "2023-05-15T10:35:00Z",
      "lastMessage": "Hi, I need help with my order",
      "messageCount": 5
    },
    {
      "id": "session124",
      "customerName": "Jane Smith",
      "customerEmail": "jane@example.com",
      "status": "active",
      "createdAt": "2023-05-15T11:20:00Z",
      "updatedAt": "2023-05-15T11:25:00Z",
      "lastMessage": "When will my order be delivered?",
      "messageCount": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 2,
    "totalPages": 1
  }
}

waiting-sessions.json:
{
  "sessions": [
    {
      "id": "session125",
      "customerName": "Alice Johnson",
      "customerEmail": "alice@example.com",
      "status": "waiting",
      "createdAt": "2023-05-15T09:45:00Z",
      "updatedAt": "2023-05-15T09:45:00Z",
      "lastMessage": "Hello, is anyone available?",
      "messageCount": 1
    },
    {
      "id": "session126",
      "customerName": "Bob Williams",
      "customerEmail": "bob@example.com",
      "status": "waiting",
      "createdAt": "2023-05-15T10:10:00Z",
      "updatedAt": "2023-05-15T10:10:00Z",
      "lastMessage": "I need assistance with my recent purchase",
      "messageCount": 1
    },
    {
      "id": "session127",
      "customerName": "Carol Brown",
      "customerEmail": "carol@example.com",
      "status": "waiting",
      "createdAt": "2023-05-15T10:20:00Z",
      "updatedAt": "2023-05-15T10:20:00Z",
      "lastMessage": "Can someone help me with the checkout process?",
      "messageCount": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 3,
    "totalPages": 1
  }
}
*/
