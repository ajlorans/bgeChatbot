// Test script for agent dashboard system
// Run this script with Node.js to verify API endpoints
// Usage: node test-agent-dashboard.mjs

import fetch from "node-fetch";

// Configuration
const BASE_URL = "http://localhost:3000"; // Update with your server URL
const TEST_TOKEN = "your_test_token"; // Update with an agent token for testing

// Helper function to make API requests with authentication
async function fetchWithAuth(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        Cookie: `agent_token=${TEST_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err.message);
    throw err;
  }
}

// Test functions
async function testAgentMe() {
  console.log("\n🔍 Testing /api/agent/me endpoint...");
  try {
    const data = await fetchWithAuth("/api/agent/me");
    console.log("✅ Agent Me API response:", JSON.stringify(data, null, 2));

    if (!data.authenticated || !data.agent) {
      console.warn("⚠️ Agent authentication response may be incomplete");
    } else {
      console.log(`✅ Authenticated as ${data.agent.user.name}`);
    }

    return data;
  } catch (err) {
    console.error("❌ Agent Me API test failed:", err.message);
    return null;
  }
}

async function testDashboardStats() {
  console.log("\n🔍 Testing /api/agent/dashboard-stats endpoint...");
  try {
    const data = await fetchWithAuth("/api/agent/dashboard-stats");
    console.log(
      "✅ Dashboard Stats API response:",
      JSON.stringify(data, null, 2)
    );

    if (
      typeof data.totalSessionsToday !== "number" ||
      typeof data.resolvedSessions !== "number" ||
      typeof data.avgResponseTime !== "number"
    ) {
      console.warn("⚠️ Dashboard stats may be incomplete or in wrong format");
    } else {
      console.log("✅ Dashboard stats data structure looks correct");
    }

    return data;
  } catch (err) {
    console.error("❌ Dashboard Stats API test failed:", err.message);
    return null;
  }
}

async function testRecentActivity() {
  console.log("\n🔍 Testing /api/agent/recent-activity endpoint...");
  try {
    const data = await fetchWithAuth("/api/agent/recent-activity");
    console.log(
      "✅ Recent Activity API response:",
      JSON.stringify(data, null, 2)
    );

    if (!Array.isArray(data.activities)) {
      console.warn("⚠️ Recent activity data is not an array");
    } else {
      console.log(`✅ Received ${data.activities.length} activity items`);

      // Verify structure of first activity item if available
      if (data.activities.length > 0) {
        const firstActivity = data.activities[0];
        if (
          !firstActivity.type ||
          !firstActivity.content ||
          !firstActivity.timestamp
        ) {
          console.warn("⚠️ Activity item is missing required fields");
        }
      }
    }

    return data;
  } catch (err) {
    console.error("❌ Recent Activity API test failed:", err.message);
    return null;
  }
}

async function testAnalytics() {
  console.log("\n🔍 Testing /api/agent/analytics endpoint...");
  try {
    const data = await fetchWithAuth("/api/agent/analytics");
    console.log("✅ Analytics API response:", JSON.stringify(data, null, 2));

    if (
      !data.metrics ||
      !data.metrics.sessions ||
      !data.metrics.sessionsByDay
    ) {
      console.warn("⚠️ Analytics data structure may be incomplete");
    } else {
      console.log("✅ Analytics data structure looks correct");
      console.log(`✅ Resolution rate: ${data.metrics.resolutionRate}%`);
      console.log(
        `✅ Average response time: ${data.metrics.avgResponseTime} seconds`
      );
    }

    return data;
  } catch (err) {
    console.error("❌ Analytics API test failed:", err.message);
    return null;
  }
}

async function testSessions(status = "closed") {
  console.log(
    `\n🔍 Testing /api/agent/sessions endpoint with status=${status}...`
  );
  try {
    const data = await fetchWithAuth(
      `/api/agent/sessions?status=${status}&page=1&limit=5`
    );
    console.log("✅ Sessions API response:", JSON.stringify(data, null, 2));

    if (!Array.isArray(data.sessions) || !data.pagination) {
      console.warn("⚠️ Sessions data structure may be incomplete");
    } else {
      console.log(`✅ Received ${data.sessions.length} sessions`);
      console.log(`✅ Total count: ${data.pagination.totalCount}`);
    }

    return data;
  } catch (err) {
    console.error("❌ Sessions API test failed:", err.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log("🚀 Starting Agent Dashboard API Tests");
  console.log("======================================");

  try {
    // Test the individual API endpoints
    await testAgentMe();
    await testDashboardStats();
    await testRecentActivity();
    await testAnalytics();
    await testSessions("active");
    await testSessions("waiting");
    await testSessions("closed");

    console.log("\n✅ All API tests completed!");
    console.log("\nNext steps for manual testing:");
    console.log("1. Open the agent dashboard in your browser");
    console.log(
      "2. Verify the main dashboard loads and displays stats correctly"
    );
    console.log(
      "3. Navigate to the Analytics page and check the visualizations"
    );
    console.log(
      "4. Test the History page with different filters and pagination"
    );
    console.log(
      "5. Check that real-time updates work when new sessions are created"
    );
  } catch (err) {
    console.error("\n❌ Test suite failed:", err.message);
  }
}

// Run all tests
runTests();
