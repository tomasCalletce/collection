import { pgEnum } from "drizzle-orm/pg-core";
import { z } from "zod";

export const StatusInquiry = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);
export const StatusInquiryValues = StatusInquiry.Values;
export const StatusInquiryEnum = pgEnum("status_inquiry", [
  StatusInquiryValues.PENDING,
  StatusInquiryValues.IN_PROGRESS,
  StatusInquiryValues.COMPLETED,
  StatusInquiryValues.FAILED,
  StatusInquiryValues.CANCELLED,
]);

export const TypeInquiry = z.enum(["REQUEST", "RESPONSE"]);
export const TypeInquiryValues = TypeInquiry.Values;
export const TypeInquiryEnum = pgEnum("type_inquiry", [
  TypeInquiryValues.REQUEST,
  TypeInquiryValues.RESPONSE,
]);

export const Timezone = z.enum([
  "America/Sao_Paulo",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "America/Denver",
]);
export const TimezoneValues = Timezone.Values;
export const TimezoneEnum = pgEnum("timezone", [
  TimezoneValues["America/Sao_Paulo"],
  TimezoneValues["America/New_York"],
  TimezoneValues["America/Los_Angeles"],
  TimezoneValues["America/Chicago"],
  TimezoneValues["America/Denver"],
]);
