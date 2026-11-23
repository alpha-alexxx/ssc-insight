import * as React from "react";
import { PlainIcon } from "@/components/icon";
import { cn } from "@/lib/utils";

/**
 * shadcn pagination primitives, adapted to SSC Insight's paper design
 * system. Pages are plain buttons, not router links: the workspace shell is
 * a persistent client view and paging must never trigger a navigation, and
 * the component is static, so no globals.css motion classes are involved —
 * only the project's control tokens.
 */

const pageButtonBase =
  "inline-flex size-[var(--control-height-sm)] tap-target items-center justify-center rounded-control text-[length:var(--type-secondary)] font-medium tabular-nums transition-[color,background-color,border-color] duration-[var(--dur-quick)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-rule-soft disabled:bg-soft disabled:text-muted";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

function PaginationItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li className={cn("", className)} {...props} />;
}

function PaginationPage({
  isActive,
  className,
  ...props
}: React.ComponentProps<"button"> & { isActive?: boolean }) {
  return (
    <button
      type="button"
      data-slot="pagination-page"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        pageButtonBase,
        isActive
          ? "bg-accent text-paper"
          : "border border-rule-soft text-muted hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label="Previous page"
      className={cn(
        pageButtonBase,
        "border border-rule-soft text-muted hover:text-ink",
        className,
      )}
      {...props}
    >
      <PlainIcon name="arrowLeft" size={13} />
    </button>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label="Next page"
      className={cn(
        pageButtonBase,
        "border border-rule-soft text-muted hover:text-ink",
        className,
      )}
      {...props}
    >
      <PlainIcon name="arrowRight" size={13} />
    </button>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-[var(--control-height-sm)] items-center justify-center text-[length:var(--type-secondary)] text-muted",
        className,
      )}
      {...props}
    >
      …
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPage,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
