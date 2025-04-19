import { type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { dbSocket } from "~/server/db/connection";
import { env } from "~/env";
import { orgs } from "~/server/db/schemas/orgs";
import { users } from "~/server/db/schemas/users";
import { orgUsers } from "~/server/db/schemas/org-users";

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request, {
      signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET_ORG_CREATED as string,
    });

    const { id } = event.data;
    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const eventType = event.type;
    if (eventType !== "organization.created") {
      return Response.json({ error: "Invalid event type" }, { status: 400 });
    }

    const creatorId = event.data.created_by;
    if (!creatorId) {
      return Response.json(
        { error: "Creator ID is required" },
        { status: 400 },
      );
    }

    const result = await dbSocket.transaction(async (tx) => {
      const [newOrg] = await tx
        .insert(orgs)
        .values({
          clerk_id: id,
          name: event.data.name,
        })
        .returning({
          id: orgs.id,
        });
      if (!newOrg) {
        throw new Error("Failed to create organization");
      }

      const [user] = await tx
        .insert(users)
        .values({
          clerk_id: creatorId,
        })
        .onConflictDoUpdate({
          target: users.clerk_id,
          set: {
            updated_at: new Date(),
          },
        })
        .returning({
          id: users.id,
        });
      if (!user) {
        throw new Error("Failed to find or create user");
      }

      const [orgUser] = await tx
        .insert(orgUsers)
        .values({
          _org: newOrg.id,
          _user: user.id,
        })
        .returning({
          id: orgUsers.id,
        });
      if (!orgUser) {
        throw new Error("Failed to link user to organization");
      }

      return { org_id: newOrg.id, user_id: user.id, org_user_id: orgUser.id };
    });

    return Response.json(
      {
        success: true,
        message: "Webhook processed successfully",
        data: result,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error processing webhook:", err);
    return Response.json(
      { error: "Error processing webhook" },
      { status: 500 },
    );
  }
}
