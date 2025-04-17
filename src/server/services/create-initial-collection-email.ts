import { openai } from "@ai-sdk/openai";
import { type invoiceSchema } from "~/server/db/schemas/invoice";
import { z } from "zod";
import { generateObject } from "ai";

export const createInitialCollectionEmail = async (
  invoiceData: z.infer<typeof invoiceSchema>,
) => {
  const { object: emailContent } = await generateObject({
    model: openai("o3-mini", {
      structuredOutputs: true,
    }),
    schemaName: "collection_invoice_email",
    schemaDescription:
      "A email to start the porcess of collecting payment from an invoice",
    schema: z.object({
      subject: z.string(),
      body: z.string(),
    }),
    prompt: `The user has an invoice that he need to send to a client or a partner.
    This is the fisrt email in the cvollection process. ment to just inform the client or partner that the invoice is due and that they need to pay it.
    The invoice is the following: ${JSON.stringify(invoiceData)}
    Create an initial collection email to the client or partner to start the process of collecting payment.
    my name is Tomas Calle i am the accounting executive Nilho.
    `,
  });

  return emailContent;
};
