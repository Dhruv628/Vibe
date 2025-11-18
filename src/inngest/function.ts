import z from "zod";
import { Sandbox } from "@e2b/code-interpreter";
import {
  createAgent,
  createTool,
  createNetwork,
  type Tool,
  gemini,
  openai
} from "@inngest/agent-kit";

import { inngest } from "./client";
import {
  getSandbox,
  lastAssistantTextMessageContent,
} from "./utils";
import { PROMPT } from "@/constants";


interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    // Create a sandbox id
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-try-3");
      return sandbox.sandboxId;
    });
    

    // Create an agent with different tools
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      // * OpenAi model 
      // model: openai({
      //   model: "o3-mini",
      //   // defaultParameters:{
      //   //   temperature: 0.1,
      //   // }
      // }),
      // * Gemini model 
      model: gemini({
        model: "gemini-2.5-pro", // Latest model with better reasoning
        apiKey: process.env.GOOGLE_API_KEY,
        defaultParameters: {
          generationConfig: {
            temperature: 0.1, // Low for consistent code generation
            // topP: 0.8,         // Focus on high probability tokens
            // topK: 40,          // Limit vocabulary for better consistency
            // maxOutputTokens: 8192, // Higher limit for long code
          },
        },
      }),
      tools: [
        // terminal tool to run commands
        createTool({
          name: "run_terminal_command",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("run_terminal_command", async () => {
              const buffers = { stdout: "", stderr: "" };

              // check if the commands succeeded
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });

                return result.stdout;
              } catch (e) {
                console.error(
                  `Command failed: ${e} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
                );

                return `Command failed: ${e} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),

        // create or update files tool
        createTool({
          name: "create_or_update_files",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "create_or_update_files",
              async () => {
                // update the files and keep track of them
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);

                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (e) {
                  return "Error: " + e;
                }
              }
            );
            // wait for the files to be an object and update the state
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),

        // read files tool
        createTool({
          name: "read_files",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("read_files", async () => {
              // read the files and return them
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];

                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }

                return JSON.stringify(contents);
              } catch (e) {
                return "Error: " + e;
              }
            });
          },
        }),
      ],
      lifecycle: {
        // It checks if the last message from the assistant includes the string "<task_summary>",
        // and if so, updates the summary field in the network.state.data object with the last assistant message text.
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }

          return result;
        },
      },
    });

    // Create a network
    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 10, // maximum number of iterations
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }

        return codeAgent;
      },
    });

    const result = await network.run(event.data.value);
    
    // Get the sandbox URL
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });
    
    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);