// lib/inngest/functions.ts
import { OpenAI } from "openai";
import { inngest } from "./client";
import { Sandbox } from '@e2b/code-interpreter'
import { getSandbox } from "./utils";

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

export const helloWorld = inngest.createFunction(
  { id: "summarize-contents" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // Use step.run to wrap Sandbox creation for retry/observability
    const sandboxId = await step.run("get-sandbox-id", async ()=> {
      const sandbox = await Sandbox.create("vibe-nextjs-try-1");
      return sandbox.sandboxId;
    })

    // Use step.run to wrap Perplexity calls for retry/observability
    const output = await step.run("code-agent", async () => {
      const response = await perplexity.chat.completions.create({
        model: "sonar",
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
        temperature: 0.2,
      });

      return response.choices[0].message?.content || "";
    });
    
    // Use step.run to wrap Sandbox URL retrieval for retry/observability
    const sandboxUrl = await step.run("get-sandbox-url", async ()=> {
      const sandbox = await getSandbox(sandboxId)
      const host = sandbox.getHost(3000);
      return `https://${host}`
    })

    return { output, sandboxUrl  }
  }

);