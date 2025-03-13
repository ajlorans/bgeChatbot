# Big Green Egg AI Chatbot

A Next.js-based AI chatbot for Big Green Egg, featuring order tracking, product recommendations, customer support, and cooking tips.

## Features

- 🤖 AI-powered chat interface
- 📦 Order status tracking
- 🛍️ Product recommendations
- 🤝 Customer support
- 👨‍🍳 Recipes and cooking tips
- 💬 Real-time chat with quick action buttons
- 🎨 Customizable theme colors
- 📱 Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- Shopify API

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

3. Create a `.env.local` file in the root directory and add your API keys:

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

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `SHOPIFY_STORE_URL`: Your Shopify store URL
- `SHOPIFY_ACCESS_TOKEN`: Your Shopify access token

## Project Structure

- `/src/components` - React components including the chatbot
- `/src/app/api` - API routes for chat and Shopify integration
- `/src/lib` - Utility functions and hooks
- `/public` - Static assets

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
