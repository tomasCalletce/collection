import { schedules, AbortTaskRunError } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { db } from "~/server/db/connection";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { resend } from "~/resend/connection";
import { retry } from "@trigger.dev/sdk/v3";

export const collectionInitiative = schedules.task({
  id: "collection-initiative",
  run: async (payload) => {
    if (!payload.externalId) {
      throw new AbortTaskRunError("External ID is required");
    }

    const [collectionWorkload] = await db
      .select({
        id: collectionWorkloads.id,
        target_email: collectionWorkloads.target_email,
        ask_repetition: collectionWorkloads.ask_repetition,
        invoice_data: collectionWorkloads.invoice_data,
        status: collectionWorkloads.status,
        start_date: collectionWorkloads.start_date,
        created_at: collectionWorkloads.created_at,
        updated_at: collectionWorkloads.updated_at,
      })
      .from(collectionWorkloads)
      .where(eq(collectionWorkloads.id, payload.externalId))
      .limit(1);
    if (!collectionWorkload) {
      throw new AbortTaskRunError("Collection workload not found");
    }

    const inquiryEmailResult = await retry.onThrow(
      async () => {
        const { data, error } = await resend.emails.send({
          from: "tr@updates.usecroma.com",
          to: [collectionWorkload.target_email],
          subject: "Hello World",
          html: "<strong>It works!</strong>",
        });

        if (error) {
          console.log(error.message);
          throw new AbortTaskRunError("Failed to send email");
        }

        return data;
      },
      { maxAttempts: 2 },
    );
  },
});
