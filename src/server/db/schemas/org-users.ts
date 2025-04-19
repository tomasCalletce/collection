import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { orgs } from "~/server/db/schemas/orgs";
import { users } from "~/server/db/schemas/users";

export const orgUsers = pgTable("org_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  _org: uuid("org_id").references(() => orgs.id),
  _user: uuid("user_id").references(() => users.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const verifyOrgUsersSchema = createInsertSchema(orgUsers);
