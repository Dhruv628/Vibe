import z from "zod";
import { Sandbox } from "@e2b/code-interpreter";
import {
  createAgent,
  createTool,
  createNetwork,
  type Tool,
  Message,
  createState,
} from "@inngest/agent-kit";

import { inngest } from "./client";
import {
  getSandbox,
  lastAssistantTextMessageContent,
  parseAgentOutput,
} from "./utils";
import { prisma } from "@/lib/database";
import { MessageRole, MessageType } from "@/generated/prisma/enums";
import { FRAGMENT_TITLE_PROMPT, RESPONSE_PROMPT, SANDBOX_TIMEOUT } from "@/constants";
import { OPENAI_MODEL_CONFIG, PROMPT } from "@/constants/server";


type AgentState ={
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
      await sandbox.setTimeout(SANDBOX_TIMEOUT) // sandbox alive for 15 mins
      return sandbox.sandboxId;
    });

    // Get the previous messages
		const previousMessages = await step.run(
			"get-previous-messages",
			async () => {
				const formattedMessages: Message[] = [];
				const messages = await prisma.message.findMany({
					where: {
						projectId: event.data.projectId,
					},
					orderBy: {
						createdAt: "desc",
					},
					take: 5
				});
				for (const message of messages) {
					formattedMessages.push({
						type: "text",
						role: message.role === MessageRole.ASSISTANT ? "assistant" : "user",
						content: message.content,
					});
				}
				return formattedMessages.reverse();
			} 
		);

    // Create agent state
		const state = createState<AgentState>(
			{
				summary: "",
				files: {},
			},
			{
				messages: previousMessages,
			}
		);
  
    // Create an agent with different tools
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: OPENAI_MODEL_CONFIG.model,
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
			defaultState: state,
			maxIter: 10,
			router: async ({ network }) =>
				network.state.data.summary ? undefined : codeAgent,
		});

    // Run the network
    const result = await network.run(event.data.value, { state });
    const files = result.state.data.files;

    // Fragment title generate
		const fragmentTitleGenerator = createAgent<AgentState>({
			name: "fragment-title",
			system: FRAGMENT_TITLE_PROMPT,
			model: OPENAI_MODEL_CONFIG.model,
		});
    
    // Response generate
		const responseGenerator = createAgent<AgentState>({
			name: "response-generator",
			system: RESPONSE_PROMPT,
			model: OPENAI_MODEL_CONFIG.model
		});

    // Run the agents
		const { output: responseTitle } = await fragmentTitleGenerator.run(result.state.data.summary);
		const { output: responseSummary } = await responseGenerator.run(result.state.data.summary);

    const title = parseAgentOutput(responseTitle)
    const summary = parseAgentOutput(responseSummary)

    const isError = !summary || Object.keys(files || {}).length == 0; 

    // Get the sandbox URL
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    // Save result to DB
    await step.run("save-result", async () =>{
      if(isError){
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Error: Unable to generate summary or files.",
            role: MessageRole.ASSISTANT,
            type: MessageType.ERROR
          }
        })
      }
      return await prisma.message.create({
        data :{
          projectId: event.data.projectId,
          content: summary,
          role: MessageRole.ASSISTANT,
          type: MessageType.RESULT,
          fragment : {
            create: {
              sandboxUrl,
              title,
              files
            }
          }
        },
      })
    })
    
    return {
      url: sandboxUrl,
      title,
      files,
      summary,
    };
  }
);