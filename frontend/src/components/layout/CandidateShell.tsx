import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Layers,
  CalendarDays,
  FileText,
  MessageSquare,
  Settings as SettingsIcon,
  Menu,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import {
  AINotificationsBell,
  clearAINotificationsForPortal,
} from "@/components/ai/ai-notifications";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MaverickWordmark } from "@/components/MaverickLogo";
import hexLogo from "@assets/hex-logo.png";
import { getAvatar, avatarInitials } from "@/lib/avatar";
import { getSession, clearSession } from "@/lib/auth";

const candidateNav = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "My Batch", href: "/batch", icon: Layers },
  { name: "Schedule", href: "/schedule", icon: CalendarDays },
  { name: "Assessments", href: "/assessments", icon: FileText },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

function CandidateNav({
  onNavigate,
  name,
}: {
  onNavigate?: () => void;
  name: string;
}) {
  const [location] = useLocation();
  return (
    <div className="flex flex-col h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-hidden">
      <div className="p-6 shrink-0">
        <Link href="/" onClick={onNavigate}>
          <MaverickWordmark className="cursor-pointer" />
        </Link>
        <div className="mt-2 ml-8 text-[10px] font-semibold tracking-widest text-primary opacity-90">
          CANDIDATE PORTAL
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-1 sidebar-scroll">
        {candidateNav.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className="block relative"
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
                  layoutId="candidate-sidebar-active"
                  className="absolute inset-0 bg-sidebar-primary rounded-md z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 shrink-0 border-t border-sidebar-border space-y-3">
        <Link href="/profile" onClick={onNavigate}>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-sidebar-accent p-2 rounded-md transition-colors">
            <Avatar className="h-9 w-9 border border-sidebar-border bg-white">
              <AvatarImage src={getAvatar(name)} />
              <AvatarFallback>{avatarInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium leading-none mb-1 truncate">
                {name}
              </span>
              <span className="text-xs text-sidebar-foreground/60 leading-none truncate">
                Candidate Portal
              </span>
            </div>
          </div>
        </Link>
        <div className="flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-xs font-medium tracking-tight">Powered by</span>
          <img src={hexLogo} alt="Hexaware" className="h-5 object-contain" />
        </div>
      </div>
    </div>
  );
}

function CandidateTopBar({
  onMenuClick,
  name,
  email,
  onLogout,
}: {
  onMenuClick?: () => void;
  name: string;
  email: string;
  onLogout: () => void;
}) {
  const [location] = useLocation();
  const segments = location.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const label = !last
    ? "Home"
    : last.charAt(0).toUpperCase() + last.slice(1);

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-3 md:px-6 sticky top-0 z-30 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden shrink-0"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-foreground font-medium truncate">{label}</span>
      </div>

      <div className="flex items-center gap-2">
        <AINotificationsBell />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hidden sm:inline-flex"
          asChild
          aria-label="Settings"
        >
          <Link href="/settings">
            <SettingsIcon className="h-[1.2rem] w-[1.2rem]" />
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ml-1"
              aria-label="Account"
            >
              <Avatar className="h-9 w-9 bg-white">
                <AvatarImage src={getAvatar(name)} alt={name} />
                <AvatarFallback>{avatarInitials(name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <UserIcon className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function CandidateShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const session = getSession();
  const displayName = session?.name ?? "Candidate";
  const displayEmail = session?.email ?? "candidate@hexaware.com";

  const handleLogout = () => {
    clearSession();
    clearAINotificationsForPortal("candidate");
    setLocation("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:flex shrink-0">
        <CandidateNav
          onNavigate={() => setMobileOpen(false)}
          name={displayName}
        />
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 bg-sidebar border-sidebar-border"
          closeClassName="text-sidebar-foreground hover:bg-sidebar-accent rounded-md p-1 opacity-100"
        >
          <CandidateNav
            onNavigate={() => setMobileOpen(false)}
            name={displayName}
          />
        </SheetContent>
      </Sheet>
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <CandidateTopBar
          onMenuClick={() => setMobileOpen(true)}
          name={displayName}
          email={displayEmail}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="container mx-auto p-4 md:p-6 max-w-6xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
