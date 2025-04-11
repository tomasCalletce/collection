import { createTRPCRouter } from "~/server/api/trpc";
import { all } from "~/server/api/routers/inquiry/procedures/all";

export const inquiryRouter = createTRPCRouter({
  all,
});
