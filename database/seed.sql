-- Seed data for BGE Chatbot

-- Create a test agent user
-- Password is 'agent123' hashed with bcrypt
INSERT INTO "User" ("name", "email", "password", "role")
VALUES ('Test Agent', 'agent@example.com', '$2a$10$BVtRnNB9l9nNO.vRnQvt7uLrOYG.tFKFuF.kLXcF5Ql6YNjtjC75y', 'agent');

-- Create an agent linked to the user
INSERT INTO "Agent" ("userId", "isActive", "isAvailable", "role")
VALUES 
((SELECT "id" FROM "User" WHERE "email" = 'agent@example.com'), true, true, 'agent');

-- Create an admin user
-- Password is 'admin123' hashed with bcrypt
INSERT INTO "User" ("name", "email", "password", "role")
VALUES ('Admin User', 'admin@example.com', '$2a$10$X6aJwMTy1Ge8JSL9lRqTzOUVpjEVWAj6J28RcxR6hCOk2.XJdxOhm', 'admin');

-- Create sample chat session
INSERT INTO "ChatSession" ("isLiveChat", "status", "customerEmail", "customerName")
VALUES (false, 'ended', 'customer@example.com', 'Sample Customer');

-- Add some sample messages to the chat session
INSERT INTO "Message" ("sessionId", "role", "content", "category")
VALUES 
((SELECT "id" FROM "ChatSession" WHERE "customerEmail" = 'customer@example.com' LIMIT 1), 'user', 'Hello, I have a question about Big Green Egg accessories.', 'general'),
((SELECT "id" FROM "ChatSession" WHERE "customerEmail" = 'customer@example.com' LIMIT 1), 'assistant', 'Hi there! I''d be happy to help with your question about Big Green Egg accessories. What would you like to know?', 'general'); 