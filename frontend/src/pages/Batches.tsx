import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useBatches } from "@/hooks/use-data";
import { Search, Filter, LayoutGrid, List } from "lucide-react";

export default function Batches() {
  const [view, setView] = useState<"table" | "kanban">(
    () => (localStorage.getItem("batches.view") as "table" | "kanban") ?? "table"
  );
  const [search, setSearch] = useState("");
  const { data: batches = [], isLoading } = useBatches();

  useEffect(() => {
    document.title = "Batches · Maverick";
  }, []);

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.technology.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  );

  const statuses = ["Planned", "In Progress", "On Hold", "Completed", "Archived"] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground mt-1">Manage training batches across all locations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Export</Button>
          <Button asChild><Link href="/batches/new">New Batch</Link></Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search batches..." 
              className="pl-9 bg-card"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 bg-card">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center bg-card rounded-md border border-border p-1">
          <Button 
            variant={view === "table" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-7 px-2"
            onClick={() => { localStorage.setItem("batches.view", "table"); setView("table"); }}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button 
            variant={view === "kanban" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-7 px-2"
            onClick={() => { localStorage.setItem("batches.view", "kanban"); setView("kanban"); }}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Board
          </Button>
        </div>
      </div>

      {view === "table" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Technology</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Loading batches…</TableCell></TableRow>
              )}
              {filteredBatches.map((batch) => (
                <TableRow key={batch.id} className="hover:bg-muted/50 cursor-pointer transition-colors group">
                  <TableCell className="font-medium">
                    <Link href={`/batches/${batch.id}`} className="text-primary hover:underline group-hover:text-primary/80">
                      {batch.name}
                    </Link>
                  </TableCell>
                  <TableCell>{batch.technology}</TableCell>
                  <TableCell>{batch.location}</TableCell>
                  <TableCell className="text-muted-foreground">{batch.startDate} to {batch.endDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{batch.candidateCount}</span>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${batch.attendancePercent}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={batch.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
          {statuses.map(status => {
            const cols = filteredBatches.filter(b => b.status === status);
            return (
              <div key={status} className="shrink-0 w-80 flex flex-col gap-3 snap-start">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-semibold text-sm">{status}</h3>
                  <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {cols.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {cols.map(batch => (
                    <Card key={batch.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                      <CardContent className="p-4">
                        <Link href={`/batches/${batch.id}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{batch.name}</h4>
                            <StatusBadge status={batch.status} className="text-[10px] px-1.5 py-0 h-4" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{batch.technology}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{batch.location}</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono">{batch.candidateCount}</span> candidates
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
