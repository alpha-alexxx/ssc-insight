"use client";

import * as React from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";

/**
 * Markdown for the coach's answers, in the app's own voice.
 *
 * GitHub-flavoured markdown rendered with the Hairline tokens: ruled tables,
 * per-block code with copy (Hairline's CodeBlock), safe links, calm headings.
 * Raw HTML stays escaped — react-markdown never enables it here — so a model
 * cannot inject markup into the page.
 *
 * The elements are direct children of `StreamingText`'s column (it is a flex
 * column with a 12px gap), which is why none of them carry outer margins: the
 * rhythm comes from the container, not from each block.
 */

const SAFE_HREF = /^(https?:\/\/|mailto:|\/|#)/i;

const components: Components = {
  h1: ({ children }) => (
    <h3 className="mt-1 font-serif text-[17px] font-medium leading-snug tracking-[-0.01em] text-foreground">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-1 font-serif text-[16px] font-medium leading-snug tracking-[-0.01em] text-foreground">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-1 text-[14px] font-semibold leading-snug text-foreground">
      {children}
    </h4>
  ),
  h4: ({ children }) => (
    <h5 className="mt-1 text-[13.5px] font-semibold leading-snug text-foreground">
      {children}
    </h5>
  ),
  p: ({ children }) => <p className="text-pretty">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-muted-foreground/70">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1.5 pl-5 marker:font-medium marker:text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1 text-pretty [&>ol]:mt-1.5 [&>ul]:mt-1.5">{children}</li>
  ),
  hr: () => <hr className="my-1 border-border" />,
  blockquote: ({ children }) => (
    <blockquote className="space-y-2 border-l-2 border-primary/40 bg-primary/[0.04] py-1.5 pl-3.5 pr-2 text-foreground/90 [&>p]:text-pretty">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => {
    if (!href || !SAFE_HREF.test(href)) return <span>{children}</span>;
    const external = /^https?:/i.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="font-medium text-primary underline decoration-primary/30 underline-offset-[3px] transition-colors hover:decoration-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {children}
      </a>
    );
  },

  /* Tables scroll sideways inside their own rounded frame instead of
     stretching the column on a phone. */
  table: ({ children }) => (
    <div className="max-w-full overflow-x-auto rounded-xl shadow-[inset_0_0_0_1px_var(--border)] [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
      <table className="w-full min-w-max border-collapse text-[12.5px] tabular-nums">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
  th: ({ children, style }) => (
    <th
      style={style}
      className="whitespace-nowrap px-3 py-2 text-left text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground"
    >
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td
      style={style}
      className="border-t border-border px-3 py-2 align-top text-foreground"
    >
      {children}
    </td>
  ),

  /* Inline code only: fenced blocks are handled by `pre` below. */
  code: ({ children, className }) => (
    <code
      className={cn(
        "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.86em] text-foreground",
        className,
      )}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => {
    const child = React.Children.toArray(children)[0] as
      | React.ReactElement<{ className?: string; children?: React.ReactNode }>
      | undefined;
    const raw = child?.props?.children;
    const code = (
      Array.isArray(raw) ? raw.join("") : String(raw ?? "")
    ).replace(/\n$/, "");
    const language = /language-([\w-]+)/.exec(
      child?.props?.className ?? "",
    )?.[1];
    return (
      <CodeBlock
        code={code}
        language={language}
        collapseAfter={22}
        className="my-0.5 max-w-full"
      />
    );
  },
};

const plugins = [remarkGfm];

/** A soft caret trailing the last paragraph/heading while the answer streams. */
const CARET =
  "[&[data-streaming=true]>:is(p,h3,h4,h5):last-child]:after:ml-0.5 [&[data-streaming=true]>:is(p,h3,h4,h5):last-child]:after:inline-block [&[data-streaming=true]>:is(p,h3,h4,h5):last-child]:after:h-[1.05em] [&[data-streaming=true]>:is(p,h3,h4,h5):last-child]:after:w-[2px] [&[data-streaming=true]>:is(p,h3,h4,h5):last-child]:after:translate-y-[0.18em] [&[data-streaming=true]>:is(p,h3,h4,h5):last-child]:after:bg-foreground [&[data-streaming=true]>:is(p,h3,h4,h5):last-child]:after:content-[''] [&[data-streaming=true]>:is(p,h3,h4,h5):last-child]:after:animate-[ui-blink_1s_steps(2,start)_infinite] motion-reduce:[&[data-streaming=true]>:is(p,h3,h4,h5):last-child]:after:animate-none";

/** The class string that goes on `StreamingText` to turn the caret on. */
export const markdownColumnClass = CARET;

export const AskMarkdown = React.memo(function AskMarkdown({
  content,
}: {
  content: string;
}) {
  return (
    <Markdown remarkPlugins={plugins} components={components}>
      {content}
    </Markdown>
  );
});
