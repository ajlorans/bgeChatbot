# 🥚 Big Green Egg AI Chatbot with Live Agent Support

<div align="center">
  <img src="https://i.imgur.com/YOUR_LOGO_HERE.png" alt="BGE Chatbot Logo" width="200"/>
  <p><em>A powerful Next.js-based AI chatbot for Big Green Egg, featuring order tracking, product recommendations, customer support, cooking tips, and now with <strong>live agent chat support</strong>!</em></p>
</div>

## 🚀 Features

- 🤖 **AI-powered chat interface** - Answers product questions, provides cooking tips, and more
- 📦 **Order status tracking** - With email and order number validation
- 🛍️ **Product recommendations** - Suggests relevant products based on customer inquiries
- 🤝 **Enhanced customer support** - With guided assistance
- 👨‍🍳 **Detailed cooking instructions** - Including recipes and techniques
- 🍕 **Specialized cooking guides** - Like pizza cooking
- 💬 **Real-time chat** - With quick action buttons
- 👩‍💼 **Live agent support** - Connect customers with real support agents
- 🖥️ **Agent dashboard** - Manage live chat sessions with customers
- 🔄 **Real-time updates** - Socket.io integration for instant messaging
- 🔐 **Agent authentication** - Secure login for support staff
- 📊 **Session management** - Track active and waiting chat sessions
- 📋 **Order status form** - With input validation
- 🎨 **Customizable theme colors** - Match your brand identity
- 📱 **Responsive design** - Works on all devices
- 🧪 **Comprehensive unit tests** - Ensuring reliability

## 📣 Recent Updates (Shopify Integration Ready)

### 🛒 Shopify Integration

- **Shopify Compatible**: Designed to be embedded directly into Shopify storefronts
- **Standalone Widget Support**: Framework for embedding chatbot across different sites
- **Cross-Domain Communication**: Enhanced API routes with CORS support for cross-domain embedding
- **Enhanced UI**: Improved recipe display with better styling and title formatting
- **Optimized Message Styling**: Cleaner message templates without redundant headers
- **Fixed Recipe Detection**: Improved recipe detection to properly identify specific recipe requests

### 💼 Enhanced Agent Dashboard

- **Multi-Agent Support**: Fully tested support for multiple agents handling customer inquiries
- **Agent Workload Distribution**: System for distributing incoming chat requests among available agents
- **Chat Transfer Capabilities**: Ability to transfer chats between agents when needed
- **Comprehensive Analytics**: Track agent performance, response times, and customer satisfaction
- **Improved API Error Handling**: Better error reporting and handling for agent dashboard operations

### 🛠️ Bug Fixes & Improvements

- **Fixed Recipe Step Formatting**: Eliminated duplicate numbering in recipe instructions
- **Enhanced Product Recognition**: Improved detection of accessory inquiries
- **Fixed Message Header Display**: Removed incorrect recipe headers from different message types
- **Improved Accessory Information**: Enhanced accessory details and fixed broken links
- **Fixed Recipe Recognition**: Improved detection of specific recipe requests for immediate handling

### 👥 Multi-Agent System Improvements

- **Accurate Agent Status Display**: Enhanced agent dashboard to clearly show which agents are truly logged in vs. just recently active
- **Automatic Session Cleanup**: Added logic to automatically close inactive chat sessions and move them to history
- **Session Abandonment Detection**: System now detects when customers leave or close their browser and marks sessions accordingly
- **Agent Login Indicators**: Added visual indicators in the agent team view showing which agents are currently logged in
- **Improved Agent Workload Management**: Agents now only see chats that are specifically assigned to them
- **Agent Name Display**: Customer chat now displays the actual name of the agent they're speaking with
- **Reduced Console Output**: Performance optimization to minimize log output and improve system responsiveness

## 💻 Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- Shopify API
- Prisma ORM
- PostgreSQL
- Socket.io
- JWT Authentication
- Jest and React Testing Library

## 🏁 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Vercel account (for deployment)
- Supabase account (for database)
- OpenAI API key

### Local Development

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/bgeChatbot.git
   cd bgeChatbot
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file with the following variables:

   ```env
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key

   # Shopify Integration
   SHOPIFY_STORE_URL=your_shopify_store.myshopify.com
   SHOPIFY_ACCESS_TOKEN=your_shopify_access_token

   # Database (Local Development)
   DATABASE_URL="file:./dev.db"

   # JWT Secret for Authentication
   JWT_SECRET="generate_a_strong_secret_here"

   # Prisma
   PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=true
   ```

4. Initialize the database

   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. Run the development server

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) for the customer-facing chatbot, and [http://localhost:3000/agent-dashboard](http://localhost:3000/agent-dashboard) for the agent dashboard.

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deployment Steps

1. Update environment variables for production
2. Push your code to a GitHub repository
3. Deploy to Vercel
4. Update your Shopify theme to include the embed script
5. Set up your agent accounts

## 🏛️ Project Structure

- `/src/app`: Next.js app directory
  - `/agent-dashboard`: Admin dashboard for agents
  - `/api`: API routes for chatbot and live chat functionality
  - `/widget`: Embeddable widget page
- `/src/components`: React components
- `/src/lib`: Utility functions and hooks
- `/prisma`: Database schema and migrations
- `/public`: Static assets including embed script

## 🧩 Chatbot Widget Integration

To embed the chatbot on your Shopify store:

1. Update the `CHATBOT_URL` in `public/embed.js` with your Vercel deployment URL
2. Add the following script to your Shopify theme:
   ```html
   <script
     src="https://your-vercel-app.vercel.app/embed.js"
     async
     defer
   ></script>
   ```

## 👨‍💼 Agent Dashboard

The agent dashboard provides a comprehensive interface for managing live customer chats:

- **Login**: Secure authentication for authorized support agents
- **Dashboard Overview**: Statistics on active chats, waiting customers, and recently closed sessions
- **Active Chats**: Real-time list of ongoing customer conversations
- **Waiting Chats**: Queue of customers waiting for agent assistance
- **Chat History**: Record of past chat sessions for reference
- **Real-time Messaging**: Instant communication with customers

Default agent credentials:

- Email: agent@example.com
- Password: agent123

## 🧪 Testing

The project includes a comprehensive test suite using Jest and React Testing Library:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

The test suite includes:

- API route tests for order pattern recognition, cooking queries, assembly guides, and customer support
- Component tests for the OrderStatusForm, Chatbot, and LiveChat components
- Socket.io integration tests
- Utility function tests

## ⚙️ Environment Variables

| Variable                            | Description                                  | Required |
| ----------------------------------- | -------------------------------------------- | -------- |
| OPENAI_API_KEY                      | Your OpenAI API key                          | Yes      |
| DATABASE_URL                        | Database connection string                   | Yes      |
| SHOPIFY_STORE_URL                   | Your Shopify store URL                       | Yes      |
| SHOPIFY_ACCESS_TOKEN                | Shopify API access token                     | Yes      |
| JWT_SECRET                          | Secret for JWT authentication                | Yes      |
| ALLOWED_ORIGINS                     | Comma-separated list of allowed CORS origins | No       |
| PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK | Set to "true" for Vercel deployment          | Yes      |

## 🔄 Socket.io Communication Architecture

The live-agent-session-ending branch implements an enhanced Socket.io architecture:

1. **Multi-channel Delivery**: Messages are sent through multiple channels to ensure delivery:

   - Direct to specific session rooms
   - To role-based rooms (agents/customers)
   - Global broadcasts as fallback

2. **Room Management**:

   - Users are automatically added to role-based rooms upon connection
   - Session IDs are explicitly converted to strings for consistent room naming
   - Sessions have dedicated rooms for targeted communication

3. **Message Deduplication**:

   - Messages are checked for duplicates by ID
   - Content-based duplicate detection prevents similar messages
   - Timestamp proximity checks prevent duplicates with different IDs

4. **Fallback Mechanisms**:
   - Periodic polling refreshes data if socket events are missed
   - Session status is periodically checked to detect changes
   - System messages are generated for important events like chat ending

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [OpenAI](https://openai.com/) for the AI capabilities
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Socket.io](https://socket.io/) for real-time communication
- [Prisma](https://www.prisma.io/) for database ORM
- [Headless UI](https://headlessui.dev/) for accessible components
- [Heroicons](https://heroicons.com/) for icons
- [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for testing
