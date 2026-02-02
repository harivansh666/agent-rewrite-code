import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { MessageGraph } from "@langchain/langgraph";
import dotenv from "dotenv";
import { createAgent, createMiddleware, SystemMessage } from "langchain";
import { myTools } from "../agent/tools.js";
import z from "zod";
dotenv.config();

// dynamic context
const contextSchema = z.object({
  topic: z.string().default("Python basics"),
});

// here i define model
export const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  maxOutputTokens: 60,
});

// created agent
const agent = createAgent({
  model: model,
  tools: myTools,
});

export interface StudyState extends MessageGraph {
  todos: string[];
  topic: string;
}

// here i define custome middleware.

const dynamicTopicMiddleware = createMiddleware({
  contextSchema,
  // beforeModel: hook define kiya. Ye har LLM call se PEHLE chalega.
  beforeModel: (state, runtime) => {
    const topic = runtime.context?.topic;

    const topic = runtime.context?.topic || "Python basics";

    const systemPrompt = `You are Study Buddy - expert CS/Python teacher.

Current topic: **${topic}**
Goal: Make fundamentals crystal clear with examples + practice.

Use tools smartly:
- wikipedia_search for theory/background
- create_quiz for hands-on practice
- create_study_todo for daily actionable plan

Keep responses short (3-5 sentences), actionable. End with "Next: [action]".`;
  },
});
async function agentNode(state: StudyState) {
  const topic = state.topic || "Python basics";
  const systemPrompt = `You are Study Buddy - expert CS/Python teacher.

Current topic: ${topic}
Goal: Make fundamentals crystal clear with examples + practice.

Use tools smartly:
- wikipedia_search for theory
- create_quiz for practice
- create_study_todo for daily plan

Keep responses short, actionable. End with next action.`;

  agent.invoke([{ SystemMessage: systemPrompt }]);
}
