import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTrainers } from "@/hooks/use-data";
import { Search, MapPin, Star, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Trainers() {
  const [search, setSearch] = useState("");
  const { data: trainers = [] } = useTrainers();

  useEffect(() => {
    document.title = "Trainers · Maverick";
  }, []);

  const filteredTrainers = trainers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trainers</h1>
          <p className="text-muted-foreground mt-1">Directory of all training staff and subject matter experts.</p>
        </div>
        <Button>Add Trainer</Button>
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or skills..." 
          className="pl-9 bg-card"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrainers.map((t) => (
          <Link key={t.id} href={`/trainers/${t.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col group">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                      <AvatarImage src={t.avatar} />
                      <AvatarFallback>{t.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{t.name}</h3>
                      <p className="text-sm text-muted-foreground">{t.title}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {t.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500" /> {t.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {t.currentBatches} Batches
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Utilization</span>
                      <span className="font-mono">{t.utilization}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${t.utilization > 90 ? 'bg-amber-500' : 'bg-primary'}`} 
                        style={{ width: `${t.utilization}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {t.skills.slice(0, 3).map(s => (
                      <Badge key={s} variant="secondary" className="text-xs font-normal">
                        {s}
                      </Badge>
                    ))}
                    {t.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs font-normal bg-muted/50">
                        +{t.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
