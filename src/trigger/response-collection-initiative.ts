import { AbortTaskRunError } from "@trigger.dev/sdk/v3";
import { eq, and } from "drizzle-orm";
import { dbSocket } from "~/server/db/connection";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { StatusInquiryValues } from "~/server/db/schemas/constants";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { inquiries } from "~/server/db/schemas/inquiries";
import { TypeInquiryValues } from "~/server/db/schemas/constants";

export const responseCollectionInitiative = schemaTask({
  id: "response-collection-initiative",
  schema: z.object({
    initiative_id: z.string().uuid(),
    email: z.object({
      subject: z.string(),
      body: z.string(),
    }),
  }),
  run: async ({ initiative_id, email }) => {
    const [collectionWorkload] = await dbSocket
      .select({
        id: collectionWorkloads.id,
      })
      .from(collectionWorkloads)
      .where(
        and(
          eq(collectionWorkloads.id, initiative_id),
          eq(collectionWorkloads.status, StatusInquiryValues.IN_PROGRESS),
        ),
      )
      .limit(1);
    if (!collectionWorkload) {
      throw new AbortTaskRunError("Collection workload not found");
    }

    const newInquiry = await dbSocket
      .insert(inquiries)
      .values({
        _collection_workload: collectionWorkload.id,
        header: email.subject,
        body: email.body,
        type: TypeInquiryValues.RESPONSE,
      })
      .returning();
    if (!newInquiry) {
      throw new AbortTaskRunError("Failed to create inquiry");
    }
  },
});
