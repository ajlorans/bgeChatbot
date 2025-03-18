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

## Recent Updates

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
