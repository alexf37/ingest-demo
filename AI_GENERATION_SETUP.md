# AI Auto-Generation Setup

This application now includes AI-powered auto-generation for all form inputs using the Vercel AI SDK.

## Setup Instructions

1. **Get an OpenAI API Key**

   - Visit https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key

2. **Configure Environment Variables**

   - Create a `.env` file in the root directory
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=sk-...your-key-here...
     ```

3. **Restart the Development Server**
   ```bash
   bun dev
   ```

## How to Use

Each tab (Event, Document, Email) now has an "Auto-generate" button in the top-right corner:

- **Event Tab**: Generates realistic calendar events with titles, descriptions, times, locations, and attendees
- **Document Tab**: Creates professional documents with titles, content, authors, and tags
- **Email Tab**: Generates business emails with appropriate recipients, subjects, and content

Simply click the "Auto-generate" button to populate all fields with AI-generated content. The generation happens in real-time using streaming, so you'll see the fields populate as the AI generates the content.

## Features

- **Type-Safe**: Full TypeScript support with Zod schemas
- **Streaming**: Real-time field population using `experimental_useObject`
- **Smart Generation**: Context-aware content generation for each type of data

## Troubleshooting

If the auto-generation doesn't work:

1. Check that your OpenAI API key is correctly set in the `.env` file
2. Ensure you have credits/quota available on your OpenAI account
3. Check the browser console and server logs for any error messages
