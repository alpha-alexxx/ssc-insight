/**
 * "Scrolls, but draws no scrollbar."
 *
 * The distinction matters: `overflow: hidden` disables scrolling, while hiding
 * the bar keeps wheel, touch, trackpad, keyboard and focus-scroll fully working
 * — it only removes the painted track and thumb. Use these classes on the
 * scrolling element itself (a dialog body, a viewport), never on a parent that
 * is supposed to clip.
 *
 * `scrollbar-width` covers Firefox and Chromium 121+, `-ms-overflow-style`
 * covers legacy Edge/IE, and the `::-webkit-scrollbar` rule covers Safari and
 * older Chromium. All three are needed; none of them removes the scroll range.
 */
export const NO_SCROLLBAR =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

/** `NO_SCROLLBAR` plus the containment a dialog body wants. */
export const NO_SCROLLBAR_SCROLL = `${NO_SCROLLBAR} overscroll-contain`;
