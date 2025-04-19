import StartCollectionTemplate from "~/resend/templates/start-collection";
import { schemaTask, AbortTaskRunError } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { dbSocket } from "~/server/db/connection";
import { schedules } from "@trigger.dev/sdk/v3";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { z } from "zod";
import { reminderCollectionInitiative } from "~/trigger/reminder-collection-initiative";
import { StatusCollectionWorkloadValues } from "~/server/db/schemas/constants";
import { retry } from "@trigger.dev/sdk/v3";
import { resend } from "~/resend/connection";
import { askAIforInitialCollectionEmail } from "~/server/services/ai/ask-for-initial-collection-email";
import { inquiries } from "~/server/db/schemas/inquiries";
import { TypeInquiryValues } from "~/server/db/schemas/constants";
import { type verifyCollectionWorkloads } from "~/server/db/schemas/collection-workloads";

export const startCollectionInitiative = schemaTask({
  id: "start-collection-initiative",
  schema: z.object({
    _collection_workload: z.string().uuid(),
  }),
  run: async ({ _collection_workload }) => {
    const [collectionWorkload] = await dbSocket
      .select({
        id: collectionWorkloads.id,
        target_email: collectionWorkloads.target_email,
        invoice: collectionWorkloads.invoice,
        timezone: collectionWorkloads.timezone,
        cron: collectionWorkloads.cron,
      })
      .from(collectionWorkloads)
      .where(eq(collectionWorkloads.id, _collection_workload))
      .limit(1);
    if (!collectionWorkload) {
      throw new AbortTaskRunError("collectionWorkload not found");
    }

    const invoice =
      collectionWorkload.invoice as verifyCollectionWorkloads["invoice"];

    const initialCollectionEmail =
      await askAIforInitialCollectionEmail(invoice);

    const startCollectionInitiativeEmail = StartCollectionTemplate({
      recipientName: invoice.recipient.name,
      body: initialCollectionEmail.body,
      total: invoice.amount,
      senderName: "Nilho",
    });

    return await dbSocket.transaction(async (tx) => {
      const updatedCollectionWorkload = await tx
        .update(collectionWorkloads)
        .set({
          status_collection_workload:
            StatusCollectionWorkloadValues.IN_PROGRESS,
          updated_at: new Date(),
        })
        .where(eq(collectionWorkloads.id, _collection_workload));
      if (!updatedCollectionWorkload) {
        throw new AbortTaskRunError("Failed to update collection workload");
      }

      const createdInquiryRequest = await tx.insert(inquiries).values({
        _collection_workload: _collection_workload,
        header: initialCollectionEmail.subject,
        body: initialCollectionEmail.body,
        type_inquiry: TypeInquiryValues.REQUEST,
      });
      if (!createdInquiryRequest) {
        throw new AbortTaskRunError("Failed to create inquiry request");
      }

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
