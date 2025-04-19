import { HydrateClient } from "~/trpc/server";

export default async function Workloads() {
  return (
    <HydrateClient>
      <main className="container mx-auto py-10">
        <h1 className="text-2xl font-bold">Workloads</h1>
      </main>
    </HydrateClient>
  );
}
