import { schemaTask, AbortTaskRunError } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { dbSocket } from "~/server/db/connection";
import { schedules } from "@trigger.dev/sdk/v3";
import { inquiries } from "~/server/db/schemas/inquiries";
import { z } from "zod";
import { collectionInitiative } from "~/trigger/collection-initiative";
import { StatusInquiryValues } from "~/server/db/schemas/constants";

export const startCollectionInitiative = schemaTask({
  id: "start-collection-initiative",
  schema: z.object({
    initiative_id: z.string().uuid(),
  }),
  run: async ({ initiative_id }) => {
    const [inquiry] = await dbSocket
      .select({
        id: inquiries.id,
        target_email: inquiries.target_email,
        cron: inquiries.cron,
        timezone: inquiries.timezone,
        ask_repetition: inquiries.ask_repetition,
        status: inquiries.status,
        start_date: inquiries.start_date,
        created_at: inquiries.created_at,
        updated_at: inquiries.updated_at,
      })
      .from(inquiries)
      .where(eq(inquiries.id, initiative_id))
      .limit(1);

    if (!inquiry) {
      throw new AbortTaskRunError("Inquiry not found");
    }

    return await dbSocket.transaction(async (tx) => {
      await tx
        .update(inquiries)
        .set({
          status: StatusInquiryValues.IN_PROGRESS,
          updated_at: new Date(),
        })
        .where(eq(inquiries.id, initiative_id));

      const createdSchedule = await schedules.create({
        task: collectionInitiative.id,
        cron: inquiry.cron,
        timezone: inquiry.timezone,
        deduplicationKey: `collection-initiative-${inquiry.id}`,
        externalId: inquiry.id,
      });
      if (!createdSchedule) {
        throw new AbortTaskRunError("Failed to create schedule");
      }

      return { createdSchedule, inquiry };
    });
  },
});
