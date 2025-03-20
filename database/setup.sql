-- Setup tables for BGE Chatbot

-- User Table
CREATE TABLE "User" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT,
  "email" TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  "password" TEXT,
  "role" TEXT DEFAULT 'customer' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT now() NOT NULL
);
-- Enable RLS for User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
-- Create policy to allow authenticated users to view their own records
CREATE POLICY user_self_access ON "User" 
  FOR ALL USING (auth.uid() = id);

-- Agent Table
CREATE TABLE "Agent" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL UNIQUE,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "isAvailable" BOOLEAN DEFAULT false NOT NULL,
  "role" TEXT DEFAULT 'agent' NOT NULL,
  "lastActive" TIMESTAMP DEFAULT now() NOT NULL,
  "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
-- Enable RLS for Agent table
ALTER TABLE "Agent" ENABLE ROW LEVEL SECURITY;
-- Create policy for agents
CREATE POLICY agent_access_policy ON "Agent" 
  FOR ALL USING (auth.uid() IN (SELECT "userId" FROM "User" WHERE "role" = 'agent' OR "role" = 'admin'));

-- ChatSession Table
CREATE TABLE "ChatSession" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID,
  "agentId" UUID,
  "isLiveChat" BOOLEAN DEFAULT false NOT NULL,
  "status" TEXT,
  "customerEmail" TEXT,
  "customerName" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
  "closedAt" TIMESTAMP,
  "closedReason" TEXT,
  "isAgentTyping" BOOLEAN DEFAULT false NOT NULL,
  "isCustomerTyping" BOOLEAN DEFAULT false NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL,
  FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL
);
-- Enable RLS for ChatSession table
ALTER TABLE "ChatSession" ENABLE ROW LEVEL SECURITY;
-- Create policy for chat sessions
CREATE POLICY chat_session_policy ON "ChatSession"
  FOR ALL USING (
    auth.uid() = "userId" OR 
    auth.uid() IN (SELECT "userId" FROM "Agent" WHERE "id" = "agentId") OR
    auth.uid() IN (SELECT "userId" FROM "User" WHERE "role" = 'admin')
  );

-- Message Table
CREATE TABLE "Message" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "sessionId" UUID NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT,
  "timestamp" TIMESTAMP DEFAULT now() NOT NULL,
  "metadata" JSONB,
  FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE
);
-- Enable RLS for Message table
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
-- Create policy for messages
CREATE POLICY message_policy ON "Message"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "ChatSession" 
      WHERE "ChatSession"."id" = "Message"."sessionId" 
      AND (
        "ChatSession"."userId" = auth.uid() OR
        EXISTS (
          SELECT 1 FROM "Agent" 
          WHERE "Agent"."id" = "ChatSession"."agentId" 
          AND "Agent"."userId" = auth.uid()
        ) OR
        auth.uid() IN (SELECT "userId" FROM "User" WHERE "role" = 'admin')
      )
    )
  );

-- Session Table
CREATE TABLE "Session" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
-- Enable RLS for Session table
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
-- Create policy for sessions
CREATE POLICY session_policy ON "Session"
  FOR ALL USING (auth.uid() = "userId" OR auth.uid() IN (SELECT "userId" FROM "User" WHERE "role" = 'admin'));

-- Create Indexes
CREATE INDEX "ChatSession_userId_idx" ON "ChatSession"("userId");
CREATE INDEX "ChatSession_agentId_idx" ON "ChatSession"("agentId");
CREATE INDEX "Message_sessionId_idx" ON "Message"("sessionId");
CREATE INDEX "Session_userId_idx" ON "Session"("userId"); 