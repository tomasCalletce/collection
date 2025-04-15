import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  json,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { StatusInquiryEnum, TimezoneEnum } from "~/server/db/schemas/constants";
import { invoiceSchema } from "~/server/db/schemas/invoice";

export const collectionWorkloads = pgTable("collection_workloads", {
  id: uuid("id").primaryKey().defaultRandom(),
  target_email: varchar("target_email", { length: 255 }).notNull(),
  ask_repetition: integer("ask_repetition").notNull(),
  invoice_data: json("invoice_data").notNull(),
  timezone: TimezoneEnum("timezone").notNull(),
  cron: varchar("cron", { length: 100 }).notNull(),
  status: StatusInquiryEnum("status").notNull().default("PENDING"),
  start_date: timestamp("start_date").notNull().defaultNow(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const verifyCollectionWorkloadsSchema = createInsertSchema(
  collectionWorkloads,
)
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    invoice_data: invoiceSchema,
  });
export const formCollectionWorkloadsSchema = createInsertSchema(
  collectionWorkloads,
).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
