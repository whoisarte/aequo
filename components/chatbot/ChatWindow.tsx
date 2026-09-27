// components/chatbot/ChatWindow.tsx
'use client';

import React, { useRef, useEffect, FormEvent, useState } from 'react';
import { useChatStore, ChatMessage } from '@/store/chatStore';
import { sendMessageToChatbot } from '@/lib/services/chat-service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Heading from '@/components/ui/Heading';
import styles from './chatbot.module.css';

interface ChatWindowProps {
  onClose: () => void;
}

const DISCLAIMER_KEY = 'aequo_chat_disclaimer_dismissed';

export function ChatWindow({ onClose }: ChatWindowProps) {
  const { conversationHistory, isLoading, error, addMessage, setLoading, setError, model } = useChatStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISCLAIMER_KEY);
    if (!dismissed) {
      setShowDisclaimer(true);
    }
  }, []);

  const dismissDisclaimer = () => {
    localStorage.setItem(DISCLAIMER_KEY, 'true');
    setShowDisclaimer(false);
  };

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
    <div className={styles.chatWindowCard}> {/* Apply main card style */}
      <div className={styles.chatWindowHeader}> {/* Apply header style */}
        <Heading level={3} className={styles.chatWindowTitle}> {/* Apply title style */}
          Chatbot ({model})
        </Heading>
        <Button onClick={onClose} className={styles.chatWindowCloseButton}> {/* Apply close button style */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5" // Retain w-5 h-5 for SVG for now
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      {showDisclaimer && (
        <div style={{
          padding: '8px 12px',
          background: '#fef3c7',
          borderBottom: '1px solid #f59e0b',
          fontSize: '11px',
          color: '#92400e',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '8px',
        }}>
          <div>
            <strong>Nota legal:</strong> Este chatbot proporciona informaci&oacute;n general sobre derecho laboral mexicano. No constituye asesoramiento legal y no crea una relaci&oacute;n abogado-cliente.
          </div>
          <button
            onClick={dismissDisclaimer}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#92400e',
              padding: '0',
              lineHeight: '1',
              flexShrink: 0,
            }}
          >
            &times;
          </button>
        </div>
      )}

      <div className={`${styles.chatMessageArea} custom-scrollbar`}>
        {conversationHistory.length === 0 ? (
          <p>Start a conversation!</p>
        ) : (
          conversationHistory.map((msg, index) => (
            <div
              key={index}
              className={`${styles.chatMessageBubble} ${
                msg.role === 'user'
                  ? styles.chatMessageUser
                  : msg.role === 'model'
                  ? styles.chatMessageModel
                  : styles.chatMessageError
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
        {isLoading && (
          <div className={styles.chatLoadingIndicator}>
            <span className="animate-pulse">...</span> {/* Keep animate-pulse if it's a global animation */}
          </div>
        )}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>

      {error && (
        <div className={`${styles.chatMessageBubble} ${styles.chatMessageError}`}> {/* Use vanilla CSS for error */}
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSendMessage} className={styles.chatInputForm}> {/* Apply form style */}
        <Input
          name="chat-input"
          ref={inputRef}
          type="text"
          placeholder="Type your message..."
          className={styles.chatInputField} // Apply input field style
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} className={styles.chatSendButton}> {/* Apply send button style */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5" // Retain w-5 h-5 for SVG for now
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </Button>
      </form>
    </div>
  );
}
