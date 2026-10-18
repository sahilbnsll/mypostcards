/**
 * The dissolve behind MorphReel: one full-frame WebGL pass over two textures, adapted from the
 * morph-gallery reference. A fractal noise field gives every pixel a threshold and the progress
 * sweeps past those thresholds, so the old picture tears away in drifting patches rather than
 * fading evenly. The threshold is biased by the brightness of the incoming picture, which makes its
 * lit areas come through first, the way a print develops.
 *
 * Plain WebGL 1, no libraries. `createDissolve` rejects when WebGL or an image is unavailable, so
 * the caller can fall back to an ordinary picture.
 */

export interface DissolveHandle {
  /** Dissolve to the picture at this index. */
  show(index: number): void;
  destroy(): void;
}

interface DissolveOptions {
  start: number;
  /** Read each time a dissolve begins: when true the pictures swap with no animation. */
  reduced: () => boolean;
  /** Milliseconds of dissolve. */
  duration?: number;
}

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform vec2 u_resolution;
uniform float u_fromAspect;
uniform float u_toAspect;
uniform float u_direction;

varying vec2 v_uv;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 v) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(v);
    v *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Sliding the pictures past the edge would smear the last row of pixels; reflect instead
vec2 mirror(vec2 uv) {
  return 1.0 - abs(1.0 - mod(uv, 2.0));
}

// object-fit: cover, as a scale about the centre
vec2 coverUV(vec2 uv, float imgAspect) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  vec2 scale = (canvasAspect > imgAspect)
    ? vec2(1.0, imgAspect / canvasAspect)
    : vec2(canvasAspect / imgAspect, 1.0);
  return mirror((uv - 0.5) * scale + 0.5);
}

void main() {
  const float EDGE = 0.15;
  const float DRIFT = 0.45;
  const float SCALE = 3.2;
  float adjusted = u_progress * (1.0 + 2.0 * EDGE) - EDGE;

  float noise = fbm(v_uv * SCALE + vec2(0.0, u_progress * u_direction)) * 0.5 + 0.5;
  noise = smoothstep(0.0, 2.0, length(texture2D(u_to, coverUV(v_uv, u_toAspect)).rgb) + noise);

  float mixFactor = 1.0 - smoothstep(adjusted - EDGE, adjusted + EDGE, noise);

  vec2 fromUV = coverUV(v_uv + vec2(0.0, noise * u_progress * DRIFT * u_direction), u_fromAspect);
  vec2 toUV = coverUV(v_uv + vec2(0.0, noise * (1.0 - u_progress) * -0.5 * DRIFT * u_direction), u_toAspect);

  gl_FragColor = mix(texture2D(u_from, fromUV), texture2D(u_to, toUV), mixFactor);
}
`;

/** Starts and ends still, hurries through the middle. */
const easeInOutQuint = (t: number) => {
  const x = Math.min(Math.max(t, 0), 1);
  return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("no shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader: ${log}`);
  }
  return shader;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

export async function createDissolve(canvas: HTMLCanvasElement, urls: string[], options: DissolveOptions): Promise<DissolveHandle> {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
  if (!gl) throw new Error("no webgl");

  const vert = compile(gl, gl.VERTEX_SHADER, VERT);
  const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!program) throw new Error("no program");
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("link failed");
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const at = (name: string) => gl.getUniformLocation(program, `u_${name}`);
  const uniforms = {
    from: at("from"),
    to: at("to"),
    progress: at("progress"),
    resolution: at("resolution"),
    fromAspect: at("fromAspect"),
    toAspect: at("toAspect"),
    direction: at("direction"),
  };

  // Photographs are not powers of two: clamp and linear are the only legal texture settings in WebGL 1
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const textures: WebGLTexture[] = [];
  const aspects: number[] = [];
  const images = await Promise.all(urls.map(loadImage));
  for (const img of images) {
    const texture = gl.createTexture();
    if (!texture) throw new Error("no texture");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textures.push(texture);
    aspects.push(img.naturalWidth / Math.max(img.naturalHeight, 1));
  }

  let from = Math.min(options.start, textures.length - 1);
  let to = from;
  let progress = 1;
  let direction = 1;
  let startedAt = 0;
  let raf = 0;
  let destroyed = false;
  const duration = options.duration ?? 1300;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w === 0 || h === 0 || (canvas.width === w && canvas.height === h)) return false;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    return true;
  };

  const draw = () => {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[from]);
    gl.uniform1i(uniforms.from, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[to]);
    gl.uniform1i(uniforms.to, 1);
    gl.uniform1f(uniforms.progress, progress);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.fromAspect, aspects[from]);
    gl.uniform1f(uniforms.toAspect, aspects[to]);
    gl.uniform1f(uniforms.direction, direction);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // Frames are drawn only while something changes, so a resting reel costs nothing
  const tick = () => {
    raf = 0;
    if (destroyed) return;
    const t = Math.min((performance.now() - startedAt) / duration, 1);
    progress = easeInOutQuint(t);
    draw();
    if (t < 1) raf = requestAnimationFrame(tick);
    else from = to;
  };

  const observer = new ResizeObserver(() => {
    if (resize() && raf === 0) draw();
  });
  observer.observe(canvas);
  resize();
  draw();

  return {
    show(index) {
      if (destroyed || index === to || index < 0 || index >= textures.length) return;
      const n = textures.length;
      // Settle whatever was in flight, then dissolve from what is on screen to the new picture
      from = to;
      to = index;
      direction = ((index - from + n) % n) * 2 <= n ? 1 : -1;
      if (options.reduced()) {
        from = to;
        progress = 1;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        draw();
        return;
      }
      progress = 0;
      startedAt = performance.now();
      if (!raf) raf = requestAnimationFrame(tick);
    },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      for (const texture of textures) gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
