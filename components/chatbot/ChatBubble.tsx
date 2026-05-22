// components/chatbot/ChatBubble.tsx
'use client';

import React from 'react';
import { useChatStore } from '@/store/chatStore';
import Button from '@/components/ui/Button';

// Placeholder for a chat icon (e.g., from an icon library or SVG)
const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H16.5M21 12c0 4.556-4.03 8.25-9 8.25a9.75 9.75 0 0 1-3.105-.566l-3.486 1.162A4.5 4.5 0 0 1 1 18.973V12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
    />
  </svg>
);

export function ChatBubble() {
  const { toggleChat } = useChatStore();

  return (
    <div className="fixed bottom-4 right-4 z-40"> {/* z-40 as discussed */}
      <Button
        onClick={toggleChat}
        className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        aria-label="Open Chatbot"
      >
        <ChatIcon />
      </Button>
    </div>
  );
}
