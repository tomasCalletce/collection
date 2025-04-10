import { pgEnum } from "drizzle-orm/pg-core";
import { z } from "zod";

export const StatusInquiry = z.enum(["PENDING", "ACCEPTED", "REJECTED"]);
export const StatusInquiryValues = StatusInquiry.Values;
export const StatusInquiryEnum = pgEnum("status_inquiry", [
  StatusInquiryValues.PENDING,
  StatusInquiryValues.ACCEPTED,
  StatusInquiryValues.REJECTED,
]);
