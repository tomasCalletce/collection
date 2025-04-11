import { schedules } from "@trigger.dev/sdk/v3";
import { desc, eq, and, gte } from "drizzle-orm";
import { db } from "~/server/db/connection";
import { inquiries } from "~/server/db/schemas/inquiries";
import { StatusInquiryValues } from "~/server/db/schemas/constants";
import { collectionInitiative } from "~/trigger/collection-initiative";

export const newCollectionInitiatives = schedules.task({
  id: "new-collection-initiatives",
  cron: "0 */2 * * *",
  run: async () => {
    const allInquiries = await db
      .select({
        id: inquiries.id,
        cron: inquiries.cron,
        timezone: inquiries.timezone,
      })
      .from(inquiries)
      .where(
        and(
          eq(inquiries.status, StatusInquiryValues.PENDING),
          gte(inquiries.start_date, new Date()),
        ),
      )
      .orderBy(desc(inquiries.created_at));

    if (allInquiries.length === 0) {
      console.log("No pending inquiries found to process");
      return;
    }

    for (const inquiry of allInquiries) {
      await schedules.create({
        task: collectionInitiative.id,
        cron: inquiry.cron,
        timezone: inquiry.timezone,
        externalId: inquiry.id,
        deduplicationKey: `${inquiry.id}-collection-initiative`,
      });
    }
  },
});
