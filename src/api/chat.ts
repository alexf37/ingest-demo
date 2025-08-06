import { temporalFilterSchema } from "@/lib/schemas";
import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { Supermemory } from "supermemory";
import { z } from "zod";

const client = new Supermemory({
    apiKey: process.env.SUPERMEMORY_API_KEY,
})

export async function chat(message: string, userId: string) {

    const expandedSearchQuery = (await generateObject({
        model: openai("gpt-4.1"),

        messages: [
            {
                role: "system",
                content: `Expand the search query for this message. Your response will be used to semantically (vector) search a knowledge base for information that might be relevant for understanding this message and its context and things which might be relevant to it. Your job is to expand it and add terms that help the vector search find things that are relevant to the message but may not be found using a basic vector similarity search with only what's in the raw message as it exists already. You will also, if relevant, provide a temporal filter to limit the search to a specific time period.`
            },
            {
                role: "user",
                content: message
            }
        ],
        temperature: 0.3,
        schema: z.object({
            expandedQuery: z.string().describe("The expanded search query to use to semantically (vector) search a knowledge base for information that might be relevant for understanding this message and its context and things which might be relevant to it."),
            temporalFilter: temporalFilterSchema.optional(),
        }),
    })).object;

    const results = await client.search.execute({
        q: expandedSearchQuery.expandedQuery,
        includeFullDocs: true,
        includeSummary: true,
        containerTags: [`user-${userId}`],
        rerank: true,
        rewriteQuery: true,
        filters: {
        ...(expandedSearchQuery.temporalFilter ? {
            
                AND: [
                    (!expandedSearchQuery.temporalFilter?.start ? [] : [{
                        key: "datetime",
                        value: new Date(expandedSearchQuery.temporalFilter.start).getTime(),
                        filterType: "numeric",
                        operator: ">="
                    }]),
                    (!expandedSearchQuery.temporalFilter?.end ? [] : [{
                        key: "datetime",
                        value: new Date(expandedSearchQuery.temporalFilter.end).getTime(),
                        filterType: "numeric",
                        operator: "<="
                    }])
                ]
        } : {})
            }

    })

    console.log("Results:", results);

}