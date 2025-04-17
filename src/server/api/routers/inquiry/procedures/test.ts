import { publicProcedure } from "~/server/api/trpc";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { z } from "zod";
import { dbSocket } from "~/server/db/connection";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createInitialCollectionEmail } from "~/server/services/create-initial-collection-email";
import { type verifyCollectionWorkloadsSchema } from "~/server/db/schemas/collection-workloads";

export const test = publicProcedure
  .input(
    z.object({
      initiative_id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const [collectionWorkload] = await dbSocket
      .select({
        id: collectionWorkloads.id,
        target_email: collectionWorkloads.target_email,
        invoice_data: collectionWorkloads.invoice_data,
        timezone: collectionWorkloads.timezone,
        cron: collectionWorkloads.cron,
      })
      .from(collectionWorkloads)
      .where(eq(collectionWorkloads.id, input.initiative_id))
      .limit(1);
    if (!collectionWorkload) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Collection workload not found",
      });
    }

    const invoiceData = collectionWorkload.invoice_data as z.infer<
      typeof verifyCollectionWorkloadsSchema.shape.invoice_data
    >;

    const initialCollectionEmail =
      await createInitialCollectionEmail(invoiceData);

    console.log(initialCollectionEmail);

    return initialCollectionEmail;
  });
