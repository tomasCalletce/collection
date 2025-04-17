import ReminderCollectionInquiry from "~/resend/templates/reminder-collection";
import { schedules, AbortTaskRunError } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { db } from "~/server/db/connection";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { resend } from "~/resend/connection";
import { retry } from "@trigger.dev/sdk/v3";
import { inquiries } from "~/server/db/schemas/inquiries";
import { TypeInquiryValues } from "~/server/db/schemas/constants";
import { type invoiceSchema } from "~/server/db/schemas/invoice";
import { type z } from "zod";

export const responseCollectionInitiative = schedules.task({
  id: "response-collection-initiative",
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

    // Get past inquiries to determine how many reminders have been sent
    const allInquiries = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries._collection_workload, collectionWorkload.id));

    // Filter for request-type inquiries to count reminders
    const requestInquiries = allInquiries.filter(
      (inquiry) => inquiry.type === TypeInquiryValues.REQUEST,
    );

    const reminderCount = requestInquiries.length;
    const invoiceData = collectionWorkload.invoice_data as z.infer<
      typeof invoiceSchema
    >;

    // Get the latest response or message to display
    const latestResponse =
      "Thank you for your recent communication. This is a confirmation of receipt.";

    // Create a response message using our template
    const responseEmail = ReminderCollectionInquiry({
      recipientName: invoiceData.recipient.name,
      body: latestResponse,
      total: invoiceData.amount,
      senderName: "Nilho",
      reminderCount: reminderCount,
    });

    const inquiryEmailResult = await retry.onThrow(
      async () => {
        const { data, error } = await resend.emails.send({
          from: "hello@updates.usecroma.com",
          to: [collectionWorkload.target_email],
          subject: `Re: Invoice ${invoiceData.description} | Nilho | ${collectionWorkload.id}`,
          headers: {
            "Message-ID": `<collection-initiative-response-${collectionWorkload.id}-${reminderCount}@usecroma.com>`,
          },
          html: responseEmail,
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
  },
});
