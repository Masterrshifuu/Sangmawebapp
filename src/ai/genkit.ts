
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  // This will be caught by Next.js's build process and displayed as an error.
  throw new Error(
    'GEMINI_API_KEY environment variable not set. Please add it to your .env.local file.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: geminiApiKey,
    }),
  ],
  // Log all traces to the console for debugging
  logLevel: 'debug',
  // By default, Genkit enables a flow server. We don't need it for this app.
  enableFlowServer: false,
});
