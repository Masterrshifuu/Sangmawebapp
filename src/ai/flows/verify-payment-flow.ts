
'use server';
/**
 * @fileOverview An AI flow to verify a payment screenshot.
 *
 * - verifyPayment - A function that handles the payment verification process.
 * - VerifyPaymentInput - The input type for the verifyPayment function.
 * - VerifyPaymentOutput - The return type for the verifyPayment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyPaymentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A screenshot of a UPI payment confirmation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  expectedAmount: z.string().describe('The expected payment amount to verify against.'),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentInputSchema>;

const VerifyPaymentOutputSchema = z.object({
  isPaymentVerified: z.boolean().describe('Whether or not the payment amount in the screenshot matches the expected amount.'),
  reason: z.string().optional().describe('The reason why the verification failed.'),
  foundAmount: z.string().optional().describe('The amount found in the screenshot.'),
});
export type VerifyPaymentOutput = z.infer<typeof VerifyPaymentOutputSchema>;

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
  return verifyPaymentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyPaymentPrompt',
  input: {schema: VerifyPaymentInputSchema},
  output: {schema: VerifyPaymentOutputSchema},
  prompt: `You are a payment verification assistant for an online store.
Your task is to analyze a payment confirmation screenshot and verify if the paid amount matches the expected order total.

Expected Amount: {{expectedAmount}}
Screenshot: {{media url=photoDataUri}}

Analyze the screenshot to find the amount paid. It might be labeled as "Paid", "Sent", or be near a UPI transaction ID. The amount may or may not have currency symbols like ₹ or INR. Be flexible with currency symbols and formatting.

Compare the found amount with the expected amount.

- If the amounts match, set isPaymentVerified to true.
- If they do not match, set isPaymentVerified to false and provide a brief reason.
- If you cannot find any amount in the screenshot, set isPaymentVerified to false and state that the amount was not found.

Provide only the JSON output.`,
});

const verifyPaymentFlow = ai.defineFlow(
  {
    name: 'verifyPaymentFlow',
    inputSchema: VerifyPaymentInputSchema,
    outputSchema: VerifyPaymentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
