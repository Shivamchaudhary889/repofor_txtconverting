import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = 
  | "Planned" | "In Progress" | "On Hold" | "Completed" | "Archived"
  | "Present" | "Absent" | "Late"
  | "Active" | "At Risk" | "Dropped" | "Graduated"
  | "Pending" | "Graded" | "Published";

export function StatusBadge({ status, className }: { status: StatusType | string, className?: string }) {
  let colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  
  switch(status) {
    case "Completed":
    case "Present":
    case "Graduated":
    case "Published":
      colorClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case "In Progress":
    case "Active":
    case "Graded":
      colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      break;
    case "On Hold":
    case "Late":
    case "At Risk":
    case "Pending":
    case "Planned":
      colorClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      break;
    case "Archived":
    case "Dropped":
    case "Absent":
      colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      break;
  }
  
  return (
    <Badge variant="outline" className={cn("border-none font-medium", colorClass, className)}>
      {status}
    </Badge>
  );
}
