import { OpenAI } from "openai";
import "dotenv/config";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { workPersona } from "./constants/work-persona.js";
import { Persona } from "./constants/enum/Persona.js";
import { chillPersona } from "./constants/chill-persona.js";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const chatMethod = async (newMessage: string, persona: Persona) => {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: persona === Persona.CHILL ? chillPersona : workPersona,
    },
  ];

  messages.push({
    role: "user",
    content: newMessage,
  });

  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages,
  });

  return response.choices[0]?.message.content;
};
