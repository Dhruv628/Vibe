import "server-only";
import { openai } from "@inngest/agent-kit";

export const OPENAI_TEXT_MODEL_CONFIG = {
  model: openai({
    model: "o3-mini"
  }),
};

export const OPENAI_CODE_MODEL_CONFIG = {
  model: openai({
    model: "gpt-4.1",
    defaultParameters:{
      temperature: 0.1,
    }
  }),
};

// Re-export PROMPT from shared constants for convenience
export { PROMPT, RESPONSE_PROMPT, FRAGMENT_TITLE_PROMPT } from "./index";
