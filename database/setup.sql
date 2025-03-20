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

-- Session Table
CREATE TABLE "Session" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create Indexes
CREATE INDEX "ChatSession_userId_idx" ON "ChatSession"("userId");
CREATE INDEX "ChatSession_agentId_idx" ON "ChatSession"("agentId");
CREATE INDEX "Message_sessionId_idx" ON "Message"("sessionId");
CREATE INDEX "Session_userId_idx" ON "Session"("userId"); 