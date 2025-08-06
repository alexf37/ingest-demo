import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { eventFormSchema, documentFormSchema, emailFormSchema } from "../lib/schemas";

export async function generateContent(type: "event" | "document" | "email") {
  const currentDate = new Date();
  const prompts = {
    event: `Generate a realistic calendar event for a professional setting. Current date: ${currentDate.toISOString()}. Include a business meeting, workshop, or team event. For attendees, provide email addresses like john@example.com.`,
    document: `Generate a professional document with a meaningful title and content. It could be a report, proposal, or technical documentation.`,
    email: `Generate a professional email that could be sent in a business context. Include realistic sender, recipient, subject, and body content. Use email addresses like sender@example.com.`,
  };

  const schemas = {
    event: eventFormSchema.omit({ type: true }),
    document: documentFormSchema.omit({ type: true }),
    email: emailFormSchema.omit({ type: true }),
  };

  const stream = streamObject({
    model: openai("gpt-4.1-nano"),
    prompt: prompts[type],
    schema: schemas[type],
  });

  return stream;
}