import { useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useColorScheme } from "@/components/color-scheme-provider";
import { useAppSettings } from "@/components/settings-provider";
import hexLogo from "@assets/hex-logo.png";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { schemeId, setSchemeId, schemes } = useColorScheme();
  const { reduceMotion, compactTables, setReduceMotion, setCompactTables } =
    useAppSettings();

  useEffect(() => {
    document.title = "Settings · Maverick";
  }, []);

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Configure platform preferences and integrations.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-card w-full justify-start border-b border-border rounded-none h-auto p-0 mb-6 overflow-x-auto flex-nowrap">
          <TabsTrigger
            value="general"
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 md:px-6 py-3 shrink-0"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 md:px-6 py-3 shrink-0"
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 md:px-6 py-3 shrink-0"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 md:px-6 py-3 shrink-0"
          >
            Roles & Access
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 md:px-6 py-3 shrink-0"
          >
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>Basic information about your tenant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" defaultValue="Hexaware Technologies" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Tenant ID</Label>
                  <Input
                    id="tenantId"
                    defaultValue="hx-prod-001"
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Input id="timezone" defaultValue="Asia/Kolkata (IST)" />
              </div>
              <div className="pt-4 flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Calendar Rules</CardTitle>
              <CardDescription>Set defaults for new batches.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Exclude Weekends</Label>
                  <p className="text-sm text-muted-foreground">
                    Do not schedule sessions on Saturday and Sunday automatically.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-flag Low Attendance</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark candidates 'At Risk' if attendance drops below 85%.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose how Maverick looks to you. Select a single theme, or sync with
                your system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 max-w-xl">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all hover-elevate",
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      )}
                    >
                      <div
                        className={cn(
                          "h-12 w-12 rounded-md flex items-center justify-center",
                          opt.value === "light" && "bg-amber-100 text-amber-600",
                          opt.value === "dark" && "bg-slate-800 text-slate-100",
                          opt.value === "system" &&
                            "bg-gradient-to-br from-amber-100 to-slate-800 text-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isActive && "text-primary"
                        )}
                      >
                        {opt.label}
                      </span>
                      {isActive && (
                        <div className="absolute -mt-2 -mr-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center self-end">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color scheme</CardTitle>
              <CardDescription>
                Personalize the accent color used across charts, badges, buttons,
                and highlights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {schemes.map((s) => {
                  const isActive = s.id === schemeId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSchemeId(s.id)}
                      className={cn(
                        "relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover-elevate text-left",
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      )}
                    >
                      <div
                        className="h-9 w-9 rounded-md shrink-0 shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${s.swatch}, ${s.swatch} 50%, ${s.swatch})`,
                          backgroundColor: s.swatch,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {s.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Your preference is saved to this device.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Density</CardTitle>
              <CardDescription>
                Adjust spacing across tables and lists for more or less content per screen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Compact tables</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce row padding in batches and candidates lists.
                  </p>
                </div>
                <Switch
                  checked={compactTables}
                  onCheckedChange={setCompactTables}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Reduce motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animation and transition effects across the app.
                  </p>
                </div>
                <Switch
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Preferences</CardTitle>
              <CardDescription>
                Choose what events trigger notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  title: "Batch Status Changes",
                  desc: "When a batch moves to In Progress or Completed.",
                },
                {
                  title: "Trainer Double Booking",
                  desc: "Warn if a trainer is assigned to overlapping sessions.",
                },
                {
                  title: "Assessment Due",
                  desc: "24 hours before a scheduled assessment.",
                },
                {
                  title: "Candidate Drops",
                  desc: "When a candidate's status changes to Dropped.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <Label className="text-base">{item.title}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={i < 3} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Access</CardTitle>
              <CardDescription>
                Manage permissions for operations leads, trainers, and viewers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  role: "Administrator",
                  members: 4,
                  desc: "Full access to all settings, data, and integrations.",
                },
                {
                  role: "Operations Lead",
                  members: 12,
                  desc: "Manage batches, candidates, assessments, and reports.",
                },
                {
                  role: "Trainer",
                  members: 84,
                  desc: "Manage assigned batches, attendance, and assessments.",
                },
                {
                  role: "Viewer",
                  members: 23,
                  desc: "Read-only access to reports and dashboards.",
                },
              ].map((r) => (
                <div
                  key={r.role}
                  className="flex items-center justify-between gap-4 p-4 border border-border rounded-md"
                >
                  <div>
                    <div className="font-medium">{r.role}</div>
                    <p className="text-sm text-muted-foreground">{r.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm font-medium">
                      {r.members} members
                    </div>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card className="border-primary/20 shadow-md">
            <CardContent className="p-6 md:p-8 flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-muted/50 rounded-full mb-2">
                <img
                  src={hexLogo}
                  alt="Hexaware"
                  className="h-12 object-contain"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Maverick Execution Platform</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  An internal Hexaware product designed for enterprise-scale
                  training operations management.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm border-t border-border w-full max-w-md pt-6 text-left">
                <div className="text-muted-foreground">Version</div>
                <div className="font-medium text-right font-mono">
                  2.4.0-build.892
                </div>

                <div className="text-muted-foreground">Environment</div>
                <div className="font-medium text-right">Production</div>

                <div className="text-muted-foreground">License</div>
                <div className="font-medium text-right">Enterprise Internal</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
