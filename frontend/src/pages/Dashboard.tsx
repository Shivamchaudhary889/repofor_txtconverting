import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDashboardSummary, useActivities, useNotifications, useDashboardCharts } from "@/hooks/use-data";
import { Users, BookOpen, Target, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AIBriefingCard } from "@/components/ai/AIBriefingCard";
import { Skeleton } from "@/components/ui/skeleton";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 }
};

const pieColors = ['#4f46e5', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316'];

export default function Dashboard() {
  useEffect(() => {
    document.title = "Dashboard · Maverick";
  }, []);

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts();
  const { data: activities = [] } = useActivities();
  const { data: notifications = [] } = useNotifications();

  const enrollmentData = charts?.enrollmentTrends ?? [];
  const locationData = charts?.locationData ?? [];
  const techMixData = charts?.techMix ?? [];

  return (
    <motion.div
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and real-time operations.</p>
        </div>
      </div>

      <AIBriefingCard />

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {summaryLoading ? <Skeleton className="h-7 w-12" /> : summary?.activeBatches ?? 0}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1 text-green-600 flex items-center">
              <Activity className="h-3 w-3 mr-1" /> +2 this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Training</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {summaryLoading ? <Skeleton className="h-7 w-12" /> : summary?.inTraining ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across global locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {summaryLoading ? <Skeleton className="h-7 w-12" /> : `${summary?.avgAttendance ?? 0}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-red-500">-2% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {summaryLoading ? <Skeleton className="h-7 w-12" /> : `${summary?.avgPassRate ?? 0}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-green-600">On target</p>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">Trainer Utilization</CardTitle>
            <Users className="h-4 w-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {summaryLoading ? <Skeleton className="h-7 w-12 bg-primary-foreground/20" /> : `${summary?.avgUtilization ?? 0}%`}
            </div>
            <p className="text-xs text-primary-foreground/80 mt-1">Healthy load</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trends</CardTitle>
              <CardDescription>Candidates starting training over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {chartsLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={enrollmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} dy={10} />
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
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
                <CardDescription>Candidates by delivery city</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  {chartsLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={locationData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={80} />
                        <Tooltip
                          cursor={{ fill: 'hsl(var(--muted))' }}
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--popover-foreground))",
                          }}
                          labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                          itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technology Mix</CardTitle>
                <CardDescription>Active batches by track</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  {chartsLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={techMixData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={78}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {techMixData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--popover-foreground))",
                          }}
                          labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                          itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                          formatter={(value, name) => [value, (name as string).length > 20 ? (name as string).slice(0, 20) + "…" : name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Alerts & Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.slice(0, 5).map(notif => (
                <div key={notif.id} className="flex gap-3 items-start border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className={cn("mt-0.5 rounded-full p-1", notif.type === 'alert' ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30")}>
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium leading-none mb-1">{notif.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-5 before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {activities.slice(0, 6).map((activity) => (
                  <div key={activity.id} className="relative flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted text-muted-foreground shadow shrink-0 z-10">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{activity.user.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0 p-3 rounded-lg border border-border bg-card shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="font-medium text-sm text-foreground truncate">{activity.user}</div>
                        <div className="text-xs text-muted-foreground shrink-0">{activity.timestamp}</div>
                      </div>
                      <div className="text-sm text-muted-foreground break-words">{activity.action} <span className="font-medium text-foreground">{activity.target}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
