import { schemaTask } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { db } from "~/server/db/connection";
import { inquiries } from "~/server/db/schemas/inquiries";
import { z } from "zod";

export const collectionInitiative = schemaTask({
  id: "collection-initiative",
  schema: z.object({
    initiative_id: z.string().uuid(),
  }),
  run: async (payload) => {
    const [inquiry] = await db
      .select({
        id: inquiries.id,
        target_email: inquiries.target_email,
        ask_repetition: inquiries.ask_repetition,
        invoice_data: inquiries.invoice_data,
        status: inquiries.status,
        start_date: inquiries.start_date,
        created_at: inquiries.created_at,
        updated_at: inquiries.updated_at,
      })
      .from(inquiries)
      .where(eq(inquiries.id, payload.initiative_id))
      .limit(1);

    if (!inquiry) {
      console.log("No pending inquiries found to process");
      return;
    }

    console.log(inquiry);
  },
});
