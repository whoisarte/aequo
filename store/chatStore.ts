// store/chatStore.ts
import { create } from 'zustand';

// Define the shape of a chat message
export interface ChatMessage {
  role: 'user' | 'model' | 'error';
  content: string;
}

// Define the state for the chatbot
interface ChatState {
  isChatOpen: boolean;
  conversationHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  model: string; // To store the chosen Gemini model
  
  // Actions
  toggleChat: () => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
  // This will be used to initialize the model in the store, in case we want to change it later
  setModel: (modelName: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isChatOpen: false,
  conversationHistory: [],
  isLoading: false,
  error: null,
  model: 'gemini-pro', // Default to gemini-pro

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  addMessage: (message) =>
    set((state) => ({
      conversationHistory: [...state.conversationHistory, message],
    })),
  setLoading: (loading) => set(() => ({ isLoading: loading })),
  setError: (error) => set(() => ({ error: error })),
  clearChat: () => set(() => ({ conversationHistory: [], error: null })),
  setModel: (modelName: string) => set(() => ({ model: modelName })),
}));
