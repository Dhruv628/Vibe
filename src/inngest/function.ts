// lib/inngest/functions.ts
import { OpenAI } from "openai";
import { inngest } from "./client";

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

export const helloWorld = inngest.createFunction(
  { id: "summarize-contents" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    
    // Use step.run to wrap Perplexity calls for retry/observability
    const output = await step.run("code-agent", async () => {
      const response = await perplexity.chat.completions.create({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "You are an expert developer in next.js. You write readable and maintainable code. You write simple next.js and react.js snippets",
          },
          {
            role: "user",
            content: `Write the following snippet: ${event.data.value}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      });

      return response.choices[0].message?.content || "";
    });

    return { output };
  }
);