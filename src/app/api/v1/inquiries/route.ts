import { db } from "~/server/db/connection";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { verifyCollectionWorkloadsSchema } from "~/server/db/schemas/collection-workloads";
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
      verifyCollectionWorkloadsSchema.parse(body);

    const [newCollectionWorkload] = await db
      .insert(collectionWorkloads)
      .values({
        target_email: target_email,
        invoice_data: invoice_data,
        ask_repetition: ask_repetition,
        timezone: timezone,
        cron: cron,
      })
      .returning({
        id: collectionWorkloads.id,
        target_email: collectionWorkloads.target_email,
        ask_repetition: collectionWorkloads.ask_repetition,
        invoice_data: collectionWorkloads.invoice_data,
        timezone: collectionWorkloads.timezone,
        cron: collectionWorkloads.cron,
        status: collectionWorkloads.status,
        start_date: collectionWorkloads.start_date,
        created_at: collectionWorkloads.created_at,
        updated_at: collectionWorkloads.updated_at,
      });
    if (!newCollectionWorkload) {
      return Response.json(
        { error: "Failed to create inquiry" },
        { status: 500 },
      );
    }

    const handle = await startCollectionInitiative.trigger(
      { initiative_id: newCollectionWorkload.id },
      { delay: "1s" },
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
        data: newCollectionWorkload,
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
