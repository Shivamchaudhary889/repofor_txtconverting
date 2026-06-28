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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useColorScheme } from "@/components/color-scheme-provider";
import { useAppSettings } from "@/components/settings-provider";

export default function CandidateMySettings() {
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Personalize how Maverick looks and behaves.
        </p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="bg-card w-full justify-start border-b border-border rounded-none h-auto p-0 mb-6 overflow-x-auto flex-nowrap">
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
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose how Maverick looks to you.
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
                Personalize the accent color used across the portal.
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
                        style={{ backgroundColor: s.swatch }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {s.name}
                        </div>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Density & motion</CardTitle>
              <CardDescription>
                Adjust spacing and animation across the portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Compact tables</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce row padding for denser lists.
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
                    Minimize animations across the portal.
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
                Choose what we notify you about.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  title: "Assessment reminders",
                  desc: "24 hours before any quiz, lab, or project deadline.",
                },
                {
                  title: "Schedule changes",
                  desc: "When a session is added, moved, or cancelled.",
                },
                {
                  title: "New grades posted",
                  desc: "When your trainer publishes results.",
                },
                {
                  title: "Feedback windows",
                  desc: "When a new survey opens or closes soon.",
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
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
