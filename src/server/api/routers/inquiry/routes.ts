import { createTRPCRouter } from "~/server/api/trpc";
import { all } from "~/server/api/routers/inquiry/procedures/all";
import { test } from "~/server/api/routers/inquiry/procedures/test";

export const inquiryRouter = createTRPCRouter({
  all,
  test,
});
