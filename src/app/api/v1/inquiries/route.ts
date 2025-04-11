import { db } from "~/server/db/connection";
import { inquiries } from "~/server/db/schemas/inquiries";
import { verifyInvoicesSchema } from "~/server/db/schemas/inquiries";
import { startCollectionInitiative } from "~/trigger/start-collection-initiative";

type CreateInquiryBody = {
  target_email: string;
  ask_repetition: number;
  timezone: string;
  cron: string;
  invoice_data: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateInquiryBody;

    const { target_email, invoice_data, ask_repetition, timezone, cron } =
      verifyInvoicesSchema.parse(body);

    const [newInquiry] = await db
      .insert(inquiries)
      .values({
        target_email: target_email,
        invoice_data: invoice_data,
        ask_repetition: ask_repetition,
        timezone: timezone,
        cron: cron,
      })
      .returning({
        id: inquiries.id,
        target_email: inquiries.target_email,
        ask_repetition: inquiries.ask_repetition,
        invoice_data: inquiries.invoice_data,
        timezone: inquiries.timezone,
        cron: inquiries.cron,
        status: inquiries.status,
        start_date: inquiries.start_date,
        created_at: inquiries.created_at,
        updated_at: inquiries.updated_at,
      });
    if (!newInquiry) {
      return Response.json(
        { error: "Failed to create inquiry" },
        { status: 500 },
      );
    }

    const handle = await startCollectionInitiative.trigger(
      { initiative_id: newInquiry.id },
      { delay: "1h" },
    );

    if (!handle) {
      return Response.json(
        { error: "Failed to create inquiry" },
        { status: 500 },
      );
    }

    return Response.json(
      {
        success: true,
        data: newInquiry,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return Response.json(
      { error: "Failed to create inquiry" },
      { status: 500 },
    );
  }
}
