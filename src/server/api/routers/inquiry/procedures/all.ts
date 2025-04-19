import { publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db/connection";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { desc } from "drizzle-orm";
import { z } from "zod";

export const all = publicProcedure
  .input(
    z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
    }),
  )
  .query(async ({ input }) => {
    const allInquiries = await db
      .select({
        id: collectionWorkloads.id,
        target_email: collectionWorkloads.target_email,
        max_attempts: collectionWorkloads.max_attempts,
        invoice: collectionWorkloads.invoice,
        timezone: collectionWorkloads.timezone,
        status_collection_workload:
          collectionWorkloads.status_collection_workload,
        start_date: collectionWorkloads.start_date,
        created_at: collectionWorkloads.created_at,
        updated_at: collectionWorkloads.updated_at,
      })
      .from(collectionWorkloads)
      .orderBy(desc(collectionWorkloads.created_at))
      .limit(input.limit)
      .offset((input.page - 1) * input.limit);

    return allInquiries;
  });
