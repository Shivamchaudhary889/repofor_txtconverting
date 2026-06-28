import { Link, useLocation } from "wouter";
import { ChevronRight, Menu, Settings as SettingsIcon, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatar, avatarInitials } from "@/lib/avatar";
import { AskMaverickDialog } from "@/components/ai/AskMaverickDialog";
import { AINotificationsBell } from "@/components/ai/ai-notifications";
import { clearAINotificationsForPortal } from "@/components/ai/ai-notifications";
import { getSession, clearSession } from "@/lib/auth";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [location, setLocation] = useLocation();
  const pathSegments = location.split("/").filter(Boolean);
  const session = getSession();
  const displayName = session?.name ?? "Admin";
  const displayEmail = session?.email ?? "admin@hexaware.com";

  const handleLogout = () => {
    clearSession();
    clearAINotificationsForPortal("admin");
    setLocation("/login");
  };

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
        <div className="flex items-center text-sm min-w-0">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium hidden sm:inline"
          >
            Home
          </Link>
          {pathSegments.length > 0 && (
            <>
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground hidden sm:inline" />
              <span className="text-foreground font-medium capitalize truncate">
                {pathSegments[0] || "Dashboard"}
              </span>
            </>
          )}
          {pathSegments.length === 0 && (
            <span className="text-foreground font-medium sm:hidden">Dashboard</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <AskMaverickDialog />

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
                <AvatarImage
                  src={getAvatar(displayName)}
                  alt={displayName}
                />
                <AvatarFallback>{avatarInitials(displayName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {displayEmail}
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
              onClick={handleLogout}
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
