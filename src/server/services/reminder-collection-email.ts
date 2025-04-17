import { openai } from "@ai-sdk/openai";
import { type invoiceSchema } from "~/server/db/schemas/invoice";
import { type verifyInquiriesSchema } from "~/server/db/schemas/inquiries";
import { z } from "zod";
import { generateObject } from "ai";
import { TypeInquiryValues } from "~/server/db/schemas/constants";

export const createFollowUpCollectionEmail = async (
  invoiceData: z.infer<typeof invoiceSchema>,
  pastInquiries: z.infer<typeof verifyInquiriesSchema>[],
) => {
  const requestInquiries = pastInquiries.filter(
    (inquiry) => inquiry.type === TypeInquiryValues.REQUEST,
  );
  const responseInquiries = pastInquiries.filter(
    (inquiry) => inquiry.type === TypeInquiryValues.RESPONSE,
  );

  const { object: emailContent } = await generateObject({
    model: openai("o3-mini", {
      structuredOutputs: true,
    }),
    schemaName: "collection_invoice_followup_email",
    schemaDescription:
      "A professional follow-up email in HTML format for outstanding invoice payment",
    schema: z.object({
      subject: z.string(),
      body: z
        .string()
        .describe(
          "HTML-formatted email body that will be inserted into a template",
        ),
    }),
    prompt: `Create a follow-up reminder email regarding an unpaid invoice.
    
INVOICE DETAILS:
${JSON.stringify(invoiceData)}

COMMUNICATION HISTORY:
Previous reminders sent (${requestInquiries.length}): 
${JSON.stringify(requestInquiries)}

Client responses (${responseInquiries.length}): 
${JSON.stringify(responseInquiries)}

Create an appropriate follow-up email with these guidelines:
- Be formatted in clean, responsive HTML
- Use a professional tone that escalates appropriately based on number of reminders sent (${requestInquiries.length})
- If client has responded, acknowledge their response and address any concerns
- Reference specific invoice details (number if available, amount, description)
- Be signed by Tomas Calle, Accounting Executive at Nilho
- DO NOT include any payment buttons, CTAs, or clickable payment links

IMPORTANT NOTES:
1. Your output will be inserted into an existing email template that already contains:
   - The recipient's name
   - The sender's name
   - Today's date
   - The invoice total amount
   - A "Thank you for your business" footer

2. DO NOT include these elements in your response as they'll be duplicated
3. Focus only on the main message content with payment instructions
4. The HTML should be compatible with email clients and not use complex CSS
5. Create a compelling subject line that reflects the urgency level based on reminder count
6. DO NOT include any payment buttons or payment link CTAs as these will be handled separately
`,
  });

  return emailContent;
};
