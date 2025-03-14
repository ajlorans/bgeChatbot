# Big Green Egg AI Chatbot

A Next.js-based AI chatbot for Big Green Egg, featuring order tracking, product recommendations, customer support, and cooking tips.

## Features

- 🤖 AI-powered chat interface
- 📦 Order status tracking with email and order number validation
- 🛍️ Product recommendations
- 🤝 Enhanced customer support with guided assistance
- 👨‍🍳 Detailed cooking instructions and recipes
- 🍕 Specialized cooking guides (like pizza cooking)
- 💬 Real-time chat with quick action buttons
- 📋 Order status form with input validation
- 🎨 Customizable theme colors
- 📱 Responsive design
- 🧪 Comprehensive unit tests

## Recent Updates

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
- Jest and React Testing Library

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `SHOPIFY_STORE_URL`: Your Shopify store URL
- `SHOPIFY_ACCESS_TOKEN`: Your Shopify access token

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
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
- Component tests for the OrderStatusForm
- Utility function tests

## Project Structure

- `/src/components` - React components including the chatbot and order status form
- `/src/app/api` - API routes for chat and Shopify integration
- `/src/lib` - Utility functions and hooks
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
- [Headless UI](https://headlessui.dev/) for accessible components
- [Heroicons](https://heroicons.com/) for icons
- [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for testing
