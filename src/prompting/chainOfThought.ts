import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { exec } from "child_process";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getWeatherbyCity(city: string): Promise<string> {
  return `The weather in ${city} is sunny with a temperature of 100 degrees Celsius.`;
}

const availableTools = {
  getWeatherbyCity: getWeatherbyCity,
};

function executeCommand(cmd: string) {
  return new Promise((res, reject) => {
    exec(cmd, (err, data) => {
      if (err) {
        res(`Error running command ${err}`);
      }

      return res(`executed ${cmd} successfully ${data}`);
    });
  });
}

const systemPrompt = ` 

    You are an AI assistant who works on START, THINK and OUTPUT format.
    For a given user query first think and breakdown the problem into sub problems.

    You should always keep thinking and thinking before giving the actual output.
    Also, before outputing the final result to user you must check once if everything is correct.

    You should check if there is any tool available to perform the action requested by the user.

    Rules:
    - Strictly follow the output JSON format
    - Always follow the output in sequence that is START, THINK , OBSERVE and OUTPUT.
    - Always perform only one step at a time and wait for other step.
    - Alway make sure to do multiple steps of thinking before giving out output.
    - For every Tool call wait for OBSERVE which contains output for the tool;

    Available Tools:
    - getWeatherbyCity(city: string): This tool will give you the weather of a city.
    -executeCommand(command:string):This tool executes the Linux/unix command on user's machine it takes command as args and returns the output.

    Output JSON Format:
    { "step": "START | THINK | TOOL | OBSERVE | OUTPUT", "content": "string" , input:"string", tool_name:"string" }

     Example:
    User: Give me the weather of Jaipur
    ASSISTANT: { "step": "START", "content": "The user wants me to find weather of Jaipur" } 
    ASSISTANT: { "step": "THINK", "content": "Let me check my data for weather of Jaipur" }
    ASSISTANT: { "step": "THINK", "content": "Let me See if there is any tool available to get city data"}
    ASSISTANT: { "step": "THINK", "content": "I see there is a tool getWeatherbyCity(city: string) which returns city data user is requesting"}
    ASSISTANT: { "step": "TOOL", "input":"patiala","tool_name":"getWeatherbyCity"}
    DEVELOPER: { "step": "OBSERVE", "content":"The weather in Jaipur is sunny with a temperature of 2 degrees Celsius."}
    ASSISTANT: { "step": "THINK", "content": "I got the weather of Jaipur"}
    ASSISTANT: { "step": "OUTPUT", "content": "current weather of Jaipur is sunny please take care of water"} 

    `;

export async function chatWithChainOfThought() {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: "WHat is the weather of Jaipur?",
    },
  ];

  while (true) {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messages,
    });

    const rawContent = response.choices[0].message.content;
    const parsedContent = JSON.parse(rawContent as string);

    messages.push({
      role: "assistant",
      content: JSON.stringify(parsedContent),
    });

    if (parsedContent.step === "START") {
      console.log(`🔥`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === "TOOL") {
      if (
        !parsedContent.tool_name ||
        !availableTools[parsedContent.tool_name as keyof typeof availableTools]
      ) {
        messages.push({
          role: "assistant",
          content: "No tool found for the current task sorry",
        });
      }

      let result = await availableTools[
        parsedContent.tool_name as keyof typeof availableTools
      ](parsedContent.input);

      messages.push({
        role: "developer",
        content: result,
      });

      continue;
    }

    if (parsedContent.step === "THINK") {
      console.log(`\t🧠`, parsedContent.content);

      continue;
    }

    if (parsedContent.step === "OUTPUT") {
      console.log(`🤖`, parsedContent.content);
      break;
    }
  }

  console.log("Done...");
}
