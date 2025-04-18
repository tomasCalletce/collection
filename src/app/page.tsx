import { HydrateClient } from "~/trpc/server";
import Link from "next/link";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center md:mb-24">
              <h1
                className="mb-6 text-6xl font-bold tracking-tight text-neutral-900 md:text-7xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Collection <span className="text-blue-600">Agent</span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-neutral-600">
                Simplifying affiliate network payments for nilho.co with
                automated invoice management
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-3xl bg-neutral-50 p-8 md:p-10">
                <h2
                  className="mb-6 text-2xl font-bold text-neutral-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  What We Do
                </h2>
                <p className="leading-relaxed text-neutral-700">
                  At nilho.co, we&apos;re a discount aggregator working with
                  multiple affiliate networks. Each network requires us to send
                  invoices to receive payments, which became overwhelming to
                  manage manually. That&apos;s why we built this collection
                  agent — to automate and streamline the entire payment
                  collection process.
                </p>
              </div>

              <div className="rounded-3xl bg-neutral-50 p-8 md:p-10">
                <h2
                  className="mb-6 text-2xl font-bold text-neutral-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Our Tech Stack
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Vercel AI Kit",
                    "Trigger.dev",
                    "Cloudflare Email",
                    "OpenAI",
                    "Next.js",
                    "tRPC",
                    "Tailwind CSS",
                  ].map((tech) => (
                    <div
                      key={tech}
                      className="rounded-xl bg-blue-100 px-4 py-3 text-center text-sm font-medium text-blue-800"
                    >
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
