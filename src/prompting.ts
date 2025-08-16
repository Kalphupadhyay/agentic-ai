import { OpenAI } from "openai";
import "dotenv/config";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { workPersona } from "./constants/work-persona.js";
import { Persona } from "./constants/enum/Persona.js";
import { chillPersona } from "./constants/chill-persona.js";
import type { ChatRequest } from "./constants/interface/chatRequest.js";
import type { Response } from "express";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const messages: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: workPersona,
  },
];

export const chatMethod = async (chatRequest: ChatRequest, res: Response) => {
  if (chatRequest.persona === Persona.CHILL) {
    messages[0]!.content = chillPersona;
  } else if (chatRequest.persona === Persona.WORK) {
    messages[0]!.content = workPersona;
  } else {
    return res.status(400).json({ error: "Invalid persona specified" });
  }

  messages.push({
    role: "user",
    content: chatRequest.message,
  });

  const stream = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages,
    stream: true,
  });

  // Set appropriate headers for streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      // Send the chunk to the client
      res.write(content);
    }
  }

  // End the response when the stream is complete
  res.end();
};
