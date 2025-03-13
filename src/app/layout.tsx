import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatbotProvider from "@/components/ChatbotProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Big Green Egg - AI Chatbot",
  description: "AI Chatbot for Big Green Egg Shopify store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChatbotProvider
          initialMessage="Hi there! I'm your Big Green Egg assistant. How can I help you today?"
          primaryColor="#006838"
          botName="BGE Assistant"
        >
          {children}
        </ChatbotProvider>
      </body>
    </html>
  );
}
