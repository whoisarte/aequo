// app/api/chatbot/route.ts
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type { ChatMessage } from '@/store/chatStore';

// Ensure the API key is available
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    const { userMessage, conversationHistory }: { userMessage: string; conversationHistory: ChatMessage[] } = await request.json();

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash', // Use the user's chosen model
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    // Map conversation history to Gemini's expected format
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model', // Ensure roles are 'user' or 'model'
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 200, // Limit output to prevent excessive usage on free tier
      },
    });

    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error('Error in chatbot API route:', error);
    // More specific error handling could be implemented based on error types
    return NextResponse.json(
      { error: 'Failed to get response from Gemini AI. Please try again.' },
      { status: 500 }
    );
  }
}
