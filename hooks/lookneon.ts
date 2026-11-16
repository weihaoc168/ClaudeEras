import type { ThemeSetArgs } from 'claude-code'

import type { DeskScheme, DeskSettings, DeskWallpaper } from '../types'
import { makeColors } from './make-colors.js'

// Neon-coast color schemes: a warm blush light mode and a night-purple dark
// mode, each with one bright accent pulled from a sunset over the sea.
const SCHEMES: Record<DeskScheme, { label: string; accent: string; dark: string; s0: string; s1: string; s2: string }> = {
  standard: { label: 'Sunset Pink', accent: '#c2185b', dark: '#ff6fb5', s0: '#f7ebf1', s1: '#fbf2f6', s2: '#fffafc' },
  rose: { label: 'Lagoon', accent: '#0e7c86', dark: '#4fe0e8', s0: '#ecf3f4', s1: '#f3f8f9', s2: '#fbfdfd' },
  slate: { label: 'Ultraviolet', accent: '#6a2fd6', dark: '#a98bff', s0: '#f0ecf8', s1: '#f6f3fb', s2: '#fcfbfe' },
  eggplant: { label: 'Citrus', accent: '#b4501a', dark: '#ffa95e', s0: '#f8eee6', s1: '#fbf4ee', s2: '#fffbf8' },
}

const SCHEME_KEYS = Object.keys(SCHEMES) as DeskScheme[]

export const SCHEME_OPTIONS = SCHEME_KEYS.map(value => ({ value, label: SCHEMES[value].label }))
export const accentOf = (scheme: DeskScheme): string => SCHEMES[scheme].accent
export const chromeOf = (scheme: DeskScheme): string => SCHEMES[scheme].s1

const build = (key: DeskScheme) => {
  const s = SCHEMES[key]
  return makeColors({
    label: `ClaudeEras Neon Coast - ${s.label}`,
    roles: { accent: s.accent, danger: '#b00030', success: '#007a4a', warning: '#a86400', pro: '#7a2fd6' },
    light: {
      gray: {
        anchors: {
          'surface-0': s.s0,
          'surface-1': s.s1,
          'surface-2': s.s2,
          'text-primary': '#140818',
          'text-secondary': '#2a1530',
          'text-muted': '#5a1f5e',
        },
      },
    },
    dark: {
      roles: { accent: s.dark },
      gray: {
        anchors: {
          'surface-0': '#120a1f',
          'surface-1': '#1a0f2c',
          'surface-2': '#22143a',
          'surface-3': '#2a1846',
          'text-primary': '#fbf1ff',
          'text-secondary': '#e6d4f2',
          'text-muted': '#c4a8d8',
        },
      },
    },
  })
}

const THEMES = {} as Record<DeskScheme, ReturnType<typeof build>>
for (const key of SCHEME_KEYS) {
  THEMES[key] = build(key)
}

export const blockingProblem = (scheme: DeskScheme): string | undefined =>
  THEMES[scheme].problems.find(line => line.startsWith("Desktop won't paint"))

export const allProblems = (): string[] => SCHEME_KEYS.flatMap(k => THEMES[k].problems.map(p => `${k}: ${p}`))

export const lookFor = (s: DeskSettings): ThemeSetArgs => ({
  colors: THEMES[s.scheme].theme,
  // Every wallpaper is a live scene drawn by the mod. The glass takes the app's
  // own panel color (dark in dark mode): frosted enough that text reads over the
  // bright sun, thin enough that the sunset still glows through.
  backdrop: { scene: 'neoncoast', glass: { blur: 8, opacity: 0.45 } },
})

// ---------- the desktop scene: neon icons, a glass taskbar, the coast ----------

export const WALLPAPERS: { value: DeskWallpaper; label: string; color: string }[] = [
  { value: 'coast', label: 'Neon Coast', color: '#3a0f5a' },
  { value: 'dusk', label: 'Purple Dusk', color: '#24113d' },
  { value: 'black', label: 'Midnight', color: '#0a0612' },
]

export const wallColor = (w: DeskWallpaper): string => WALLPAPERS.find(x => x.value === w)?.color ?? '#24113d'

// 32x32 neon-sign icons: a dark rounded tile with glowing tube lines in pink,
// cyan and orange. Origin at 0,0. All original art.
const NG = `<defs><filter id="ngGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
const tile = `<rect x="1" y="1" width="30" height="30" rx="8" fill="#1a0c2e" stroke="#ff4fa3" stroke-opacity=".35"/>`
const neon = (body: string): string => `${NG}${tile}<g fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" filter="url(#ngGlow)">${body}</g>`

export const ICONS: Record<string, string> = {
  computer: neon(`<rect x="7" y="7.5" width="18" height="12" rx="2" stroke="#5ff0ff"/><path d="M13 23.5h6M16 19.5v4" stroke="#ff5fae"/>`),
  bin: neon(`<path d="M9.5 10.5h13M13 10.5V8.5h6v2M11 10.5l1 14h8l1-14" stroke="#5ff0ff"/><path d="M14.5 14v7M17.5 14v7" stroke="#ff5fae"/>`),
  folder: neon(`<path d="M7 11.5V9h6l2 2.5h10v12H7z" stroke="#ffb347"/><path d="M7 14.5h18" stroke="#ff5fae"/>`),
  terminal: neon(`<rect x="6.5" y="7.5" width="19" height="17" rx="3" stroke="#ff5fae"/><path d="M10 13l3.5 3-3.5 3" stroke="#5ff0ff"/><path class="blink" d="M16 19.5h5" stroke="#ffb347"/>`),
  network: neon(`<circle cx="16" cy="9.5" r="2.6" stroke="#ff5fae"/><circle cx="9" cy="22.5" r="2.6" stroke="#5ff0ff"/><circle cx="23" cy="22.5" r="2.6" stroke="#5ff0ff"/><path d="M14.6 11.8L10.4 20.2M17.4 11.8l4.2 8.4M11.6 22.5h8.8" stroke="#ffb347"/>`),
  globe: neon(`<circle cx="16" cy="16" r="9" stroke="#5ff0ff"/><path d="M7 16h18M16 7c-3.5 3-3.5 15 0 18M16 7c3.5 3 3.5 15 0 18" stroke="#ff5fae"/>`),
  display: neon(`<rect x="7" y="7.5" width="18" height="12" rx="2" stroke="#ff5fae"/><path d="M8.5 16.5c2.5-3 4-3 6 0s4.5 1 8-2.5" stroke="#ffb347"/><path d="M13 23.5h6" stroke="#5ff0ff"/>`),
  monitor: neon(`<path d="M7 22.5l4.5-6 4 3 5-8 4.5 5" stroke="#5ff0ff"/><path d="M7 25h18" stroke="#ff5fae"/>`),
  spark: `<path d="M16 2l2.5 9.5L28 9l-7.5 6.5L28 22l-9.5-2.5L16 30l-2.5-10.5L4 22l7.5-6.5L4 9l9.5 2.5z" fill="#ffb347" stroke="#ff4fa3" stroke-width="1"/>`,
}

const iconAt = (name: string, x: number, y: number, label: string, selected = false): string => {
  const w = label.length * 6.2 + 10
  return `<g transform="translate(${x},${y})"><g transform="translate(22,0)">${ICONS[name]}</g>
<rect x="${38 - w / 2}" y="36" width="${w}" height="15" rx="7.5" fill="${selected ? '#ff4fa3' : 'none'}" fill-opacity=".85"/>
<text x="38" y="47" text-anchor="middle" fill="#fff" stroke="#2a0a30" stroke-opacity=".7" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round" font-family="Segoe UI, sans-serif" font-size="11">${label}</text></g>`
}

// A palm-tree silhouette: a curved, tapering trunk and a crown of drooping
// fronds. (x, y) is the foot of the trunk; k scales it; lean bends it.
const palm = (x: number, y: number, k: number, lean: number): string => {
  const tx = lean * 120
  const top = -420
  const fronds = [-160, -130, -100, -70, -40, -12, 15, 45, 75, 105, 135, 160]
    .map((a, i) => {
      const r = (a * Math.PI) / 180
      const len = 170 + ((i * 37) % 50)
      const ex = Math.sin(r) * len
      const ey = -Math.cos(r) * len * 0.35 + 95
      const cx = Math.sin(r) * len * 0.6
      const cy = -Math.cos(r) * len * 0.7 - 30
      // upper edge out to the tip, then a fuller lower edge back: a leaf
      return `<path d="M0 -4Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}Q${(cx * 0.75).toFixed(1)} ${(cy + 64).toFixed(1)} 0 10z"/>`
    })
    .join('')
  return `<g transform="translate(${x},${y}) scale(${k})"><path d="M-14 0C${tx * 0.3 - 12} ${top * 0.45} ${tx * 0.8 - 6} ${top * 0.85} ${tx - 5} ${top}L${tx + 5} ${top}C${tx * 0.8 + 6} ${top * 0.85} ${tx * 0.3 + 10} ${top * 0.45} 14 0z"/><g transform="translate(${tx},${top})">${fronds}<circle r="10"/></g></g>`
}

// "Neon Coast": an original, softly realistic sunset over the sea. A violet-to-
// tangerine sky with glowing cloud streaks, a blooming sun on a hazy horizon,
// headlands, a glittering reflection, a wet beach and palm silhouettes, under a
// fine film grain. Drawn in a 1600x1000 box; with a bleed the sky, sea and
// sand carry on past every edge so the art can be zoomed out. Gradients are in
// user space so they don't stretch with it.
const coastArt = (p: string, isAnimated: boolean, bleed = 0): string => {
  const x0 = -bleed
  const x1 = 1600 + bleed
  const top = -bleed
  const foot = 1000 + bleed
  const sea = 620
  const glitter = Array.from({ length: 34 }, (_, i) => {
    const y = sea + 6 + i * i * 0.28 + i * 4
    const spread = 40 + i * 9
    const w = 70 - i * 1.2 + ((i * 37) % 23)
    const x = 1060 + (((i * 53) % 7) - 3) * spread * 0.18 - w / 2
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(10, w).toFixed(1)}" height="${(2 + i * 0.12).toFixed(1)}" rx="1.5" opacity="${(0.95 - i * 0.022).toFixed(2)}"/>`
  }).join('')
  const streaks = [
    [300, 210, 360, 18, '#5a1a7a', 0.7],
    [1200, 160, 420, 16, '#5a1a7a', 0.6],
    [520, 330, 460, 20, '#ff6fa0', 0.55],
    [1320, 300, 380, 16, '#ff7a9a', 0.5],
    [880, 420, 520, 18, '#ff9a6a', 0.55],
    [250, 470, 300, 12, '#ffb070', 0.5],
    [1420, 470, 260, 10, '#ffc080', 0.5],
  ]
    .map(([cx, cy, rx, ry, c, o]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" opacity="${o}"/>`)
    .join('')
  return `<defs>
<linearGradient id="${p}sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${sea}"><stop offset="0" stop-color="#12062b"/><stop offset=".28" stop-color="#3a0f5a"/><stop offset=".52" stop-color="#8a1f6e"/><stop offset=".72" stop-color="#e0466e"/><stop offset=".88" stop-color="#ff8a4a"/><stop offset="1" stop-color="#ffc46a"/></linearGradient>
<linearGradient id="${p}sea" gradientUnits="userSpaceOnUse" x1="0" y1="${sea}" x2="0" y2="1000"><stop offset="0" stop-color="#c24a6e"/><stop offset=".12" stop-color="#7a2a6a"/><stop offset=".5" stop-color="#3a1450"/><stop offset="1" stop-color="#14082a"/></linearGradient>
<linearGradient id="${p}sand" gradientUnits="userSpaceOnUse" x1="0" y1="860" x2="0" y2="1000"><stop offset="0" stop-color="#4a1f48"/><stop offset="1" stop-color="#1a0a22"/></linearGradient>
<radialGradient id="${p}sun" gradientUnits="userSpaceOnUse" cx="1060" cy="${sea - 40}" r="120"><stop offset="0" stop-color="#fffbe8"/><stop offset=".45" stop-color="#ffe29a"/><stop offset=".8" stop-color="#ffab5a"/><stop offset="1" stop-color="#ff7a4a"/></radialGradient>
<radialGradient id="${p}bloom" gradientUnits="userSpaceOnUse" cx="1060" cy="${sea - 30}" r="520"><stop offset="0" stop-color="#ffd38a" stop-opacity=".85"/><stop offset=".35" stop-color="#ff8a6a" stop-opacity=".4"/><stop offset="1" stop-color="#ff4f8a" stop-opacity="0"/></radialGradient>
<filter id="${p}blur8" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="${p}blur30" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="${p}blur1"><feGaussianBlur stdDeviation="1.2"/></filter>
<filter id="${p}grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .5  0 0 0 .07 0"/></filter>
<clipPath id="${p}aboveSea"><rect x="${x0}" y="${top}" width="${x1 - x0}" height="${sea - top}"/></clipPath>
</defs>
<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${sea - top}" fill="url(#${p}sky)"/>
<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${foot - top}" fill="url(#${p}bloom)"/>
<g filter="url(#${p}blur8)" ${isAnimated ? 'class="drift"' : ''}>${streaks}</g>
<g clip-path="url(#${p}aboveSea)"><circle cx="1060" cy="${sea - 40}" r="120" fill="url(#${p}sun)" ${isAnimated ? 'class="pulse"' : ''}/></g>
<ellipse cx="1060" cy="${sea - 6}" rx="900" ry="46" fill="#ffb07a" opacity=".55" filter="url(#${p}blur30)"/>
<path d="M${x0} ${sea}H-20C80 ${sea - 18} 170 ${sea - 46} 260 ${sea - 40}S420 ${sea - 12} 520 ${sea}z" fill="#2a0f3a" opacity=".9"/>
<path d="M1380 ${sea}C1440 ${sea - 22} 1520 ${sea - 30} 1600 ${sea - 26}L${x1} ${sea - 26}V${sea}z" fill="#2a0f3a" opacity=".9"/>
<rect x="${x0}" y="${sea}" width="${x1 - x0}" height="${foot - sea}" fill="url(#${p}sea)"/>
<g fill="#ffd8a0" filter="url(#${p}blur1)" ${isAnimated ? 'class="shimmer"' : ''}>${glitter}</g>
<g stroke="#ff9ac0" stroke-opacity=".22" stroke-width="2" fill="none"><path d="M120 700q200-8 420 0"/><path d="M60 770q260-10 520 0"/><path d="M1300 690q160-6 300 0"/><path d="M1240 760q220-8 460 0"/><path d="M640 820q240-8 520 0"/></g>
<path d="M${x0} 1000V880C120 860 300 850 520 872S900 920 1100 930 1450 900 1600 890L${x1} 890V${foot}H${x0}z" fill="url(#${p}sand)"/>
<path d="M200 884C380 866 560 872 760 900" stroke="#ff9a8a" stroke-opacity=".25" stroke-width="3" fill="none"/>
<g fill="#0d0618">${palm(110, 960, 1.05, -0.35)}${palm(250, 990, 0.8, 0.25)}${palm(1500, 975, 0.95, 0.4)}</g>
<g stroke="#1a0a24" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M640 300l10 6 10-6"/><path d="M690 280l8 5 8-5"/><path d="M1320 250l9 5 9-5"/></g>
<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${foot - top}" filter="url(#${p}grain)"/>`
}

export const ZOOMS = [
  { value: '100', label: '100% (fill)' },
  { value: '80', label: '80%' },
  { value: '65', label: '65%' },
  { value: '50', label: '50% (whole picture)' },
] as const

const zoomOf = (s: DeskSettings): number => Number(s.zoom) / 100

// The scene is one 1600x1000 box that slices to fill any window, as the
// backdrop needs. Icons pin to the top-left and the taskbar to the bottom:
// @media rules (which read the scene's own box) shift them by however much
// the slice crops off that edge at the window's shape.
const W = 1600
const H = 1000

const edgeRules = (): string => {
  const rules: string[] = []
  // Wider than 16:10: top and bottom are cropped by (H - W/ar) / 2.
  for (const ar of [1.7, 1.8, 1.9, 2.0, 2.2, 2.4, 2.8, 3.4]) {
    const crop = Math.ceil((H - W / ar) / 2)
    rules.push(
      `@media (max-aspect-ratio:${Math.round(ar * 100)}/100) and (min-aspect-ratio:1600/1000){.pin-t{transform:translateY(${crop}px)}.pin-b{transform:translateY(-${crop}px)}}`,
    )
  }
  // Narrower than 16:10: left and right are cropped by (W - H*ar) / 2.
  for (const ar of [1.5, 1.4, 1.3, 1.2, 1.0, 0.8, 0.6, 0.45]) {
    const crop = Math.ceil((W - H * ar) / 2)
    rules.push(
      `@media (min-aspect-ratio:${Math.round(ar * 100)}/100) and (max-aspect-ratio:1600/1000){.pin-l{transform:translateX(${crop}px)}.pin-r{transform:translateX(-${crop}px)}}`,
    )
  }
  // Later rules win, so put the tightest band last.
  return rules.reverse().join('')
}

export const sceneSvg = (s: DeskSettings): string => {
  const ground =
    s.wallpaper === 'coast'
      ? `<g transform="translate(800 500) scale(${zoomOf(s)}) translate(-800 -500)">${coastArt('m', true, 4000)}</g>`
      : `<rect width="${W}" height="${H}" fill="${wallColor(s.wallpaper)}"/>`
  const icons = s.icons
    ? `<g class="pin-t"><g class="pin-l"><g transform="translate(6,8) scale(1.15)">${[
        iconAt('computer', 0, 0, 'My Computer'),
        iconAt('folder', 0, 70, 'My Documents'),
        iconAt('globe', 0, 140, 'The Internet'),
        iconAt('network', 0, 210, 'Network'),
        iconAt('bin', 0, 280, 'Recycle Bin'),
        iconAt('terminal', 0, 350, 'Claude Code', true),
      ].join('\n')}</g></g></g>`
    : ''
  const taskbar = s.taskbar
    ? `<g class="pin-b"><g transform="translate(0,${H})">
<defs>
<linearGradient id="tline" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff4fa3"/><stop offset=".5" stop-color="#ffb347"/><stop offset="1" stop-color="#5ff0ff"/></linearGradient>
<linearGradient id="tpill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff4fa3"/><stop offset="1" stop-color="#ff8a4a"/></linearGradient>
</defs>
<rect x="-1000" y="-36" width="${W + 2000}" height="36" fill="#140a24" fill-opacity=".82"/>
<rect x="-1000" y="-36" width="${W + 2000}" height="2" fill="url(#tline)"/>
<g class="pin-l"><g transform="translate(6,-31) scale(1.15)">
<rect width="78" height="22" rx="11" fill="url(#tpill)"/>
<g transform="translate(5,3) scale(.5)">${ICONS.spark}</g>
<text x="26" y="15.5" font-family="Segoe UI, sans-serif" font-weight="bold" font-size="12" fill="#fff">Start</text>
<g transform="translate(88,0) scale(.69)">${ICONS.globe}</g><g transform="translate(112,0) scale(.69)">${ICONS.folder}</g><g transform="translate(136,0) scale(.69)">${ICONS.terminal}</g>
<g transform="translate(166,0)"><rect width="160" height="22" rx="6" fill="#2c1748" stroke="#ff4fa3" stroke-opacity=".7"/><g transform="translate(4,2) scale(.56)">${ICONS.terminal}</g><text x="28" y="15" font-family="Segoe UI, sans-serif" font-size="11" fill="#fbe6ff">Claude Code</text></g>
</g></g>
<g class="pin-r"><g transform="translate(${W - 116},-31) scale(1.15)">
<rect width="94" height="22" rx="11" fill="#2c1748" stroke="#5ff0ff" stroke-opacity=".5"/>
<g transform="translate(4,2) scale(.56)">${ICONS.network}</g>
<text x="30" y="15" font-family="Segoe UI, sans-serif" font-size="11" fill="#ffd27a">Ready<tspan class="blink">_</tspan></text></g></g>
</g></g>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>.blink{animation:b 1.1s steps(1) infinite}@keyframes b{50%{opacity:0}}.drift{animation:d 120s ease-in-out infinite alternate}@keyframes d{to{transform:translateX(90px)}}.shimmer{animation:sh 2.4s ease-in-out infinite alternate}@keyframes sh{to{opacity:.55}}.pulse{animation:pu 6s ease-in-out infinite alternate}@keyframes pu{to{opacity:.88}}${edgeRules()}</style>
${ground}
${icons}
${taskbar}
</svg>`
}

// A miniature monitor showing the wallpaper, for the Display Properties preview.
export const previewSvg = (s: DeskSettings): string => {
  const icons = s.icons
    ? `<g transform="translate(36,20) scale(.4)">${ICONS.computer}</g><g transform="translate(36,38) scale(.4)">${ICONS.folder}</g><g transform="translate(36,56) scale(.4)">${ICONS.bin}</g>`
    : ''
  const bar = s.taskbar
    ? '<rect x="32" y="108" width="136" height="8" fill="#140a24"/><rect x="32" y="108" width="136" height="1" fill="#ff4fa3"/><rect x="34" y="109.5" width="14" height="5" rx="2.5" fill="#ff4fa3"/>'
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 156" width="200" height="156">
<rect x="20" y="6" width="160" height="124" rx="10" fill="#1a0c2e" stroke="#ff4fa3"/>
${
    s.wallpaper === 'coast'
      ? `<svg x="32" y="16" width="136" height="100" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">${coastArt('p', false)}</svg>`
      : `<rect x="32" y="16" width="136" height="100" fill="${wallColor(s.wallpaper)}"/>`
  }
${icons}
<rect x="70" y="34" width="70" height="46" rx="5" fill="#170c2a" stroke="#ff4fa3"/><path d="M70 43v-4q0-5 5-5h60q5 0 5 5v4z" fill="${accentOf(s.scheme)}"/><rect x="130" y="36" width="7" height="5" rx="2" fill="#ff7a3a"/>
<rect x="74" y="50" width="62" height="24" rx="3" fill="#24143c" stroke="#6a4a9a"/>
${bar}
<rect x="88" y="130" width="24" height="12" fill="#2a1846"/><rect x="66" y="142" width="68" height="8" rx="4" fill="#2a1846"/></svg>`
}

export const iconSvg = (name: string, size = 20): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">${ICONS[name] ?? ''}</svg>`
