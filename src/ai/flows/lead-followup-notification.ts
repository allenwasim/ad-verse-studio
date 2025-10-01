
'use server';

/**
 * @fileOverview Generates a simulated WhatsApp notification for lead follow-ups.
 *
 * - leadFollowUpNotification - A function that generates the notification.
 * - LeadFollowUpNotificationInput - The input type for the leadFollowUpNotification function.
 * - LeadFollowUpNotificationOutput - The return type for the leadFollowUpNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LeadFollowUpNotificationInputSchema = z.object({
  leadName: z.string().describe('The name of the lead to follow up with.'),
  adminName: z.string().describe('The name of the admin who should perform the follow-up.'),
});
export type LeadFollowUpNotificationInput = z.infer<
  typeof LeadFollowUpNotificationInputSchema
>;

const LeadFollowUpNotificationOutputSchema = z.object({
  notificationMessage: z.string().describe('The generated WhatsApp notification message.'),
});
export type LeadFollowUpNotificationOutput = z.infer<
  typeof LeadFollowUpNotificationOutputSchema
>;

export async function leadFollowUpNotification(
  input: LeadFollowUpNotificationInput
): Promise<LeadFollowUpNotificationOutput> {
  return leadFollowUpNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'leadFollowUpNotificationPrompt',
  input: {schema: LeadFollowUpNotificationInputSchema},
  output: {schema: LeadFollowUpNotificationOutputSchema},
  prompt: `You are an assistant that generates lead follow-up reminders for WhatsApp.
  
  Your task is to create a friendly and professional WhatsApp message to remind an admin to follow up with a lead.

  **Details:**
  - Admin to notify: {{adminName}}
  - Lead to contact: {{leadName}}

  Generate a WhatsApp message for {{adminName}} reminding them to follow up with {{leadName}} today.
  `,
});

const leadFollowUpNotificationFlow = ai.defineFlow(
  {
    name: 'leadFollowUpNotificationFlow',
    inputSchema: LeadFollowUpNotificationInputSchema,
    outputSchema: LeadFollowUpNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
