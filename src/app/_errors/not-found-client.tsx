"use client";

import { NotFound, type NotFoundResult } from "@/components/not-found";
import type { SearchResponse } from "@/lib/search";

/**
 * The client half of the app 404: Hairline's NotFound (Fetch the puppy + the
 * search field + popular links) wired to the app's own /api/search. Results
 * deep-link to the same destinations the command palette uses — attempts go
 * to History with the title pre-seeded, tasks and groups to My tasks, plan
 * days to their date.
 */
export function NotFoundClient() {
  const search = async (
    query: string,
    signal: AbortSignal,
  ): Promise<NotFoundResult[]> => {
    // The API answers nothing under its minimum query length; keep it a
    // "no results" instead of a failed search.
    if (query.trim().length < 2) return [];
    const params = new URLSearchParams({ q: query, limit: "8" });
    const response = await fetch(`/api/search?${params}`, { signal });
    if (!response.ok) throw new Error("Search could not load.");
    const data: SearchResponse = await response.json();
    const results: NotFoundResult[] = [];
    for (const item of data.results.attempts?.items ?? []) {
      results.push({
        title: item.title,
        href: `/history?search=${encodeURIComponent(item.title)}`,
        hint: item.subtitle,
      });
    }
    for (const item of data.results.tasks?.items ?? []) {
      results.push({ title: item.title, href: "/my-tasks", hint: item.subtitle });
    }
    for (const item of data.results.groups?.items ?? []) {
      results.push({ title: item.title, href: "/my-tasks", hint: item.subtitle });
    }
    for (const item of data.results.plan?.items ?? []) {
      results.push({
        title: item.title,
        href: item.date ? `/plan/${item.date}` : "/plan",
        hint: item.subtitle,
      });
    }
    return results;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16 text-foreground">
      <NotFound
        search={search}
        homeHref="/"
        links={[
          { title: "Dashboard", href: "/dashboard", hint: "Your week at a glance" },
          { title: "Mock history", href: "/history", hint: "Every logged mock" },
          { title: "Performance", href: "/performance", hint: "Trends and findings" },
          { title: "Calendar", href: "/calendar", hint: "The study plan" },
          { title: "My tasks", href: "/my-tasks", hint: "Personal tasks and groups" },
          { title: "Ask AI", href: "/ask", hint: "Your coach and report assistant" },
          { title: "Settings", href: "/settings", hint: "Exams, targets and backup" },
        ]}
      />
    </main>
  );
}
