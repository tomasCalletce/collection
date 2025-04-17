import ReminderCollectionInquiry from "~/resend/templates/reminder-collection";
import { schedules, AbortTaskRunError } from "@trigger.dev/sdk/v3";
import { eq, and, gte } from "drizzle-orm";
import { dbSocket } from "~/server/db/connection";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { resend } from "~/resend/connection";
import { retry } from "@trigger.dev/sdk/v3";
import { inquiries } from "~/server/db/schemas/inquiries";
import { createFollowUpCollectionEmail } from "~/server/services/reminder-collection-email";
import { type invoiceSchema } from "~/server/db/schemas/invoice";
import { type z } from "zod";
import {
  TypeInquiryValues,
  StatusInquiryValues,
} from "~/server/db/schemas/constants";

export const reminderCollectionInitiative = schedules.task({
  id: "reminder-collection-initiative",
  run: async (payload) => {
    if (!payload.externalId) {
      throw new AbortTaskRunError("External ID is required");
    }

    const [collectionWorkload] = await dbSocket
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
      .where(
        and(
          eq(collectionWorkloads.id, payload.externalId),
          eq(collectionWorkloads.status, StatusInquiryValues.IN_PROGRESS),
          gte(collectionWorkloads.ask_repetition, 0),
        ),
      )

      .limit(1);
    if (!collectionWorkload) {
      throw new AbortTaskRunError("Collection workload not found");
    }

    const allInquiries = await dbSocket
      .select()
      .from(inquiries)
      .where(eq(inquiries._collection_workload, collectionWorkload.id));

    const invoiceData = collectionWorkload.invoice_data as z.infer<
      typeof invoiceSchema
    >;

    const reminderCollectionEmail = await createFollowUpCollectionEmail(
      invoiceData,
      allInquiries,
    );

    const formattedReminderEmail = ReminderCollectionInquiry({
      recipientName: invoiceData.recipient.name,
      body: reminderCollectionEmail.body,
      total: invoiceData.amount,
      senderName: "Nilho",
    });

    const updateAndSendEmail = await dbSocket.transaction(async (tx) => {
      const createdInquiry = await tx.insert(inquiries).values({
        _collection_workload: collectionWorkload.id,
        header: reminderCollectionEmail.subject,
        body: reminderCollectionEmail.body,
        type: TypeInquiryValues.REQUEST,
      });
      if (!createdInquiry) {
        throw new AbortTaskRunError("Failed to create inquiry");
      }

      const updatedCollectionWorkload = await tx
        .update(collectionWorkloads)
        .set({
          ask_repetition: collectionWorkload.ask_repetition - 1,
          updated_at: new Date(),
        })
        .where(eq(collectionWorkloads.id, collectionWorkload.id));
      if (!updatedCollectionWorkload) {
        throw new AbortTaskRunError("Failed to update collection workload");
      }

      const inquiryEmailResult = await retry.onThrow(
        async () => {
          const { data, error } = await resend.emails.send({
            from: "hello@updates.usecroma.com",
            to: ["tomas@nilho.co"],
            subject: `${reminderCollectionEmail.subject} | Nilho | ${collectionWorkload.id}`,
            headers: {
              "Message-ID": `<collection-initiative-${collectionWorkload.id}@usecroma.com>`,
            },
            html: formattedReminderEmail,
          });

          if (error) {
            console.log(error.message);
            throw new AbortTaskRunError("Failed to send email");
          }

          return data;
        },
        { maxAttempts: 2 },
      );

      return inquiryEmailResult;
    });

    return updateAndSendEmail;
  },
});
