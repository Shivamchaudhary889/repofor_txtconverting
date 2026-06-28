import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrainer, useBatches } from "@/hooks/use-data";
import { Mail, Phone, MapPin, Star, Calendar, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";

export default function TrainerDetail() {
  const [, params] = useRoute("/trainers/:id");
  const trainerId = params?.id;

  const { data: trainer, isLoading } = useTrainer(trainerId);
  const { data: allBatches = [] } = useBatches();
  const trainerBatches = trainer ? allBatches.filter(b => b.trainerId === trainer.id) : [];

  useEffect(() => {
    document.title = `${trainer?.name || 'Trainer'} · Maverick`;
  }, [trainer]);

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!trainer) return <div>Trainer not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" asChild className="h-8 w-8 shrink-0">
          <Link href="/trainers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Trainer Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-md">
                  <AvatarImage src={trainer.avatar} />
                  <AvatarFallback className="text-xl">{trainer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{trainer.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{trainer.title}</p>

                <div className="flex gap-4 items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono">{trainer.rating}</div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Avg Rating</div>
                  </div>
                  <div className="h-10 w-px bg-border"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono">{trainer.utilization}%</div>
                    <div className="text-xs text-muted-foreground">Utilization</div>
                  </div>
                </div>

                <div className="w-full space-y-3 pt-4 border-t border-border text-sm text-left">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{trainer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{trainer.location}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Specializations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trainer.skills.map(s => (
                  <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Current & Recent Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainerBatches.length > 0 ? (
                  trainerBatches.map(batch => (
                    <div key={batch.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <Link href={`/batches/${batch.id}`} className="font-semibold hover:text-primary transition-colors">
                            {batch.name}
                          </Link>
                          <StatusBadge status={batch.status} className="text-[10px] py-0 h-5" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{batch.technology}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {batch.startDate}</span>
                          <span>{batch.candidateCount} Candidates</span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 text-right">
                        <div className="text-xs text-muted-foreground mt-1">Pass Rate: <span className="font-mono">{batch.passRate}%</span></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No batches assigned currently.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
