"use server";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const getAiResult = async (prompt: string, file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");

  const result = await generateText({
    model: google("gemini-1.5-flash"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "file",
            data: base64String,
            mimeType: file.type,
          },
        ],
      },
    ],
  });

  console.log(result.steps[0].text);
  return result.steps[0].text;
};
