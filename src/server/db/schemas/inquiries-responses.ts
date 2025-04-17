import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";

export const inquiriesResponses = pgTable("inquiries_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  _collection_workload: uuid("collection_workload_id").references(
    () => collectionWorkloads.id,
  ),
  header: text("header").notNull(),
  body: text("body").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const verifyInquiriesResponsesSchema = createInsertSchema(
  inquiriesResponses,
).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
