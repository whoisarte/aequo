// lib/services/chat-service.ts
import { ChatMessage } from '@/store/chatStore';

interface SendMessageResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendMessageToChatbot(
  userMessage: string,
  conversationHistory: ChatMessage[],
): Promise<SendMessageResponse> {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userMessage, conversationHistory }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData.error);
      return { success: false, error: errorData.error || 'Unknown API error' };
    }

    // This service is designed to handle non-streaming responses for now.
    // If streaming is implemented on the API route, this part will need adjustment.
    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Network or client-side error:', error);
    return { success: false, error: (error as Error).message || 'Network error' };
  }
}
