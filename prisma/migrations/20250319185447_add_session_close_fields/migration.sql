-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "agentId" TEXT,
    "isLiveChat" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "closedAt" DATETIME,
    "closedReason" TEXT,
    "isAgentTyping" BOOLEAN NOT NULL DEFAULT false,
    "isCustomerTyping" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChatSession_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ChatSession" ("agentId", "createdAt", "customerEmail", "customerName", "id", "isLiveChat", "metadata", "status", "updatedAt", "userId") SELECT "agentId", "createdAt", "customerEmail", "customerName", "id", "isLiveChat", "metadata", "status", "updatedAt", "userId" FROM "ChatSession";
DROP TABLE "ChatSession";
ALTER TABLE "new_ChatSession" RENAME TO "ChatSession";
CREATE INDEX "ChatSession_userId_idx" ON "ChatSession"("userId");
CREATE INDEX "ChatSession_agentId_idx" ON "ChatSession"("agentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
