import { tool } from "langchain";
import * as wikipedia from "wikipedia";

import { MessageGraph } from "@langchain/langgraph";

import z from "zod";
import { model } from "../utils/ai.model.js";
const wiki = wikipedia as any;

// TOOL 1: Wikipedia (Fundamentals ke liye)
const wikiTool = tool(
  async ({ query }: { query: string }) => {
    try {
      await wiki.setLang("en");
      const page = await wiki.page("https://en.wikipedia.org/wiki/Batman", {
        url: true,
      });
      const summary = await page.summary();
    } catch (error) {}
  },
  {
    name: "wikipedia_search",
    description: "Search Wikipedia for CS/programming concepts",
    schema: z.object({
      schema: z.object({
        query: z.string(),
      }),
    }),
  },
);

export const createQuiz = tool(
  ({
    topic,
    numQuestions = 3,
  }: {
    topic: string;
    numQuestions?: number | undefined;
  }) => {
    const questions = Array.from(
      { length: numQuestions },
      (_, i) =>
        `Q${i + 1}: ${topic} - basic definition/example/common mistake?`,
    );
    return `🧠 Quiz for ${topic}:\n${questions.join("\n")}`;
  },
  {
    name: "create_quiz",
    description: "generate practice questions",
    schema: z.object({
      topic: z.string(),
      numQuestions: z.number().optional(),
    }),
  },
);

export const createTodo = tool(
  ({ topic }: { topic: string }) => {
    const todos = [
      `1. Read official docs: ${topic}`,
      "2. Watch 10-min YouTube explainer",
      "3. Code 1 simple example",
      "4. Solve 2 LeetCode problems",
      "5. Explain to rubber duck",
    ];
    return `Daily todos for ${topic}:\n ${todos.join("\n")}`;
  },
  {
    name: "create_study_todo",
    description: "Create daily study plan",
    schema: z.object({ topic: z.string() }),
  },
);

export const myTools = [wikiTool, createQuiz, createTodo];

const modelWithTools = model.bindTools(tools);
