// Renders promo.html to PNG frames with headless Chrome (DevTools protocol, no dependencies; Node 22+).
//
//   node promo/render.mjs <outDir> [fps=30] [scale=1.5] [t1,t2,...]
//
// With a list of times it writes only those stills (for review); otherwise it writes every frame.
import { spawn } from 'node:child_process';
import { mkdir, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [outArg, fpsArg = '30', scaleArg = '1.5', timesArg] = process.argv.slice(2);
if (!outArg) { console.error('usage: node promo/render.mjs <outDir> [fps] [scale] [times]'); process.exit(1); }
const outDir = resolve(outArg), fps = Number(fpsArg), scale = Number(scaleArg);
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const page = pathToFileURL(resolve(new URL('./promo.html', import.meta.url).pathname)).href + '?capture';
const port = 9300 + Math.floor(Math.random() * 500);

await mkdir(outDir, { recursive: true });
const profile = await mkdtemp(join(tmpdir(), 'promo-chrome-'));
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--mute-audio', '--no-first-run', '--disable-gpu', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const quit = () => { try { proc.kill(); } catch {} };
process.on('exit', quit);

async function wsUrl() {
  for (let i = 0; i < 100; i++) {
    try { const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const tab = tabs.find(t => t.type === 'page'); if (tab) return tab.webSocketDebuggerUrl; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('Chrome did not start');
}
const socket = new WebSocket(await wsUrl());
await new Promise((res, rej) => { socket.onopen = res; socket.onerror = rej; });
let id = 0; const pending = new Map();
socket.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id; pending.set(n, m => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)); socket.send(JSON.stringify({ id: n, method, params })); });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: scale, mobile: false });
await send('Page.navigate', { url: page });
await new Promise(r => setTimeout(r, 1200));
const ready = await send('Runtime.evaluate', { expression: 'typeof setTime === "function" && PROMO_DURATION', returnByValue: true });
const duration = ready.result.value;
if (!duration) throw new Error('promo page did not load');

const times = timesArg ? timesArg.split(',').map(Number) : Array.from({ length: Math.round(duration * fps) }, (_, i) => i / fps);
let n = 0;
for (const t of times) {
  await send('Runtime.evaluate', { expression: `setTime(${t})` });
  const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const name = timesArg ? `still_${String(t).replace('.', '_')}.png` : `frame_${String(n).padStart(4, '0')}.png`;
  await writeFile(join(outDir, name), Buffer.from(shot.data, 'base64'));
  if (!timesArg && n % 60 === 0) console.log(`frame ${n}/${times.length}`);
  n++;
}
console.log(`wrote ${n} image(s) to ${outDir}`);
quit(); socket.close(); process.exit(0);
