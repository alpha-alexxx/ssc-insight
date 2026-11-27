import type { Metadata } from "next";
import Script from "next/script";
import "@fontsource-variable/dm-sans/index.css";
import "@fontsource-variable/source-serif-4/index.css";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeStyleProvider } from "@/components/theme-style-provider";
import { THEME_PREFS_SCRIPT } from "@/lib/theme-style";
import { Toaster } from "@/components/toast-stack";
import { ErrorBoundary } from "@/components/error-boundary";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "SSC Insight · Mock tracker",
  description: "A clear view of your SSC CGL Tier 2 preparation.",
};

/**
 * Theme handling is split across two providers:
 * - next-themes owns light/dark: it persists the choice under
 *   localStorage("ssc.theme"), applies it to <html class> via its own
 *   before-paint script, and re-evaluates "system" when the OS theme
 *   changes. suppressHydrationWarning is required because the server
 *   renders <html> without the class next-themes' script adds.
 * - ThemeStyleProvider owns the palette (data-theme) state. The pure
 *   theme-style contract resolves the attribute before paint and defaults
 *   to graphite.
 * Toasts come from Hairline's toast-stack (toast() is module-level).
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Blocking inline script: resolves palette before first paint. */}
        <Script id="ssc-theme-prefs" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_PREFS_SCRIPT }} />
        <ThemeProvider
          attribute="class"
          storageKey="ssc.theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeStyleProvider>
            <ErrorBoundary>
              {children}
              <Toaster position="bottom-right" />
            </ErrorBoundary>
          </ThemeStyleProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
