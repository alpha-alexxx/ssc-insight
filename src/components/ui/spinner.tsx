import * as React from "react";
import { Loader2 } from "@/components/ui/icons";

import { cn } from "@/lib/utils";

type SpinnerProps = React.ComponentProps<typeof Loader2> & {
  "data-icon"?: "inline-start" | "inline-end";
};

function Spinner({ className, "data-icon": dataIcon = "inline-start", ...props }: SpinnerProps) {
  return (
    <Loader2
      {...props}
      data-slot="spinner"
      data-icon={dataIcon}
      aria-hidden="true"
      className={cn("animate-spin motion-reduce:animate-none", className)}
    />
  );
}

export { Spinner };
