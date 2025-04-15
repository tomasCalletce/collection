import { publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db/connection";
import { inquiries } from "~/server/db/schemas/collection-workloads";
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
        id: inquiries.id,
        target_email: inquiries.target_email,
        ask_repetition: inquiries.ask_repetition,
        invoice_data: inquiries.invoice_data,
        timezone: inquiries.timezone,
        status: inquiries.status,
        start_date: inquiries.start_date,
        created_at: inquiries.created_at,
        updated_at: inquiries.updated_at,
      })
      .from(inquiries)
      .orderBy(desc(inquiries.created_at))
      .limit(input.limit)
      .offset((input.page - 1) * input.limit);

    return allInquiries;
  });
