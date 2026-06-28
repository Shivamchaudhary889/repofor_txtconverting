import React from 'react';

export const MaverickLogo = ({ className = "h-8 w-8", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className} 
    {...props}
  >
    <path d="M12 2L2 22h4l6-12 6 12h4L12 2z" />
    <path d="M12 8L7 18h10L12 8z" fillOpacity="0.5" />
  </svg>
);

export const MaverickWordmark = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col ${className}`}>
    <div className="flex items-center gap-2">
      <MaverickLogo className="h-6 w-6 text-primary" />
      <span className="font-bold text-xl tracking-tight leading-none">MAVERICK</span>
    </div>
    <span className="text-[0.6rem] font-medium tracking-widest opacity-60 ml-8 mt-0.5">EXECUTION PLATFORM</span>
  </div>
);
