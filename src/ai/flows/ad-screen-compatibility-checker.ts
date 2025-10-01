'use server';
/**
 * @fileOverview This file defines a Genkit flow for checking ad-screen compatibility.
 *
 * - adScreenCompatibilityChecker: Checks if the selected ads are assigned to valid screens.
 * - AdScreenCompatibilityCheckerInput: The input type for the adScreenCompatibilityChecker function.
 * - AdScreenCompatibilityCheckerOutput: The return type for the adScreenCompatibilityChecker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdScreenCompatibilityCheckerInputSchema = z.object({
  adId: z.string().describe('The ID of the ad to check.'),
  screenIds: z.array(z.string()).describe('The IDs of the screens to check against.'),
  validScreenIds: z.array(z.string()).describe('The list of valid screen IDs.'),
});
export type AdScreenCompatibilityCheckerInput = z.infer<typeof AdScreenCompatibilityCheckerInputSchema>;

const AdScreenCompatibilityCheckerOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the selected ads are assigned to valid screens.'),
  invalidScreenIds: z.array(z.string()).describe('The IDs of the screens that are not valid for the given ad.'),
});
export type AdScreenCompatibilityCheckerOutput = z.infer<typeof AdScreenCompatibilityCheckerOutputSchema>;

export async function adScreenCompatibilityChecker(
  input: AdScreenCompatibilityCheckerInput
): Promise<AdScreenCompatibilityCheckerOutput> {
  return adScreenCompatibilityCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adScreenCompatibilityCheckerPrompt',
  input: {schema: AdScreenCompatibilityCheckerInputSchema},
  output: {schema: AdScreenCompatibilityCheckerOutputSchema},
  prompt: `You are an expert at determining whether ads are assigned to valid screens.

Given an ad ID, a list of screen IDs, and a list of valid screen IDs, determine whether the selected ads are assigned to valid screens.

Ad ID: {{{adId}}}
Screen IDs: {{#each screenIds}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Valid Screen IDs: {{#each validScreenIds}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Return a JSON object with the following fields:
- isValid: true if all screen IDs are valid, false otherwise.
- invalidScreenIds: an array of screen IDs that are not valid for the given ad. If all screens are valid, this should be an empty array.
`,
});

const adScreenCompatibilityCheckerFlow = ai.defineFlow(
  {
    name: 'adScreenCompatibilityCheckerFlow',
    inputSchema: AdScreenCompatibilityCheckerInputSchema,
    outputSchema: AdScreenCompatibilityCheckerOutputSchema,
  },
  async input => {
    const {adId, screenIds, validScreenIds} = input;

    const invalidScreenIds = screenIds.filter(screenId => !validScreenIds.includes(screenId));
    const isValid = invalidScreenIds.length === 0;

    // Even though we calculate this before, we run it through the prompt
    // to simulate a more complex AI-driven decision process and for consistency.
    const {output} = await prompt({
      adId,
      screenIds,
      validScreenIds,
    });
    
    // We return our direct calculation to ensure correctness for this demo.
    // The AI's output could be used in a more advanced scenario.
    return {
      isValid,
      invalidScreenIds,
    };
  }
);
