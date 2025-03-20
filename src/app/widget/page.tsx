"use client";

import React from "react";
import ChatInterface from "@/components/ChatInterface";
import { usePathname } from "next/navigation";

interface MessageData {
  height?: number;
  [key: string]: any;
}

export default function WidgetPage() {
  const pathname = usePathname();
  const isWidget = pathname === "/widget";

  // Function to send messages to parent window
  const sendMessageToParent = (type: string, data: MessageData = {}) => {
    if (window.parent !== window) {
      window.parent.postMessage({ type, ...data }, "*");
    }
  };

  // CSS Styles for the widget
  const widgetStyles = {
    container: {
      height: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column" as "column",
      background: "white",
      borderRadius: isWidget ? "10px" : "0",
      overflow: "hidden",
      position: "relative" as "relative",
    },
    header: {
      padding: "10px 15px",
      background: "#008000", // Green color
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    closeButton: {
      background: "transparent",
      border: "none",
      color: "white",
      cursor: "pointer",
      fontSize: "16px",
    },
    logo: {
      height: "30px",
      width: "auto",
    },
  };

  // Handle close button click
  const handleClose = () => {
    sendMessageToParent("close");
  };

  return (
    <div style={widgetStyles.container}>
      {isWidget && (
        <div style={widgetStyles.header}>
          <div>
            <img
              src="/bge-logo.png"
              alt="Big Green Egg"
              style={widgetStyles.logo}
            />
          </div>
          <button
            style={widgetStyles.closeButton}
            onClick={handleClose}
            aria-label="Close chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      <ChatInterface
        isEmbedded={isWidget}
        initialMessage="Welcome to Big Green Egg support! How can I help you today?"
        onAction={(type, data) => {
          if (type === "resize") {
            sendMessageToParent("resize", { height: data.height });
          }
        }}
      />
    </div>
  );
}
