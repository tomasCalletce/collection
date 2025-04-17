import { pgTable, timestamp, uuid, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  _collection_workload: uuid("collection_workload_id").references(
    () => collectionWorkloads.id,
  ),
  response: json("response").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const verifyInquiriesSchema = createInsertSchema(inquiries).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const formInquiriesSchema = createInsertSchema(inquiries).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
