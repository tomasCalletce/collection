import { db } from "~/server/db/connection";
import { inquiries } from "~/server/db/schemas/inquiries";
import { verifyInvoicesSchema } from "~/server/db/schemas/inquiries";

type CreateInquiryBody = {
  target_email: string;
  invoice_data: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateInquiryBody;

    const { target_email, invoice_data, ask_repetition } =
      verifyInvoicesSchema.parse(body);

    const newInquiry = await db
      .insert(inquiries)
      .values({
        target_email: target_email,
        invoice_data: invoice_data,
        ask_repetition: ask_repetition,
      })
      .returning({
        id: inquiries.id,
      });

    return Response.json(newInquiry[0], { status: 201 });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return Response.json(
      { error: "Failed to create inquiry" },
      { status: 500 },
    );
  }
}
