import { generateObject, generateText } from "ai";
import { ingestPayloadSchema, type TemporalFilter } from "../lib/schemas";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { Supermemory } from "supermemory";

type IngestPayload = z.infer<typeof ingestPayloadSchema>;

function getPlaintextData(data: IngestPayload) {
    switch (data.type) {
        case "event": 
            return `<event>
  <title>${data.title}</title>
  <description>${data.description}</description>
  <startTime>${data.startTime}</startTime>
  <endTime>${data.endTime}</endTime>
  <location>${data.location}</location>
  <attendees>${Array.isArray(data.attendees) ? data.attendees.map(a => `<attendee>${a}</attendee>`).join("") : ""}</attendees>
</event>`;
        case "document":
            return `<document>
  <title>${data.title}</title>
  <content>${data.content}</content>
  <author>${data.author}</author>
  <tags>${Array.isArray(data.tags) ? data.tags.map(t => `<tag>${t}</tag>`).join("") : ""}</tags>
</document>`;
        case "email":
            return `<email>
  <from>${data.from}</from>
  <to>${data.to}</to>
  <subject>${data.subject}</subject>
  <body>${data.body}</body>
  <cc>${Array.isArray(data.cc) ? data.cc.map(c => `<ccAddress>${c}</ccAddress>`).join("") : ""}</cc>
</email>`;
    }
}

const client = new Supermemory({
    apiKey: process.env.SUPERMEMORY_API_KEY,
})

/*
Notes: in real life, it may be helpful to keep a record of memories you've stored in supermemory using the customId field or metadata in supermemory and/or storing the memory ID returned by the memory adding function in your db. It would be wise to link memories
You may be able to accomplish the same as below with tool calls.  
*/

export async function ingest(data: IngestPayload, userId: string) {
    console.log("Ingesting data:", data);

    // you could also make this figure out the temporal information to include in the metadata. right now i'm just using Date.now() for that.
    // also, you should statically type and validate your metadata. i'm not for simplicity's sake but it's good practice.
    const expandedSearchQuery = (await generateText({
        model: openai("gpt-4.1"),
        prompt: `Expand the search query for this ${data.type}. Your response will be used to semantically (vector) search a knowledge base for information that might be relevant for understanding this data and its context. Your job is to expand it and add terms that help the vector search find things that are relevant to the data but may not be found using a basic vector similarity search with only what's in the raw data. Here it is the ${data.type}: ${getPlaintextData(data)}`,
        temperature: 0.3,
    })).text;

    console.log("Expanded search query:", expandedSearchQuery);

    const results = await client.search.execute({
        q: expandedSearchQuery,
        includeFullDocs: true,
        includeSummary: true,
        containerTags: [`user-${userId}`],
        rerank: true,
        rewriteQuery: true,
    })

    console.log("Results:", results);

    const memory = await client.memories.add({
        content: getPlaintextData(data),
        metadata: {
            type: data.type,
            datetime:Date.now()
        },
        containerTags: [`user-${userId}`],
    })

    const actions = await generateObject({
        model: openai("gpt-4.1"),
        messages: [
            {
                role: "system",
                content: `You are a helpful assistant that generates actions to take based on a new piece of data. You will be given a piece of data and a list of relevant memories from a knowledge base about the user. You will need to generate a list of actions to take based on the data and the results, inferring things which could be helpful to the user. Use the results to help inform your suggestions and make inferences about what might be in the user's best interest.`,
            },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Here are the results of the search: ${JSON.stringify(results.results.map(r=>({
                            title: r.title,
                            summary: r.summary,
                            content: r.chunks.join("\n"),
                            time: r.metadata?.datetime ? new Date(r.metadata.datetime as string).toISOString() : "No temporal information found for this memory",
                        })))}`
                    },
                    {
                        type: "text",
                        text: `Here is the new data: ${getPlaintextData(data)}`
                    }
                ]
            }
        ],
        schema: z.object({
            // you could also include a tool to get an augmented new memory and add the new memory AFTER this step, to include extra important context with this new data.
            actions: z.array(z.discriminatedUnion("type", [
                z.object({
                    type: z.literal("suggestion"),
                    suggestion: z.string().describe("A suggestion for the user to do something."),
                }),
                z.object({
                    type: z.literal("reminder"),
                    content: z.string().describe("A reminder for the user to do something."),
                    time: z.string().describe("The time at which the reminder should be shown to the user, in ISO 8601 format."),
                }),
                z.object({
                    type: z.literal("add_to_goals"),
                    goal: z.string().describe("A new goal for the user to strive for."),
                })
            ])),
            // you could use these to build your own memory dependency graph. i won't use them here for simplicity.
            relatedMemories: z.array(z.string()).describe("The IDs of the memories that are most relevant to the new data, including all used to take the actions."),
        }),
    })

    // do something with the actions
    console.log("Actions:", actions.object);

    return actions.object;
}