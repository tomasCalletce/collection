import { openai } from "@ai-sdk/openai";
import { type verifyCollectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { z } from "zod";
import { generateObject } from "ai";

export const askAIforInitialCollectionEmail = async (
  invoiceData: verifyCollectionWorkloads["invoice"],
) => {
  const { object: emailContent } = await generateObject({
    model: openai("o3-mini", {
      structuredOutputs: true,
    }),
    schemaName: "collection_invoice_email",
    schemaDescription:
      "A professional email body in HTML format for invoice payment requests",
    schema: z.object({
      subject: z.string(),
      body: z
        .string()
        .describe(
          "HTML-formatted email body that will be inserted into a template",
        ),
    }),
    prompt: `Create a professional, concise payment request email body for the following invoice: ${JSON.stringify(invoiceData)}
    
This is the first communication in the collection process. The email should:
- Be formatted in clean, responsive HTML
- Have a professional and courteous tone
- Clearly state the invoice details (invoice number if available, amount, description)
- Be signed by Tomas Calle, Accounting Executive at Nilho

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
`,
  });

  return emailContent;
};
