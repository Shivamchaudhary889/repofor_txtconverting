import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { useCandidates, useBatches } from "@/hooks/use-data";
import { Search, Filter, Download, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Candidates() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: candidates = [] } = useCandidates();
  const { data: batches = [] } = useBatches();

  useEffect(() => {
    document.title = "Candidates · Maverick";
  }, []);

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selected.size === filteredCandidates.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredCandidates.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground mt-1">Directory of all trainees across batches.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button variant="secondary" className="mr-2">
              <Mail className="h-4 w-4 mr-2" /> Message ({selected.size})
            </Button>
          )}
          <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search candidates by name or email..." 
            className="pl-9 bg-card"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="shrink-0 bg-card">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={selected.size === filteredCandidates.length && filteredCandidates.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.slice(0, 50).map((c) => {
                const batch = batches.find(b => b.id === c.batchId);
                return (
                  <TableRow key={c.id} className="hover:bg-muted/50 group">
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selected.has(c.id)}
                        onCheckedChange={() => toggleSelect(c.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={c.avatar} />
                          <AvatarFallback>{c.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/candidates/${c.id}`} className="font-medium text-foreground hover:text-primary hover:underline transition-colors">
                            {c.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{c.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/batches/${c.batchId}`} className="text-sm text-primary hover:underline">
                        {batch?.name || "Unknown"}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span>{c.performance}%</span>
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full ${c.performance >= 80 ? 'bg-green-500' : c.performance >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: `${c.performance}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span>{c.attendancePercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredCandidates.length > 50 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t border-border bg-muted/20">
              Showing 50 of {filteredCandidates.length} results. Use search to narrow down.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
