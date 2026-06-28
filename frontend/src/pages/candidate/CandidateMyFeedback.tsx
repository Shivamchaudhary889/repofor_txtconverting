import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FeedbackDraftHelper } from "@/components/ai/FeedbackDraftHelper";

const surveys = [
  {
    id: 1,
    title: "Week 4 mid-batch survey",
    description: "Share how things are going so far. Takes 2 minutes.",
    status: "open" as const,
    closes: "Closes Sun, 28 Apr",
  },
  {
    id: 2,
    title: "Spring Boot module rating",
    description: "Rate the Spring Boot module materials and pace.",
    status: "open" as const,
    closes: "Closes Wed, 30 Apr",
  },
  {
    id: 3,
    title: "Trainer effectiveness — Priya Iyer",
    description: "Confidential feedback on your lead trainer.",
    status: "submitted" as const,
    closes: "Submitted 12 Apr",
  },
];

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="hover:scale-110 transition-transform"
          aria-label={`${n} stars`}
        >
          <Star
            className={cn(
              "h-7 w-7 transition-colors",
              n <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function CandidateMyFeedback() {
  const { toast } = useToast();
  const [overallRating, setOverallRating] = useState(0);
  const [paceRating, setPaceRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    document.title = "Feedback · Maverick";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feedback submitted",
      description: "Thanks for sharing — your input helps shape the program.",
    });
    setOverallRating(0);
    setPaceRating(0);
    setComment("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Feedback
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Help improve the training experience for you and future cohorts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Quick feedback
              </CardTitle>
              <CardDescription>
                Drop a quick rating for this week — fully anonymous.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base">
                    How is the cohort going overall?
                  </Label>
                  <StarPicker
                    value={overallRating}
                    onChange={setOverallRating}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Is the pace right for you?</Label>
                  <StarPicker value={paceRating} onChange={setPaceRating} />
                  <p className="text-xs text-muted-foreground">
                    1 = too slow, 5 = too fast
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-base">
                    Anything else?
                  </Label>
                  <Textarea
                    id="comment"
                    rows={4}
                    placeholder="Suggestions, blockers, kudos..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <FeedbackDraftHelper
                  rating={overallRating || 3}
                  onApply={(text) => setComment(text)}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={overallRating === 0 || paceRating === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit feedback
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open surveys</CardTitle>
              <CardDescription>Pending or recently closed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {surveys.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-md border border-border bg-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm">{s.title}</div>
                    {s.status === "submitted" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground">
                      {s.closes}
                    </span>
                    {s.status === "open" ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Open
                      </Button>
                    ) : (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        Submitted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
