// components/chatbot/ChatWidget.tsx
'use client';

import React from 'react';
import { useChatStore } from '@/store/chatStore';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';

export function ChatWidget() {
  const { isChatOpen, toggleChat } = useChatStore();

  return (
    <>
      {isChatOpen && <ChatWindow onClose={toggleChat} />}
      <ChatBubble />
    </>
  );
}
