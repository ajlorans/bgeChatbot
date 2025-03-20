# Deployment Guide for BGE Chatbot

This guide provides step-by-step instructions for deploying the BGE Chatbot to Vercel and embedding it on your Shopify store.

## Part 1: Setting up Supabase Database

1. **Create a Supabase Account and Project**

   - Go to [Supabase](https://supabase.com/) and sign up or log in
   - Create a new project and note down your project URL and database credentials
   - In the Supabase dashboard, go to Project Settings > Database to find your connection string

2. **Update Environment Variables**

   - In your `.env` file, replace the placeholder DATABASE_URL with the Supabase connection string:
     ```
     DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-SUPABASE-PROJECT-ID].supabase.co:5432/postgres"
     ```

3. **Migrate Database Schema**
   - Run the following command to push your schema to Supabase:
     ```
     npx prisma db push
     ```
   - Seed your database (optional):
     ```
     npm run db:seed
     ```

## Manual Database Setup

The database has been set up manually in Supabase. If you need to recreate the database:

1. Use the SQL scripts in the `database/setup.sql` file to create tables
2. Use the SQL scripts in the `database/seed.sql` file to create initial data

## Part 2: Deploying to Vercel

1. **Prepare for Deployment**

   - Make sure your code is committed to a Git repository (GitHub, GitLab, or Bitbucket)
   - Ensure your `package.json` includes the build and postinstall scripts:
     ```json
     "build": "prisma generate && next build",
     "postinstall": "prisma generate"
     ```

2. **Deploy to Vercel**

   - Go to [Vercel](https://vercel.com/) and sign up or log in
   - Click "New Project" and import your repository
   - Configure the project:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: leave as default (uses package.json)

3. **Configure Environment Variables**

   - Add the following environment variables in the Vercel project settings:
     - DATABASE_URL (your Supabase connection string)
     - OPENAI_API_KEY
     - SHOPIFY_STORE_URL
     - SHOPIFY_ACCESS_TOKEN
     - JWT_SECRET
     - ALLOWED_ORIGINS (comma-separated list including your Shopify store URL)
     - PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=true

4. **Deploy Project**
   - Click "Deploy" and wait for the build to complete
   - Once deployed, note down your Vercel project URL (e.g., `https://your-project.vercel.app`)

## Part 3: Embedding in Shopify

1. **Update Embed Script**

   - Open `public/embed.js` and update the `CHATBOT_URL` constant with your Vercel project URL:
     ```javascript
     const CHATBOT_URL = "https://your-project.vercel.app";
     ```
   - Redeploy to Vercel with this change

2. **Add to Shopify Theme**

   - Log into your Shopify admin dashboard
   - Go to Online Store > Themes > Current theme > Actions > Edit code
   - Locate the `theme.liquid` file (or footer section)
   - Add the following code at the bottom, just before the closing `</body>` tag:
     ```html
     <script
       src="https://your-project.vercel.app/embed.js"
       async
       defer
     ></script>
     ```

3. **Test the Integration**
   - Visit your Shopify store
   - The chatbot button should appear in the bottom-right corner
   - Click the button to open the chat widget
   - Test sending messages and using all features

## Part 4: Setting Up Agent Dashboard

1. **Create Admin User**

   - Navigate to `/agent-dashboard/signup` on your deployed Vercel app
   - Create an admin user account (this will be for your first customer support agent)

2. **Access Agent Dashboard**
   - Go to `/agent-dashboard` on your Vercel app
   - Log in with the admin credentials created in the previous step
   - From here, you can:
     - Monitor active chats
     - Respond to customer queries
     - View chat history
     - Manage agent accounts
     - View analytics

## Part 5: Maintenance and Monitoring

1. **Check Logs in Vercel**

   - Regularly check the Function Logs in Vercel dashboard for any errors
   - Address any recurring issues

2. **Monitor Database Usage**

   - Keep an eye on your Supabase database usage and limits
   - Implement a data retention policy if needed

3. **Update Dependencies**
   - Regularly update dependencies to ensure security and performance:
     ```
     npm update
     ```

## Troubleshooting

### Common Issues

1. **500 Internal Server Error when requesting agent**

   - Check if Supabase connection is working
   - Ensure DATABASE_URL is correctly set in Vercel environment variables
   - Check Vercel function logs for specific error messages

2. **CORS Issues**

   - Ensure your Shopify domain is added to the ALLOWED_ORIGINS env variable
   - Check CORS configuration in the app code

3. **Widget Not Loading**
   - Check browser console for JavaScript errors
   - Ensure the embed.js URL is correct in your Shopify theme

For further assistance, please refer to the project documentation or contact support.
