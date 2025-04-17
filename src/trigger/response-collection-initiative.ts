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
        ),
      )

      .limit(1);
    if (!collectionWorkload) {
      throw new AbortTaskRunError("Collection workload not found");
    }
  },
});
