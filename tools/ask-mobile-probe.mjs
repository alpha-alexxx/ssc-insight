import WebSocket from "ws";

// Read-only geometry probe for /ask: does the page scroll at a real phone
// viewport, and where does the composer dock sit? Also opens the mode select
// and captures it. Usage: node tools/ask-mobile-probe.mjs
const base = process.env.CDP_BASE ?? "http://localhost:3000";
const targets = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
const target = targets.find((item) => item.type === "page");
if (!target) throw new Error("No CDP page target");
const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false, maxPayload: 256 * 1024 * 1024 });
let nextId = 0;
const pending = new Map();
function send(method, params = {}) {
  const id = ++nextId;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) =>
    pending.set(id, { resolve, reject: (e) => reject(new Error(`${method}: ${e.message}`)) }),
  );
}
ws.on("message", (raw) => {
  const m = JSON.parse(String(raw));
  if (m.id) {
    const item = pending.get(m.id);
    if (!item) return;
    pending.delete(m.id);
    m.error ? item.reject(new Error(m.error.message)) : item.resolve(m.result);
  }
});
await new Promise((res, rej) => { ws.on("open", res); ws.on("error", rej); });
await send("Runtime.enable");
await send("Page.enable");

// Real phone viewport, no full-page expansion.
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Page.navigate", { url: base + "/ask" });
await new Promise((r) => setTimeout(r, 9000));

const probe = await send("Runtime.evaluate", {
  expression: `(() => {
    const d = document.documentElement;
    const dock = document.querySelector("form.relative.rounded-2xl")?.closest(".relative.shrink-0");
    const dockRect = dock?.getBoundingClientRect();
    const root = dock?.closest("[class*='h-[calc']");
    const rootRect = root?.getBoundingClientRect();
    return JSON.stringify({
      pageScrolls: d.scrollHeight > d.clientHeight + 1,
      scrollHeight: d.scrollHeight,
      clientHeight: d.clientHeight,
      innerHeight: window.innerHeight,
      rootHeight: rootRect?.height,
      rootBottom: rootRect?.bottom,
      dockBottom: dockRect?.bottom,
      dockVisible: dockRect ? dockRect.bottom <= window.innerHeight + 1 && dockRect.top >= 0 : null,
      bodyOverflowX: d.scrollWidth - d.clientWidth,
    });
  })()`,
  returnByValue: true,
});
console.log("GEOMETRY:", probe.result.value);

// Open the mode select pill and capture the open menu.
const click = await send("Runtime.evaluate", {
  expression: `(() => {
    const btns = [...document.querySelectorAll("button")];
    const pill = btns.find((b) => b.getAttribute("aria-label")?.startsWith("Assistant mode"));
    if (!pill) return "NO PILL";
    pill.click();
    return "CLICKED";
  })()`,
  returnByValue: true,
});
console.log("PILL:", click.result.value);
await new Promise((r) => setTimeout(r, 900));
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
const { writeFileSync } = await import("node:fs");
writeFileSync(".impeccable/ask-mobile/ask-390-select-open.png", Buffer.from(shot.data, "base64"));
console.log("SHOT ask-390-select-open.png");

// Close it again.
await send("Runtime.evaluate", { expression: `document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))` });
ws.close();
