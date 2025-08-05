import { defineConfig } from 'genkit';
import { googleAI } from '@genkit-ai/google-cloud';

export default defineConfig({
  plugins: [googleAI()],
  flows: ['./flows/*.ts'],
  tools: ['./tools/*.ts'],
  runtime: 'nodejs',
});
