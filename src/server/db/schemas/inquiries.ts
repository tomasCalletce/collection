import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { TypeInquiryEnum } from "~/server/db/schemas/constants";

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  _collection_workload: uuid("collection_workload_id").references(
    () => collectionWorkloads.id,
  ),
  header: text("header").notNull(),
  body: text("body").notNull(),
  type_inquiry: TypeInquiryEnum("type_inquiry").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const verifyInquiriesSchema = createInsertSchema(inquiries);
