import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { MaverickWordmark } from "@/components/MaverickLogo";
import hexLogo from "@assets/hex-logo.png";
import { getAvatar } from "@/lib/avatar";
import {
  LayoutDashboard,
  Layers,
  CalendarCheck,
  CalendarDays,
  Users,
  GraduationCap,
  FileText,
  MessageSquare,
  BarChart3,
  Bell,
  Settings,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const navGroups = [
  {
    label: "Operations",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Batches", href: "/batches", icon: Layers },
      { name: "Schedule", href: "/schedule", icon: CalendarDays },
      { name: "Attendance", href: "/attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Candidates", href: "/candidates", icon: Users },
      { name: "Trainers", href: "/trainers", icon: GraduationCap },
    ],
  },
  {
    label: "Insights",
    items: [
      { name: "Assessments", href: "/assessments", icon: FileText },
      { name: "Feedback", href: "/feedback", icon: MessageSquare },
      { name: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Notifications", href: "/notifications", icon: Bell },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [location] = useLocation();
  const navRef = useRef<HTMLElement>(null);

  // Scroll the active nav item into view whenever the route changes.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const active = nav.querySelector<HTMLElement>("[data-nav-active='true']");
    active?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [location]);

  return (
    <div className="flex flex-col h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-hidden">
      <div className="p-6 shrink-0">
        <Link href="/" onClick={onNavigate}>
          <MaverickWordmark className="cursor-pointer" />
        </Link>
      </div>

      <div className="px-4 mb-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search anything..."
            className="pl-9 bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground focus-visible:ring-sidebar-ring h-9"
          />
        </div>
      </div>

      <nav ref={navRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-6 sidebar-scroll">
        {navGroups.map((group) => (
          <div key={group.label}>
            <h4 className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              {group.label}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  location === item.href ||
                  (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavigate}
                    className="block relative"
                    data-nav-active={isActive ? "true" : undefined}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative z-10",
                        isActive
                          ? "text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-sidebar-primary rounded-md z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 shrink-0 border-t border-sidebar-border">
        <Link href="/profile" onClick={onNavigate}>
          <div className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-sidebar-accent p-2 rounded-md transition-colors">
            <Avatar className="h-9 w-9 border border-sidebar-border bg-white">
              <AvatarImage src={getAvatar("Anup Pal")} />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-sidebar-foreground leading-none mb-1 truncate">
                Anup Pal
              </span>
              <span className="text-xs text-sidebar-foreground/60 leading-none truncate">
                Operations Lead
              </span>
            </div>
          </div>
        </Link>
        <div className="flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-xs text-sidebar-foreground font-medium tracking-tight">
            Powered by
          </span>
          <img src={hexLogo} alt="Hexaware" className="h-5 object-contain" />
        </div>
      </div>
    </div>
  );
}
