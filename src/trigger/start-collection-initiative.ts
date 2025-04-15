import { schemaTask, AbortTaskRunError } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { dbSocket } from "~/server/db/connection";
import { schedules } from "@trigger.dev/sdk/v3";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { z } from "zod";
import { collectionInitiative } from "~/trigger/collection-initiative";
import { StatusInquiryValues } from "~/server/db/schemas/constants";

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
        cron: collectionWorkloads.cron,
        timezone: collectionWorkloads.timezone,
        ask_repetition: collectionWorkloads.ask_repetition,
        status: collectionWorkloads.status,
        start_date: collectionWorkloads.start_date,
        created_at: collectionWorkloads.created_at,
        updated_at: collectionWorkloads.updated_at,
      })
      .from(collectionWorkloads)
      .where(eq(collectionWorkloads.id, initiative_id))
      .limit(1);

    if (!collectionWorkload) {
      throw new AbortTaskRunError("collectionWorkload not found");
    }

    return await dbSocket.transaction(async (tx) => {
      await tx
        .update(collectionWorkloads)
        .set({
          status: StatusInquiryValues.IN_PROGRESS,
          updated_at: new Date(),
        })
        .where(eq(collectionWorkloads.id, initiative_id));

      const createdSchedule = await schedules.create({
        task: collectionInitiative.id,
        cron: collectionWorkload.cron,
        timezone: collectionWorkload.timezone,
        deduplicationKey: `collection-initiative-${collectionWorkload.id}`,
        externalId: collectionWorkload.id,
      });
      if (!createdSchedule) {
        throw new AbortTaskRunError("Failed to create schedule");
      }

      return { createdSchedule, collectionWorkload };
    });
  },
});
