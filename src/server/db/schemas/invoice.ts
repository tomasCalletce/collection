import { z } from "zod";

export const invoiceSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  description: z.string(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      rate: z.number(),
      amount: z.number(),
    }),
  ),
  recipient: z.object({
    name: z.string(),
    company: z.string(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }),
});
