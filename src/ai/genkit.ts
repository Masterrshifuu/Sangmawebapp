import { ai } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

ai.configure({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracing: true,
});

export { ai };
