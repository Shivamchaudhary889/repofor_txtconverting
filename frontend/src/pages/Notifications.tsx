import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-data";
import { AlertCircle, CheckCircle2, Info, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/data/types";

export default function Notifications() {
  const { data: serverNotifs = [] } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    document.title = "Notifications · Maverick";
  }, []);

  useEffect(() => {
    setNotifications(serverNotifs);
  }, [serverNotifs]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Your alerts and system messages.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <Button variant="outline" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map(notif => (
          <Card key={notif.id} className={cn("transition-colors", notif.read ? "bg-muted/30" : "bg-card shadow-sm border-primary/20")}>
            <CardContent className="p-4 sm:p-6 flex gap-4">
              <div className={cn(
                "mt-1 rounded-full p-2 h-fit shrink-0", 
                notif.type === 'alert' ? "bg-red-100 text-red-600 dark:bg-red-900/30" : 
                notif.type === 'warning' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" :
                notif.type === 'success' ? "bg-green-100 text-green-600 dark:bg-green-900/30" :
                "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
              )}>
                {notif.type === 'alert' && <AlertCircle className="h-5 w-5" />}
                {notif.type === 'warning' && <AlertCircle className="h-5 w-5" />}
                {notif.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                {notif.type === 'info' && <Info className="h-5 w-5" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <h3 className={cn("font-semibold text-base", notif.read ? "text-foreground/80" : "text-foreground")}>{notif.title}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.timestamp}</span>
                </div>
                <p className={cn("text-sm", notif.read ? "text-muted-foreground" : "text-foreground/90")}>{notif.description}</p>
              </div>
              {!notif.read && (
                <div className="shrink-0 flex items-center">
                  <Button variant="ghost" size="icon" onClick={() => markAsRead(notif.id)} title="Mark as read" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
