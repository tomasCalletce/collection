import { db } from "~/server/db/connection";
import { collectionWorkloads } from "~/server/db/schemas/collection-workloads";
import { verifyCollectionWorkloadsSchema } from "~/server/db/schemas/collection-workloads";
import { startCollectionInitiative } from "~/trigger/start-collection-initiative";

export async function POST(request: Request) {
  try {
    const { target_email, invoice, max_attempts, timezone, cron } =
      verifyCollectionWorkloadsSchema.parse(await request.json());

    const [newCollectionWorkload] = await db
      .insert(collectionWorkloads)
      .values({
        target_email: target_email,
        invoice: invoice,
        max_attempts: max_attempts,
        timezone: timezone,
        cron: cron,
      })
      .returning({
        id: collectionWorkloads.id,
        target_email: collectionWorkloads.target_email,
        max_attempts: collectionWorkloads.max_attempts,
        invoice: collectionWorkloads.invoice,
        timezone: collectionWorkloads.timezone,
        cron: collectionWorkloads.cron,
        status_collection_workload:
          collectionWorkloads.status_collection_workload,
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
      {
        _collection_workload: newCollectionWorkload.id,
      },
      {
        delay: "1s",
      },
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
    console.error("Error creating inquiry:", { error });
    return Response.json(
      { error: "Failed to create inquiry" },
      { status: 500 },
    );
  }
}
