import React, { useState, useEffect } from "react";

const messages = [
  "Please consider donating!",
  "You can change the swirly background in options > settings",
  "Story Modifiers create unique adventures",
  "Each story is uniquely generated just for you",
  "Collecting words feature coming soon!",
  "Click START to begin your adventure",
  "Join the Discord server for updates and support",
];

const ChatBubble: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Function to show a new message
    const showNewMessage = () => {
      setIsExiting(false);
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      setCurrentMessage(randomMessage);
      setIsVisible(true);

      // Start exit animation after 3.7 seconds (4 - 0.3 for animation)
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 3700);

      // Hide after animation completes
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    };

    // Show first message after 2 seconds
    const initialTimeout = setTimeout(() => {
      showNewMessage();
    }, 2000);

    // Set up interval to show messages every 15 seconds
    const interval = setInterval(showNewMessage, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`absolute -top-16 right-0 transform translate-x-1/4 ${
        isExiting ? "chat-bubble-exit" : "chat-bubble-enter"
      }`}
      style={{ textShadow: "none", fontFamily: "AnonymousPro" }}
    >
      <div className="relative">
        {/* Comic book style chat bubble */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-black relative max-w-[300px]">
          {/* Spiky border effect using pseudo-elements */}
          <div className="absolute inset-0 bg-white rounded-2xl border-2 border-black transform rotate-2 -z-10"></div>
          <div className="absolute inset-0 bg-white rounded-2xl border-2 border-black transform -rotate-1 -z-20"></div>

          {/* Message text */}
          <p className="text-black text-lg leading-tight">{currentMessage}</p>

          {/* Tail of the bubble */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-6 bg-white border-2 border-black transform rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
