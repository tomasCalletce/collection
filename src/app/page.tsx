import { HydrateClient } from "~/trpc/server";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/server";
import {
  Mail,
  RefreshCcw,
  Calendar,
  FileJson,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default async function Home() {
  const allInquiries = await api.inquiry.all({
    page: 1,
    limit: 10,
  });

  const getStatusIcon = (status: "PENDING" | "ACCEPTED" | "REJECTED") => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "ACCEPTED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

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
                <TableHead>Invoice Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="flex items-center gap-2">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    {inquiry.target_email}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <RefreshCcw className="text-muted-foreground h-4 w-4" />
                    {inquiry.ask_repetition}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {getStatusIcon(inquiry.status)}
                    {inquiry.status}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    {new Date(inquiry.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <FileJson className="text-muted-foreground h-4 w-4" />
                    {JSON.stringify(inquiry.invoice_data).slice(0, 30)}...
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
