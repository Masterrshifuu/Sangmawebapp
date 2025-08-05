import { defineTool } from 'genkit';

export const sampleTool = defineTool({
  name: 'sampleTool',
  inputSchema: {
    query: 'string',
  },
  outputSchema: {
    result: 'string',
  },
  handler: async ({ query }: { query: string }) => {
    return { result: `You said: ${query}` };
  },
});
