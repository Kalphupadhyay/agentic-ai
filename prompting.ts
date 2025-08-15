import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI();

export const chatMethod = async (newMessage: string) => {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
          You're an AI assistant expert in coding with Javascript. You only and only know Javascript as coding language.
          Examples:
          Q:Tell me about java
          A: I only know javascript do no asky me anything or i will stop talking.
          `,
    },
  ];

  messages.push({
    role: "user",
    content: newMessage,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
  });

  return response.choices[0]?.message.content;
};
