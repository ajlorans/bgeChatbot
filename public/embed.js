(function () {
  // Configuration
  const CHATBOT_URL = "https://YOUR_VERCEL_PROJECT_URL"; // Replace with your Vercel deployment URL

  // Create and inject chatbot iframe
  function createChatbotWidget() {
    // Create wrapper div
    const wrapper = document.createElement("div");
    wrapper.id = "bge-chatbot-widget-wrapper";
    wrapper.style.position = "fixed";
    wrapper.style.bottom = "20px";
    wrapper.style.right = "20px";
    wrapper.style.zIndex = "9999";

    // Create chat button
    const button = document.createElement("button");
    button.id = "bge-chatbot-toggle";
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    button.style.width = "60px";
    button.style.height = "60px";
    button.style.borderRadius = "50%";
    button.style.backgroundColor = "#008000"; // Green color
    button.style.color = "white";
    button.style.border = "none";
    button.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
    button.style.cursor = "pointer";
    button.style.display = "flex";
    button.style.justifyContent = "center";
    button.style.alignItems = "center";
    button.style.transition = "all 0.3s ease";

    // Create iframe container
    const chatContainer = document.createElement("div");
    chatContainer.id = "bge-chatbot-container";
    chatContainer.style.position = "absolute";
    chatContainer.style.bottom = "70px";
    chatContainer.style.right = "0";
    chatContainer.style.width = "350px";
    chatContainer.style.height = "550px";
    chatContainer.style.borderRadius = "10px";
    chatContainer.style.overflow = "hidden";
    chatContainer.style.boxShadow = "0 5px 40px rgba(0, 0, 0, 0.16)";
    chatContainer.style.display = "none"; // Initially hidden
    chatContainer.style.transition = "all 0.3s ease";

    // Create iframe
    const iframe = document.createElement("iframe");
    iframe.id = "bge-chatbot-iframe";
    iframe.src = `${CHATBOT_URL}/widget`;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.allow = "microphone; camera";

    // Append elements
    chatContainer.appendChild(iframe);
    wrapper.appendChild(button);
    wrapper.appendChild(chatContainer);
    document.body.appendChild(wrapper);

    // Toggle chatbot visibility
    button.addEventListener("click", function () {
      if (chatContainer.style.display === "none") {
        chatContainer.style.display = "block";
        // Animate button
        button.style.transform = "rotate(90deg)";
        button.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      } else {
        chatContainer.style.display = "none";
        // Reset button
        button.style.transform = "rotate(0)";
        button.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      }
    });

    // Handle messages from iframe
    window.addEventListener("message", function (event) {
      // Verify origin for security
      if (event.origin !== CHATBOT_URL) return;

      // Handle iframe messages
      if (event.data.type === "resize") {
        iframe.style.height = event.data.height + "px";
      } else if (event.data.type === "close") {
        chatContainer.style.display = "none";
        button.style.transform = "rotate(0)";
        button.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      }
    });
  }

  // Initialize when DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createChatbotWidget);
  } else {
    createChatbotWidget();
  }
})();
