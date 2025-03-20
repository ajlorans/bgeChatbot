# Big Green Egg AI Chatbot with Live Agent Support

A Next.js-based AI chatbot for Big Green Egg, featuring order tracking, product recommendations, customer support, cooking tips, and now with **live agent chat support**!

## Features

- 🤖 AI-powered chat interface
- 📦 Order status tracking with email and order number validation
- 🛍️ Product recommendations
- 🤝 Enhanced customer support with guided assistance
- 👨‍🍳 Detailed cooking instructions and recipes
- 🍕 Specialized cooking guides (like pizza cooking)
- 💬 Real-time chat with quick action buttons
- 👩‍💼 **Live agent support** - Connect customers with real support agents
- 🖥️ **Agent dashboard** - Manage live chat sessions with customers
- 🔄 **Real-time updates** - Socket.io integration for instant messaging
- 🔐 **Agent authentication** - Secure login for support staff
- 📊 **Session management** - Track active and waiting chat sessions
- 📋 Order status form with input validation
- 🎨 Customizable theme colors
- 📱 Responsive design
- 🧪 Comprehensive unit tests

## Recent Updates (tested-3-19-multi-agent-ready branch)

### Shopify Integration Ready

- **Shopify Compatible**: The chatbot is now designed to be embedded directly into Shopify storefronts
- **Standalone Widget Support**: Created framework for embedding chatbot across different sites
- **Cross-Domain Communication**: Enhanced API routes with CORS support for cross-domain embedding
- **Enhanced UI**: Improved recipe display with better styling and title formatting
- **Optimized Message Styling**: Cleaner message templates without redundant headers
- **Fixed Recipe Detection**: Improved recipe detection to properly identify specific recipe requests

### Enhanced Agent Dashboard

- **Multi-Agent Support**: Fully tested support for multiple agents handling customer inquiries
- **Agent Workload Distribution**: System for distributing incoming chat requests among available agents
- **Chat Transfer Capabilities**: Ability to transfer chats between agents when needed
- **Comprehensive Analytics**: Track agent performance, response times, and customer satisfaction
- **Improved API Error Handling**: Better error reporting and handling for agent dashboard operations

### Bug Fixes & Improvements

- **Fixed Recipe Step Formatting**: Eliminated duplicate numbering in recipe instructions
- **Enhanced Product Recognition**: Improved detection of accessory inquiries
- **Fixed Message Header Display**: Removed incorrect recipe headers from different message types
- **Improved Accessory Information**: Enhanced accessory details and fixed broken links
- **Fixed Recipe Recognition**: Improved detection of specific recipe requests for immediate handling

### Multi-Agent System Improvements

- **Accurate Agent Status Display**: Enhanced agent dashboard to clearly show which agents are truly logged in vs. just recently active
- **Automatic Session Cleanup**: Added logic to automatically close inactive chat sessions and move them to history
- **Session Abandonment Detection**: System now detects when customers leave or close their browser and marks sessions accordingly
- **Agent Login Indicators**: Added visual indicators in the agent team view showing which agents are currently logged in
- **Improved Agent Workload Management**: Agents now only see chats that are specifically assigned to them
- **Agent Name Display**: Customer chat now displays the actual name of the agent they're speaking with
- **Reduced Console Output**: Performance optimization to minimize log output and improve system responsiveness

### Technical Improvements

- **Browser Close Detection**: Implemented beforeunload event listener to detect when customers close their browsers
- **Robust Message Delivery**: Enhanced message delivery using navigator.sendBeacon for reliable communication during page unloads
- **Inactive Session Handling**: Added a cleanup API that automatically detects and closes sessions after periods of inactivity
- **Session History**: Improved history tracking with fields for closure reason and timestamps
- **Proper Middleware Implementation**: Fixed Next.js middleware implementation for better request handling
- **Reduced Polling Frequency**: Optimized polling intervals to reduce server load while maintaining responsiveness

### Previous Updates (live-agent-session-ending branch)

### Improved Real-time Communication

- **Reliable Message Delivery**: Enhanced Socket.io implementation to guarantee message delivery between customers and agents
- **Multi-channel Socket Communication**: Messages now broadcast through multiple channels to ensure delivery
- **Chat Ending Notifications**: Clear notifications when customers end chat sessions
- **Visual Status Indicators**: Added visual cues to indicate when a chat has been ended by a customer
- **Role-based Socket Rooms**: Implemented dedicated rooms for agents and customers for better message routing
- **Fallback Polling Mechanism**: Added a polling mechanism as a backup for critical real-time updates
- **Enhanced Debugging**: Improved logging and error handling for Socket.io events

### Bug Fixes

- Fixed issues with customer messages not appearing in agent chat sessions
- Fixed notifications when customers end chat sessions
- Resolved duplicate message display problems
- Enhanced error handling for timestamp conversion
- Improved session status synchronization
- Fixed socket room management

### Previous Updates

- **Live Agent Integration**: Added the ability for customers to request a live chat with a support agent
- **Agent Dashboard**: Created a comprehensive dashboard for agents to manage customer chat sessions
- **Real-time Messaging**: Implemented Socket.io for instant communication between customers and agents
- **Chat Transfer**: Seamless handoff from AI chatbot to human agent when needed
- **Multi-session Support**: Agents can handle multiple customer chat sessions simultaneously
- **Status Indicators**: Visual indicators for chat status (waiting, active, ended)
- **Enhanced Order Status Tracking**: Added support for multiple input formats and improved validation
- **Improved Customer Support**: Chatbot now asks what specific help is needed instead of providing unsolicited information
- **Cooking Guides**: Added detailed cooking instructions for specific dishes like pizza
- **Smarter Assembly Guide Detection**: Refined the logic to only show assembly guides when explicitly requested
- **Order Status Form**: Added a dedicated form for checking order status with validation
- **Unit Tests**: Added comprehensive test suite for API routes, components, and utility functions

## Tech Stack

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

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `SHOPIFY_STORE_URL`: Your Shopify store URL
- `SHOPIFY_ACCESS_TOKEN`: Your Shopify access token
- `DATABASE_URL`: PostgreSQL database connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NEXT_PUBLIC_SOCKET_URL`: URL for Socket.io connection (defaults to same host)

## Getting Started

1. Clone the repository:

```bash
git clone [your-repo-url]
cd bgeaichatbot
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```env
OPENAI_API_KEY=your_openai_api_key
SHOPIFY_STORE_URL=your_shopify_store_url
SHOPIFY_ACCESS_TOKEN=your_shopify_access_token
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser for the customer-facing chatbot.
7. Open [http://localhost:3000/agent-login](http://localhost:3000/agent-login) for the agent login page.

## Agent Dashboard

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

## Testing

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

## Project Structure

- `/src/components` - React components including the chatbot, live chat, and order status form
- `/src/app/api` - API routes for chat, live agent support, and Shopify integration
- `/src/app/agent-dashboard` - Agent dashboard pages and components
- `/src/app/agent-login` - Agent authentication pages
- `/src/contexts` - React context providers including SocketContext
- `/src/lib` - Utility functions, hooks, and database client
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/src/__tests__` - Test files organized by category

## Socket.io Communication Architecture

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for the AI capabilities
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Socket.io](https://socket.io/) for real-time communication
- [Prisma](https://www.prisma.io/) for database ORM
- [Headless UI](https://headlessui.dev/) for accessible components
- [Heroicons](https://heroicons.com/) for icons
- [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for testing
