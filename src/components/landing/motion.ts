/**
 * Landing-page motion constants.
 *
 * The CSS side reads the app's own `--ease-out-soft` / `--dur-*` tokens; JS
 * motion reads the shared house vocabulary in `src/lib/motion.ts`, of which
 * this file is a landing-local re-export so existing island imports stay put.
 */
export { EASE } from "@/lib/motion";
