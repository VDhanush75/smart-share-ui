import { ExternalLink, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ResourceRow } from "@/services/resourceService";

interface RecentUploadsTableProps {
  rows: ResourceRow[];
  onDelete: (row: ResourceRow) => void;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentUploadsTable({ rows, onDelete }: RecentUploadsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Share Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Downloads</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const expired = new Date(row.expires_at).getTime() <= Date.now();
            return (
              <TableRow key={row.id}>
                <TableCell className="max-w-[220px] truncate font-medium text-foreground">
                  {row.original_name}
                </TableCell>
                <TableCell className="font-mono text-xs tracking-wider">{row.share_code}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {row.file_type}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatBytes(row.file_size)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(row.created_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {expired ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : (
                    <span className="text-muted-foreground">{formatDate(row.expires_at)}</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.views ?? 0}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {(row as ResourceRow & { downloads?: number }).downloads ?? 0}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" title="View resource">
                      <Link
                        to="/view/$shareCode"
                        params={{ shareCode: row.share_code }}
                        target="_blank"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete resource"
                      onClick={() => onDelete(row)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
