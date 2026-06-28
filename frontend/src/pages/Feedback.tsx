import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smile, Meh, Frown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { FeedbackThemesCard } from "@/components/ai/FeedbackThemesCard";
import { useFeedback, useBatches } from "@/hooks/use-data";

export default function Feedback() {
  useEffect(() => {
    document.title = "Feedback · Maverick";
  }, []);

  const { data: serverFeedback = [] } = useFeedback();
  const { data: batches = [] } = useBatches();
  const batchNameMap = Object.fromEntries(batches.map(b => [b.id, b.name]));

  const npsData = [
    { month: 'Jan', score: 65 },
    { month: 'Feb', score: 68 },
    { month: 'Mar', score: 74 },
    { month: 'Apr', score: 72 },
    { month: 'May', score: 81 },
    { month: 'Jun', score: 78 },
  ];

  const recentFeedback = serverFeedback.slice(0, 6).map((f) => ({
    id: f.id,
    batch: batchNameMap[f.batchId] ?? f.batchId,
    comment: f.comment,
    rating: f.rating,
    sentiment: f.rating >= 4 ? "positive" : f.rating <= 2 ? "negative" : "neutral",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback & Sentiment</h1>
        <p className="text-muted-foreground mt-1">Monitor candidate satisfaction and Net Promoter Scores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground border-primary-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary-foreground/80 font-medium">Enterprise NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-5xl font-bold font-mono">78</div>
              <div className="text-primary-foreground/80 mb-1 text-sm bg-black/10 px-2 py-0.5 rounded">Excellent</div>
            </div>
            <div className="mt-4 flex justify-between text-xs text-primary-foreground/80">
              <span>Promoters: 84%</span>
              <span>Passives: 10%</span>
              <span>Detractors: 6%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle>NPS Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[140px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={npsData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                    itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
            <CardDescription>Latest qualitative feedback from candidates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentFeedback.map(f => (
              <div key={f.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{f.batch}</span>
                  <div className="flex items-center gap-1">
                    {f.sentiment === 'positive' && <Smile className="h-4 w-4 text-green-500" />}
                    {f.sentiment === 'neutral' && <Meh className="h-4 w-4 text-amber-500" />}
                    {f.sentiment === 'negative' && <Frown className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                <p className="text-sm">"{f.comment}"</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <FeedbackThemesCard />
      </div>
    </div>
  );
}
