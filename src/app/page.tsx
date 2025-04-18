import { HydrateClient } from "~/trpc/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/server";
import { Mail, RefreshCcw, Calendar } from "lucide-react";

export default async function Home() {
  const allInquiries = await api.inquiry.all({
    page: 1,
    limit: 10,
  });

  return (
    <HydrateClient>
      <main className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Inquiries</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your collection inquiries
          </p>
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Email</TableHead>
                <TableHead>Repetitions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <Mail className="text-muted-foreground h-4 w-4" />
                      {inquiry.target_email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <RefreshCcw className="text-muted-foreground h-4 w-4" />
                      {inquiry.ask_repetition}
                    </span>
                  </TableCell>
                  <TableCell>{inquiry.status}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      {new Date(inquiry.start_date).toLocaleDateString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </HydrateClient>
  );
}
