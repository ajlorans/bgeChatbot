"use client";

import { useChatbotContext } from "@/components/ChatbotProvider";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Big Green Egg AI Chatbot Demo
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://biggreenegg.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            By Big Green Egg
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center">
        <div className="bg-green-700 text-white p-4 rounded-md">
          <h2 className="text-xl font-bold">Big Green Egg</h2>
          <p className="text-sm">Premium Ceramic Grills</p>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <ChatbotDemo />
        <FeatureCard
          title="Order Status"
          description="Check the status of your orders and get shipping updates."
        />
        <FeatureCard
          title="Product Recommendations"
          description="Get personalized product recommendations based on your needs."
        />
        <FeatureCard
          title="Customer Support"
          description="Get help with common issues and questions about your Big Green Egg products."
        />
        <FeatureCard
          title="Tips & Tricks"
          description="Learn tips and tricks for getting the most out of your Big Green Egg."
        />
        <FeatureCard
          title="Recipes"
          description="Discover delicious recipes to cook on your Big Green Egg."
        />
      </div>
    </main>
  );
}

function ChatbotDemo() {
  return (
    <div className="col-span-3 rounded-lg border border-gray-300 bg-white p-6 text-center">
      <h2 className="mb-3 text-2xl font-semibold text-gray-800">
        Try Our AI Chatbot
      </h2>
      <p className="m-0 text-sm text-gray-700">
        Our AI chatbot can help you with order status, product recommendations,
        customer support, tips & tricks, recipes, and more.
      </p>
      <p className="mt-4 text-gray-700">
        Click the chat icon in the bottom right corner to start a conversation!
      </p>
      <ChatbotButton />
    </div>
  );
}

function ChatbotButton() {
  const { openChat } = useChatbotContext();

  return (
    <button
      onClick={openChat}
      className="mt-4 rounded-md bg-green-700 px-4 py-2 text-sm text-white transition-colors hover:bg-green-800"
    >
      Open Chatbot
    </button>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
      <h2 className="mb-3 text-2xl font-semibold text-gray-800">
        {title}{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
          -&gt;
        </span>
      </h2>
      <p className="m-0 max-w-[30ch] text-sm text-gray-700">{description}</p>
    </div>
  );
}
