import { Inter } from "next/font/google";
import "./globals.css";
import { ChatbotProvider } from "@/components/ChatbotProvider";
import { UserProvider } from "@/components/UserProvider";
import { Metadata } from "next";
import { Suspense } from "react";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";

// Mark as a dynamic layout to prevent static generation issues
export const dynamic = "force-dynamic";

// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BGE Chatbot",
  description: "A chatbot for BGE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} antialiased`}>
      <body className="overflow-hidden">
        <Providers>
          <UserProvider>
            <ChatbotProvider>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </ChatbotProvider>
          </UserProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
