"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";

/**
 * The AI surfaces' markdown reader — the custom renderer handed to Hairline
 * `StreamingText` as children (the approved react-markdown integration).
 *
 * GitHub-flavored markdown typeset in the app's grammar: serif headings, ruled
 * tables with tabular figures, and Hairline `CodeBlock` for fenced code with
 * its own copy affordance. No rehype-raw: raw HTML stays escaped, so model
 * output can never inject markup. Links open externally with the standard
 * guard.
 */

type HastNode = {
  children?: unknown[];
  properties?: { className?: unknown };
};

/** The `code` element inside a `pre`, if the shape matches. */
function codeElementOf(node: unknown): HastNode | null {
  if (node && typeof node === "object" && "children" in node) {
    const children = (node as HastNode).children;
    const first = Array.isArray(children) ? children[0] : null;
    if (first && typeof first === "object" && "children" in first) return first as HastNode;
  }
  return null;
}

/** Extract the raw source: pre > code > text. */
function textValue(node: unknown): string {
  const code = codeElementOf(node);
  const text =
    code && Array.isArray(code.children)
      ? (code.children[0] as HastNode | undefined)
      : undefined;
  const value = text && "value" in text ? (text as { value?: unknown }).value : null;
  return typeof value === "string" ? value : "";
}

/** Extract `language-xyz` from the code element's class list. */
function languageOf(node: unknown): string | undefined {
  const code = codeElementOf(node);
  const className = code?.properties?.className;
  const classes = Array.isArray(className)
    ? className
    : typeof className === "string"
      ? [className]
      : [];
  const lang = classes.find(
    (entry) => typeof entry === "string" && entry.startsWith("language-"),
  );
  return lang ? lang.slice("language-".length) : undefined;
}

export const Markdown = memo(function Markdown({
  content,
  className,
  streaming = false,
}: {
  content: string;
  className?: string;
  /** Appends a quiet blinking caret under the last rendered block. */
  streaming?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 font-serif text-[0.9375rem] leading-[1.7] text-foreground",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="mt-5 mb-2 font-serif text-lg font-medium first:mt-0">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="mt-5 mb-2 font-serif text-lg font-medium first:mt-0">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-4 mb-1.5 font-serif text-[15px] font-medium first:mt-0">{children}</h4>
          ),
          h4: ({ children }) => (
            <h5 className="mt-4 mb-1 font-serif text-sm font-medium first:mt-0">{children}</h5>
          ),
          p: ({ children }) => (
            <p className="my-3 first:mt-0 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-5 first:mt-0 last:mb-0 marker:text-muted-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-5 first:mt-0 last:mb-0 marker:text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em>{children}</em>,
          del: ({ children }) => <del className="text-muted-foreground">{children}</del>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-medium text-primary underline underline-offset-2"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-border pl-3 text-muted-foreground italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-0 border-t border-border" />,
          code: ({ className, children, ...rest }) => {
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded-[5px] border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
                {children}
              </code>
            );
          },
          pre: ({ children, node }) => {
            const raw = textValue(node);
            const language = languageOf(node);
            if (!raw) {
              // Safety net: an unexpected hast shape still renders the code.
              return <pre className="my-3 overflow-x-auto font-mono text-xs">{children}</pre>;
            }
            return (
              <CodeBlock
                code={raw}
                language={language}
                streaming={streaming}
                lineNumbers={false}
                className="my-3 first:mt-0 last:mb-0"
              />
            );
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-border first:mt-0 last:mb-0">
              <table className="w-full border-collapse text-[13px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-border px-3 py-2 text-left font-medium text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border/60 px-3 py-2 align-top tabular-nums last:border-b-0">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element -- model-provided markdown images are rare and arbitrary hosts
            <img
              src={typeof src === "string" ? src : ""}
              alt={alt ?? ""}
              loading="lazy"
              className="my-3 max-w-full rounded-lg border border-border"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {/* The stream caret: the kit's StreamingText caret only rides its own
          token paragraphs, so the custom renderer ends with its own. */}
      {streaming ? (
        <span
          aria-hidden="true"
          className="mt-1 inline-block h-3.5 w-[2px] rounded-full bg-foreground/70 motion-safe:animate-pulse"
        />
      ) : null}
    </div>
  );
});
