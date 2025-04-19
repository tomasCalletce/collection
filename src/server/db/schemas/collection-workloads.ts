import { z } from "zod";
import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  json,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import {
  StatusCollectionWorkloadValues,
  StatusCollectionWorkloadEnum,
  TimezoneEnum,
} from "~/server/db/schemas/constants";
import { invoiceSchema } from "~/server/db/schemas/invoice";

export const collectionWorkloads = pgTable("collection_workloads", {
  id: uuid("id").primaryKey().defaultRandom(),
  target_email: varchar("target_email", { length: 255 }).notNull(),
  max_attempts: integer("max_attempts").notNull(),
  invoice: json("invoice").notNull(),
  timezone: TimezoneEnum("timezone").notNull(),
  cron: varchar("cron", { length: 100 }).notNull(),
  status_collection_workload: StatusCollectionWorkloadEnum(
    "status_collection_workload",
  )
    .notNull()
    .default(StatusCollectionWorkloadValues.PENDING),
  start_date: timestamp("start_date").notNull().defaultNow(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const verifyCollectionWorkloadsSchema = createInsertSchema(
  collectionWorkloads,
)
  .omit({
    id: true,
    target_email: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    invoice: invoiceSchema,
    target_email: z.string().email(),
  });
export type verifyCollectionWorkloads = z.infer<
  typeof verifyCollectionWorkloadsSchema
>;
