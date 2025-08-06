import { z } from "zod";

// Event payload schema (calendar events)
export const eventSchema = z.object({
  type: z.literal("event"),
  title: z.string().min(1, "Event title is required"),
  description: z.string().min(1, "Event description is required"),
  startTime: z.string().datetime({ message: "Invalid datetime format" }),
  endTime: z.string().datetime({ message: "Invalid datetime format" }),
  location: z.string().optional().default(""),
  attendees: z.array(z.string().email()).default([]),
});

// Document payload schema
export const documentSchema = z.object({
  type: z.literal("document"),
  title: z.string().min(1, "Document title is required"),
  content: z.string().min(1, "Document content is required"),
  author: z.string().min(1, "Author is required"),
  tags: z.array(z.string()).default([]),
});

// Email payload schema
export const emailSchema = z.object({
  type: z.literal("email"),
  to: z.string().email("Invalid email address"),
  from: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Email body is required"),
  cc: z.array(z.string().email()).default([]),
});

// Discriminated union for all payload types
export const ingestPayloadSchema = z.discriminatedUnion("type", [
  eventSchema,
  documentSchema,
  emailSchema,
]);

// Export types
export type EventPayload = z.infer<typeof eventSchema>;
export type DocumentPayload = z.infer<typeof documentSchema>;
export type EmailPayload = z.infer<typeof emailSchema>;
export type IngestPayload = z.infer<typeof ingestPayloadSchema>;

// Form schemas with all fields required (for react-hook-form)
export const eventFormSchema = z.object({
  type: z.literal("event"),
  title: z.string().min(1, "Event title is required"),
  description: z.string().min(1, "Event description is required"),
  startTime: z.string().datetime({ message: "Invalid datetime format" }),
  endTime: z.string().datetime({ message: "Invalid datetime format" }),
  location: z.string(),
  attendees: z.array(z.string().email()),
});

export const documentFormSchema = z.object({
  type: z.literal("document"),
  title: z.string().min(1, "Document title is required"),
  content: z.string().min(1, "Document content is required"),
  author: z.string().min(1, "Author is required"),
  tags: z.array(z.string()),
});

export const emailFormSchema = z.object({
  type: z.literal("email"),
  to: z.string().email("Invalid email address"),
  from: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Email body is required"),
  cc: z.array(z.string().email()),
});

export const temporalFilterSchema = z.object({
  start: z.string().datetime({ message: "Invalid datetime format" }).optional(),
  end: z.string().datetime({ message: "Invalid datetime format" }).optional(),
});

// Form types
export type EventFormData = z.infer<typeof eventFormSchema>;
export type DocumentFormData = z.infer<typeof documentFormSchema>;
export type EmailFormData = z.infer<typeof emailFormSchema>;
export type TemporalFilter = z.infer<typeof temporalFilterSchema>;