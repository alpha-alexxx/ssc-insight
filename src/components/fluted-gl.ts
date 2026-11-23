export type Rgb = [number, number, number];

const VERTEX = `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT = `precision highp float;
uniform sampler2D uMask;
uniform vec2 uRes;
uniform float uTime;
uniform float uReveal;
uniform vec2 uLight;
uniform float uLightStrength;
uniform float uRibs;
uniform float uGlassTop;
uniform float uIsDark;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uAccent;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Smooth volumetric light curtain evaluated behind the fluted glass
vec3 sampleCurtain(vec2 p, float t, vec2 lightPos, float lightAmt) {
  float gy = clamp((p.y - uGlassTop) / max(0.01, 1.0 - uGlassTop), 0.0, 1.0);

  // Flowing multi-ribbon light folds
  float w1 = sin(p.x * 4.1 + t * 0.44 + sin(gy * 3.0 - t * 0.28) * 0.85);
  float w2 = sin(p.x * 7.2 - t * 0.56 + gy * 4.2);
  float w3 = cos(p.x * 2.4 + t * 0.26 - gy * 2.6);
  float ribbon = clamp(0.46 + 0.30 * w1 + 0.18 * w2 + 0.14 * w3, 0.0, 1.0);

  // Diagonal gallery light beam + pointer-guided spotlight behind glass
  float beamAxis = 0.5 + 0.25 * sin(t * 0.32);
  float activeX = mix(beamAxis, lightPos.x, lightAmt);
  float beam = exp(-pow((p.x - activeX) / 0.34, 2.0));
  float verticalRise = smoothstep(0.0, 0.28, gy) * (0.48 + 0.52 * smoothstep(0.12, 0.92, gy));

  // Warm champagne highlight harmonizing with the accent hue
  vec3 champagne = vec3(0.97, 0.93, 0.82);

  vec3 deepBase = uIsDark > 0.5
    ? mix(uPaper, uAccent * 0.15, 0.58)
    : mix(uPaper, mix(uInk, uAccent, 0.55), 0.12);
  vec3 midTone = uIsDark > 0.5
    ? mix(uAccent * 0.44, uAccent, 0.54)
    : mix(uAccent, mix(uInk, uAccent, 0.48), 0.22);
  vec3 highlight = uIsDark > 0.5
    ? mix(uAccent, champagne, 0.72)
    : mix(uAccent, champagne, 0.52);

  float intensity = (0.28 + 0.72 * ribbon) * (0.40 + 0.60 * beam) * verticalRise * uReveal;
  vec3 col = mix(deepBase, midTone, clamp(intensity * 1.12, 0.0, 1.0));
  col = mix(col, highlight, pow(clamp(intensity * (0.54 + 0.54 * beam), 0.0, 1.0), 2.15) * (uIsDark > 0.5 ? 0.86 : 0.58));

  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float y = 1.0 - uv.y; // 0 top, 1 bottom

  // The glass rises out of the plate: no seam, a soft lift over ~90px.
  float glassMask = smoothstep(-0.25, 1.0, (y - uGlassTop) * uRes.y / 90.0);
  vec3 col = uPaper;

  if (glassMask > 0.001) {
    float gy = clamp((y - uGlassTop) / max(0.01, 1.0 - uGlassTop), 0.0, 1.0);

    // Each flute is a cylindrical lens: it shows a magnified slice of what's behind it, so the name
    // breaks into strips but stays readable.
    float idx = floor(uv.x * uRibs);
    float l = fract(uv.x * uRibs) - 0.5;            // -0.5 … 0.5 across one flute
    float center = (idx + 0.5) / uRibs;
    float nx = sin(l * 3.14159);                     // surface normal across the flute
    float sx = center + l / uRibs * (0.74 + 0.26 * (1.0 - uReveal)) + nx * 0.18 / uRibs;
    float spread = 0.0016;

    vec3 bgC;
    bgC.r = sampleCurtain(vec2(sx + spread, y), uTime, uLight, uLightStrength).r;
    bgC.g = sampleCurtain(vec2(sx, y), uTime, uLight, uLightStrength).g;
    bgC.b = sampleCurtain(vec2(sx - spread, y), uTime, uLight, uLightStrength).b;

    // Crisp letters at the middle of a flute, frosted toward its edges (R = sharp, G = blurred).
    vec4 m = texture2D(uMask, vec2(clamp(sx, 0.001, 0.999), y));
    float frost = 0.18 + 0.7 * pow(abs(l) * 2.0, 1.6);
    float word = mix(m.r, m.g, frost) * uReveal;

    float activeX = mix(0.5 + 0.24 * sin(uTime * 0.32), uLight.x, uLightStrength);
    float distLight = exp(-pow((uv.x - activeX) / 0.36, 2.0));
    vec3 champagne = vec3(0.98, 0.95, 0.87);

    vec3 wordCol = uIsDark > 0.5
      ? mix(mix(uInk, uAccent, 0.32), champagne, 0.42 + 0.50 * distLight)
      : mix(mix(uInk, uAccent, 0.36), uAccent * 0.72, 0.30 + 0.45 * distLight);

    vec3 glassCol = mix(bgC, wordCol, word * (uIsDark > 0.5 ? 0.9 : 0.82));

    // A thin highlight runs down each flute on the side facing the light; the joins sit in shadow.
    float lightDirX = clamp((activeX - uv.x) * 2.2, -0.85, 0.85);
    float spec = pow(max(0.0, 1.0 - abs(nx - lightDirX * 0.55)), 14.0);
    float groove = smoothstep(0.4, 0.5, abs(l));
    vec3 specCol = uIsDark > 0.5 ? mix(uAccent, champagne, 0.78) : vec3(1.0, 0.99, 0.96);
    glassCol += specCol * spec * (uIsDark > 0.5 ? 0.22 : 0.3) * (0.35 + 0.65 * distLight) * uReveal;
    glassCol = mix(glassCol, uIsDark > 0.5 ? uPaper * 0.4 : mix(uInk, uAccent, 0.28), groove * (uIsDark > 0.5 ? 0.38 : 0.12));

    // The small print sits on the foot of the glass: calm it so the caption reads.
    float footCalm = smoothstep(0.78, 1.0, gy);
    glassCol = mix(glassCol, mix(uPaper, uAccent, uIsDark > 0.5 ? 0.1 : 0.06), footCalm * 0.62);

    // Fine grain so the light never bands.
    glassCol += (hash(gl_FragCoord.xy + fract(uTime) * 11.0) - 0.5) * 0.02;

    col = mix(col, glassCol, glassMask);
  }

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export function readGlRgb(css: string, fallback: Rgb): Rgb {
  if (typeof document === "undefined" || !css) return fallback;
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const ctx = c.getContext("2d");
  if (!ctx) return fallback;
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

export function createFlutedRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };

  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "program");
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const maskTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, maskTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const u = (n: string) => gl.getUniformLocation(program, n);
  const at = {
    res: u("uRes"),
    time: u("uTime"),
    reveal: u("uReveal"),
    light: u("uLight"),
    lightStrength: u("uLightStrength"),
    ribs: u("uRibs"),
    glassTop: u("uGlassTop"),
    isDark: u("uIsDark"),
    paper: u("uPaper"),
    ink: u("uInk"),
    accent: u("uAccent"),
  };
  gl.uniform1i(u("uMask"), 0);

  return {
    layout(width: number, height: number, glassTopFrac: number, ribs: number) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(at.res, width, height);
      gl.uniform1f(at.glassTop, glassTopFrac);
      gl.uniform1f(at.ribs, ribs);
    },
    mask(image: HTMLCanvasElement) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    },
    colors(paper: Rgb, ink: Rgb, accent: Rgb, isDark: boolean) {
      gl.uniform3f(at.paper, ...paper);
      gl.uniform3f(at.ink, ...ink);
      gl.uniform3f(at.accent, ...accent);
      gl.uniform1f(at.isDark, isDark ? 1 : 0);
    },
    draw(time: number, reveal: number, lightX: number, lightY: number, lightStrength: number) {
      gl.uniform1f(at.time, time);
      gl.uniform1f(at.reveal, reveal);
      gl.uniform2f(at.light, lightX, lightY);
      gl.uniform1f(at.lightStrength, lightStrength);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteTexture(maskTex);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

export type FlutedRenderer = NonNullable<ReturnType<typeof createFlutedRenderer>>;
