import { type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { db } from "~/server/db/connection";
import { users } from "~/server/db/schemas/users";

export async function POST(request: NextRequest) {
  try {
    const evt = await verifyWebhook(request);

    const { id } = evt.data;
    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const eventType = evt.type;
    if (eventType !== "user.created") {
      return Response.json({ error: "Invalid event type" }, { status: 400 });
    }

    const [newUser] = await db
      .insert(users)
      .values({
        clerk_id: id,
      })
      .returning({
        id: users.id,
      });
    if (!newUser) {
      return Response.json({ error: "Failed to create user" }, { status: 500 });
    }

    return Response.json(
      { success: true, message: "Webhook processed successfully" },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return Response.json(
      { error: "Invalid webhook signature or payload" },
      { status: 401 },
    );
  }
}
