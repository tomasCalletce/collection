import { pgEnum } from "drizzle-orm/pg-core";
import { z } from "zod";

export const StatusCollectionWorkload = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);
export const StatusCollectionWorkloadValues = StatusCollectionWorkload.Values;
export const StatusCollectionWorkloadEnum = pgEnum(
  "status_collection_workload",
  [
    StatusCollectionWorkloadValues.PENDING,
    StatusCollectionWorkloadValues.IN_PROGRESS,
    StatusCollectionWorkloadValues.COMPLETED,
    StatusCollectionWorkloadValues.FAILED,
    StatusCollectionWorkloadValues.CANCELLED,
  ],
);

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
