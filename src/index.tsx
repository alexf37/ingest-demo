import { serve } from "bun";
import index from "./index.html";
import { ingestPayloadSchema, type IngestPayload } from "./lib/schemas";
import { generateContent } from "./api/generate";
import { ingest } from "./api/ingest";

const server = serve({
  routes: {
    "/*": index,

    "/api/ingest": {
      async POST(req) {
        try {
          const body = await req.json();
          const payload = ingestPayloadSchema.parse(body);

          return Response.json({
            success: true,
            result: await ingest(payload, "u123")
          });
        } catch (error) {
          if (error instanceof Error) {
            return Response.json(
              {
                success: false,
                error: error.message,
              },
              { status: 400 }
            );
          }
          return Response.json(
            {
              success: false,
              error: "Invalid request",
            },
            { status: 400 }
          );
        }
      },
    },

    "/api/generate/:type": async (req) => {
      const type = req.params.type as "event" | "document" | "email";

      if (!["event", "document", "email"].includes(type)) {
        return Response.json(
          { error: "Invalid type. Must be 'event', 'document', or 'email'" },
          { status: 400 }
        );
      }

      try {
        const stream = await generateContent(type);
        return stream.toTextStreamResponse();
      } catch (error) {
        console.error("Generation error:", error);
        return Response.json(
          { error: "Failed to generate content" },
          { status: 500 }
        );
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
