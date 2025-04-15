import { schedules, AbortTaskRunError } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { db } from "~/server/db/connection";
import { inquiries } from "~/server/db/schemas/inquiries";
import { resend } from "~/resend/connection";

export const collectionInitiative = schedules.task({
  id: "collection-initiative",
  run: async (payload) => {
    if (!payload.externalId) {
      throw new AbortTaskRunError("External ID is required");
    }

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
      .where(eq(inquiries.id, payload.externalId))
      .limit(1);
    if (!inquiry) {
      throw new AbortTaskRunError("Inquiry not found");
    }

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [inquiry.target_email],
      subject: "Hello World",
      html: "<strong>It works!</strong>",
    });
    if (error) {
      throw new AbortTaskRunError("Failed to send email");
    }

    console.log(data);
    return data;
  },
});
