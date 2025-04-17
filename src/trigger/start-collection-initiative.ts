import StartCollectionTemplate from "~/resend/templates/start-collection";
import { type verifyCollectionWorkloadsSchema } from "~/server/db/schemas/collection-workloads";
import { schemaTask, AbortTaskRunError } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { dbSocket } from "~/server/db/connection";
import { schedules } from "@trigger.dev/sdk/v3";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { z } from "zod";
import { reminderCollectionInitiative } from "~/trigger/reminder-collection-initiative";
import { StatusInquiryValues } from "~/server/db/schemas/constants";
import { retry } from "@trigger.dev/sdk/v3";
import { resend } from "~/resend/connection";
import { createInitialCollectionEmail } from "~/server/services/create-initial-collection-email";

export const startCollectionInitiative = schemaTask({
  id: "start-collection-initiative",
  schema: z.object({
    initiative_id: z.string().uuid(),
  }),
  run: async ({ initiative_id }) => {
    const [collectionWorkload] = await dbSocket
      .select({
        id: collectionWorkloads.id,
        target_email: collectionWorkloads.target_email,
        invoice_data: collectionWorkloads.invoice_data,
        timezone: collectionWorkloads.timezone,
        cron: collectionWorkloads.cron,
      })
      .from(collectionWorkloads)
      .where(eq(collectionWorkloads.id, initiative_id))
      .limit(1);
    if (!collectionWorkload) {
      throw new AbortTaskRunError("collectionWorkload not found");
    }

    const invoiceData = collectionWorkload.invoice_data as z.infer<
      typeof verifyCollectionWorkloadsSchema.shape.invoice_data
    >;

    const initialCollectionEmail =
      await createInitialCollectionEmail(invoiceData);

    const startCollectionInitiativeEmail = StartCollectionTemplate({
      recipientName: invoiceData.recipient.name,
      body: initialCollectionEmail.body,
      total: invoiceData.amount,
      senderName: "Nilho",
    });

    return await dbSocket.transaction(async (tx) => {
      await tx
        .update(collectionWorkloads)
        .set({
          status: StatusInquiryValues.IN_PROGRESS,
          updated_at: new Date(),
        })
        .where(eq(collectionWorkloads.id, initiative_id));

      const createdSchedule = await schedules.create({
        task: reminderCollectionInitiative.id,
        cron: collectionWorkload.cron,
        timezone: collectionWorkload.timezone,
        deduplicationKey: `collection-initiative-${collectionWorkload.id}`,
        externalId: collectionWorkload.id,
      });
      if (!createdSchedule) {
        throw new AbortTaskRunError("Failed to create schedule");
      }

      const startCollectionInitiativeEmailResult = await retry.onThrow(
        async () => {
          const { data, error } = await resend.emails.send({
            from: "hello@updates.usecroma.com",
            to: ["tomas@nilho.co"],
            subject: `${initialCollectionEmail.subject} | Nilho | ${collectionWorkload.id}`,
            headers: {
              "Message-ID": `<collection-initiative-${collectionWorkload.id}@usecroma.com>`,
            },
            html: startCollectionInitiativeEmail,
          });
          if (error) {
            throw new AbortTaskRunError("Failed to send email");
          }

          return data;
        },
        { maxAttempts: 2 },
      );
      if (!startCollectionInitiativeEmailResult) {
        throw new AbortTaskRunError("Failed to send email");
      }

      return { createdSchedule, collectionWorkload };
    });
  },
});
