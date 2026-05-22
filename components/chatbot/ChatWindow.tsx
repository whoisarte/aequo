// components/chatbot/ChatWindow.tsx
'use client';

import React, { useRef, useEffect, FormEvent } from 'react';
import { useChatStore, ChatMessage } from '@/store/chatStore';
import { sendMessageToChatbot } from '@/lib/services/chat-service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card'; // Assuming Card is a general container
import Heading from '@/components/ui/Heading'; // Assuming Heading for title

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const { conversationHistory, isLoading, error, addMessage, setLoading, setError, model } = useChatStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputRef.current || isLoading) return;

    const userMessageContent = inputRef.current.value.trim();
    if (!userMessageContent) return;

    // Add user message to history
    addMessage({ role: 'user', content: userMessageContent });
    inputRef.current.value = ''; // Clear input

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const response = await sendMessageToChatbot(userMessageContent, conversationHistory);

      if (response.success && response.message) {
        addMessage({ role: 'model', content: response.message });
      } else {
        addMessage({ role: 'error', content: response.error || 'Failed to get response.' });
        setError(response.error || 'Failed to get response from chatbot.');
      }
    } catch (err) {
      console.error('Chatbot message error:', err);
      addMessage({ role: 'error', content: (err as Error).message || 'An unexpected error occurred.' });
      setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 bg-white shadow-xl flex flex-col z-50"> {/* z-50 to be above ChatBubble */}
      <div className="flex justify-between items-center p-4 border-b">
        <Heading level={3} className="text-lg font-semibold">
          Chatbot ({model})
        </Heading>
        <Button onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {conversationHistory.length === 0 ? (
          <p className="text-center text-gray-500 italic">Start a conversation!</p>
        ) : (
          conversationHistory.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white ml-auto'
                  : msg.role === 'model'
                  ? 'bg-gray-200 text-gray-800 mr-auto'
                  : 'bg-red-200 text-red-800 mr-auto'
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
        {isLoading && (
          <div className="mb-2 p-2 rounded-lg bg-gray-200 text-gray-800 mr-auto max-w-[80%]">
            <span className="animate-pulse">...</span>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>

      {error && (
        <div className="p-2 text-red-600 text-sm text-center">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input
          name="chat-input"
          ref={inputRef}
          type="text"
          placeholder="Type your message..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </Button>
      </form>
    </Card>
  );
}
