
'use server';

/**
 * @fileOverview Generates a simulated email notification for contracts expiring in 7 days.
 *
 * - contractExpiryNotification - A function that generates the notification.
 * - ContractExpiryNotificationInput - The input type for the contractExpiryNotification function.
 * - ContractExpiryNotificationOutput - The return type for the contractExpiryNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Notification } from '@/lib/types';

const ContractExpiryNotificationInputSchema = z.object({
  notificationType: z.enum(['Email', 'WhatsApp', 'SMS']).describe('The type of notification to generate.'),
  contractId: z.string().describe('The ID of the contract.'),
  clientName: z.string().describe('The name of the client.'),
  companyName: z.string().optional().describe('The name of the client company.'),
  screenNames: z.array(z.string()).describe('The names of the screens the contract is for.'),
  endDate: z.string().describe('The end date of the contract (timestamp string).'),
  amount: z.number().describe('The contract amount.'),
});
export type ContractExpiryNotificationInput = z.infer<
  typeof ContractExpiryNotificationInputSchema
>;

const ContractExpiryNotificationOutputSchema = z.object({
  notificationMessage: z.string().describe('The generated notification message.'),
});
export type ContractExpiryNotificationOutput = z.infer<
  typeof ContractExpiryNotificationOutputSchema
>;

export async function contractExpiryNotification(
  input: ContractExpiryNotificationInput
): Promise<ContractExpiryNotificationOutput> {
  return contractExpiryNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contractExpiryNotificationPrompt',
  input: {schema: ContractExpiryNotificationInputSchema},
  output: {schema: ContractExpiryNotificationOutputSchema},
  prompt: `You are an assistant that generates contract renewal reminders.
  
  Your task is to create a concise and professional notification message. The message format should be tailored to the specified notification type.

  Notification Type: {{notificationType}}

  **Guidelines:**
  - **Email:** Should be a standard professional email format with a clear subject line and body.
  - **WhatsApp:** Should be friendly and conversational, suitable for a messaging app.
  - **SMS:** Should be very short and to the point, under 160 characters.

  **Contract Details:**
  - Client: {{clientName}} {{#if companyName}}({{companyName}}){{/if}}
  - Screens: {{#each screenNames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  - Expiry Date: {{endDate}}
  - Renewal Amount: {{amount}}

  Generate a notification message reminding the client to renew their contract and arrange for payment.
  `,
});

const contractExpiryNotificationFlow = ai.defineFlow(
  {
    name: 'contractExpiryNotificationFlow',
    inputSchema: ContractExpiryNotificationInputSchema,
    outputSchema: ContractExpiryNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
