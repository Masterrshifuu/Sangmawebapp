
'use server';
/**
 * @fileOverview A payment verification AI agent.
 *
 * - verifyPayment - A function that handles the payment verification process.
 * - VerifyPaymentInput - The input type for the verifyPayment function.
 * - VerifyPaymentOutput - The return type for the verifyPayment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VerifyPaymentInputSchema = z.object({
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of a UPI payment confirmation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  expectedAmount: z.number().describe('The expected amount for the transaction.'),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentInputSchema>;

const VerifyPaymentOutputSchema = z.object({
  isPaymentVerified: z.boolean().describe('Whether the payment was successfully verified.'),
  transactionId: z.string().optional().describe('The UPI transaction ID, if found.'),
  amountPaid: z.number().optional().describe('The amount paid, as seen in the screenshot.'),
  reason: z.string().describe('The reason for verification failure, or "Success" if verified.'),
});
export type VerifyPaymentOutput = z.infer<typeof VerifyPaymentOutputSchema>;

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
  return verifyPaymentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyPaymentPrompt',
  input: { schema: VerifyPaymentInputSchema },
  output: { schema: VerifyPaymentOutputSchema },
  prompt: `You are an expert at verifying UPI (Unified Payments Interface) transaction screenshots. Your task is to analyze the provided screenshot to confirm a payment.

You must determine if the screenshot shows a successful payment of {{expectedAmount}}.

- If the payment is successful and the amount matches, set isPaymentVerified to true and extract the UPI Transaction ID.
- If the amount does not match, set isPaymentVerified to false and state the reason.
- If the image is not a payment screenshot or appears to be fraudulent, set isPaymentVerified to false and state the reason.
- If the payment status is "Pending" or "Failed", set isPaymentVerified to false.

Analyze the following payment screenshot:
{{media url=screenshotDataUri}}`,
});

const verifyPaymentFlow = ai.defineFlow(
  {
    name: 'verifyPaymentFlow',
    inputSchema: VerifyPaymentInputSchema,
    outputSchema: VerifyPaymentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
