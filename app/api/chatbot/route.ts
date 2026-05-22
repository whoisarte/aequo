import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

import { NextResponse } from "next/server";
import type { ChatMessage } from "@/store/chatStore";

// Validate API key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    const {
      userMessage,
      conversationHistory,
    }: {
      userMessage: string;
      conversationHistory: ChatMessage[];
    } = await request.json();

    // Use a CURRENT Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",

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

    // Convert your chat history to Gemini format
    const history = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Start chat session
    const chat = model.startChat({
      history,

      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    const result = await chat.sendMessage(userMessage);

    const response = await result.response;

    const text = response.text();

    return NextResponse.json({
      message: text,
    });
  } catch (error: any) {
    console.error("Error in chatbot API route:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to get response from Gemini AI",
      },
      {
        status: 500,
      }
    );
  }
}