"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

/**
 * The AI surfaces' markdown reader: GitHub-flavored markdown rendered into
 * the paper-and-ink grammar — serif headings, ruled tables with tabular
 * figures, quiet paper code blocks with their own copy affordance.
 *
 * No rehype-raw: raw HTML stays escaped, so model output can never inject
 * markup. Links open externally with the standard guard.
 */

function codeText(node: unknown): string {
  // Extract the raw source from the hast element's code child.
  if (node && typeof node === "object" && "children" in node) {
    const children = (node as { children?: unknown[] }).children;
    const first = children?.[0];
    if (
      first &&
      typeof first === "object" &&
      "value" in first &&
      typeof (first as { value?: unknown }).value === "string"
    )
      return (first as { value: string }).value;
  }
  return "";
}

export const Markdown = memo(function Markdown({
  content,
  className,
  streaming = false,
}: {
  content: string;
  className?: string;
  /** Appends the blinking stream caret to the last rendered block. */
  streaming?: boolean;
}) {
  return (
    <div
      className={cn(
        "ai-answer min-w-0 text-[length:var(--type-body)] leading-relaxed text-ink",
        streaming && "is-streaming",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="mt-5 mb-2 font-serif text-lg font-medium first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="mt-5 mb-2 font-serif text-lg font-medium first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-4 mb-1.5 font-serif text-[15px] font-medium first:mt-0">
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h5 className="mt-4 mb-1 font-serif text-sm font-medium first:mt-0">
              {children}
            </h5>
          ),
          p: ({ children }) => (
            <p className="my-3 first:mt-0 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-5 first:mt-0 last:mb-0 marker:text-muted">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-5 first:mt-0 last:mb-0 marker:text-muted">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          em: ({ children }) => <em>{children}</em>,
          del: ({ children }) => <del className="text-muted">{children}</del>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-rule pl-3 text-muted italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-0 border-t border-rule-soft" />,
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
              <code className="rounded-control border border-rule-soft bg-canvas px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
                {children}
              </code>
            );
          },
          pre: ({ children, node }) => {
            const raw = codeText(node);
            return (
              <div className="ai-answer-code my-3 overflow-hidden rounded-control border border-rule-soft bg-canvas first:mt-0 last:mb-0">
                <div className="flex items-center justify-between border-b border-rule-soft px-3 py-1.5">
                  <span className="font-mono text-[10px] tracking-wide text-muted">
                    CODE
                  </span>
                  {raw ? <CopyButton value={raw} compact /> : null}
                </div>
                <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">
                  {children}
                </pre>
              </div>
            );
          },
          table: ({ children }) => (
            <div className="ai-answer-table my-3 overflow-x-auto rounded-control border border-rule-soft first:mt-0 last:mb-0">
              <table className="w-full border-collapse text-[length:var(--type-body)]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-canvas">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-rule px-3 py-2 text-left font-medium text-ink">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-rule-soft px-3 py-2 align-top tabular-nums last:border-b-0">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element -- model-provided markdown images are rare and arbitrary hosts
            <img
              src={typeof src === "string" ? src : ""}
              alt={alt ?? ""}
              loading="lazy"
              className="my-3 max-w-full rounded-control border border-rule-soft"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
