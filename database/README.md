# Manual Database Setup for BGE Chatbot

This directory contains SQL scripts for manually setting up the BGE Chatbot database in Supabase.

## Why Manual Setup?

We're using a manual setup approach instead of relying on Prisma migrations because:

1. It provides more control over the database structure
2. It avoids connection timeout issues that can occur with Prisma migrations
3. It ensures a consistent database setup regardless of environment

## Setup Instructions

### 1. Create Tables

1. Log in to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `setup.sql`
4. Paste into the SQL Editor and run the queries
5. Verify that all tables are created successfully

### 2. Seed Initial Data

1. Once tables are created, copy the contents of `seed.sql`
2. Paste into the SQL Editor and run the queries
3. This will create:
   - A test agent user (email: agent@example.com, password: agent123)
   - An admin user (email: admin@example.com, password: admin123)
   - A sample chat session with messages

### 3. Test the Connection

After setting up the database, you can test the connection from your local environment:

```bash
npm run db:test-connection
```

This script will:

- Verify the database connection
- List available tables
- Check access to User and Agent tables

## Database Schema

The schema includes the following tables:

- **User**: Stores user information for both customers and agents
- **Agent**: Stores agent-specific information, linked to a User
- **ChatSession**: Stores chat sessions between customers and agents/AI
- **Message**: Stores individual messages in chat sessions
- **Session**: Stores authentication sessions

## Troubleshooting

If you encounter connection issues:

1. **Check your DATABASE_URL**: Make sure your .env file has the correct connection string:

   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-SUPABASE-PROJECT-ID].supabase.co:5432/postgres"
   ```

2. **Network Restrictions**: Ensure your IP address is allowed in Supabase

3. **Credentials**: Double-check your database password

4. **Database Service**: Verify that your Supabase project is active and running
