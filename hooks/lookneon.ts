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

// 32x32 icons that put the 1998 and early-2000s desktop shapes (a CRT monitor
// on its stand, a tabbed folder, a ribbed bin, a window with a title bar and
// close box) into glowing neon tubes over a dark tinted fill. Origin at 0,0.
// All original art.
const NG = `<defs><filter id="ngGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
const neon = (fill: string, body: string): string =>
  `${NG}<g opacity=".55">${fill}</g><g fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#ngGlow)">${body}</g>`
const PINK = '#ff5fae'
const CYAN = '#5ff0ff'
const ORANGE = '#ffb347'

export const ICONS: Record<string, string> = {
  computer: neon(
    `<rect x="3" y="2.5" width="26" height="19" rx="2.5" fill="#2a1240"/><rect x="5.5" y="5" width="21" height="14" rx="1" fill="#0d1a3a"/>`,
    `<rect x="3" y="2.5" width="26" height="19" rx="2.5" stroke="${PINK}"/><rect x="5.5" y="5" width="21" height="14" rx="1" stroke="${CYAN}"/><path d="M8 8h7M8 10.5h10" stroke="${CYAN}" stroke-opacity=".7"/><path d="M12 21.5h8l1.5 4h-11zM6 29h20" stroke="${PINK}"/><path d="M21 27h3" stroke="${ORANGE}"/>`,
  ),
  bin: neon(
    `<path d="M8 8h16l-2 21H10z" fill="#2a1240"/>`,
    `<path d="M6 5.5h20M13 5.5V3h6v2.5M8 8h16l-2 21H10z" stroke="${CYAN}"/><path d="M12 11l.8 15M16 11v15M20 11l-.8 15" stroke="${PINK}"/>`,
  ),
  folder: neon(
    `<path d="M2.5 13h27v14h-27z" fill="#3a1a2a"/>`,
    `<path d="M2.5 8.5q0-2 2-2h7l2.5 3h13q2 0 2 2V27h-26.5z" stroke="${ORANGE}"/><path d="M7 8v-.5h16v5" stroke="${CYAN}" stroke-opacity=".8"/><path d="M2.5 13.5h27" stroke="${PINK}"/>`,
  ),
  terminal: neon(
    `<rect x="2" y="4" width="28" height="24" rx="2.5" fill="#1a0c2e"/>`,
    `<rect x="2" y="4" width="28" height="24" rx="2.5" stroke="${PINK}"/><path d="M2 9h28" stroke="${PINK}"/><rect x="24.5" y="5.5" width="3.5" height="2.2" rx=".6" stroke="${ORANGE}"/><path d="M6.5 14l3.5 2.5-3.5 2.5" stroke="${CYAN}"/><path class="blink" d="M12 19.5h5.5" stroke="${ORANGE}"/>`,
  ),
  network: neon(
    `<rect x="2" y="3" width="13" height="10" rx="1.5" fill="#2a1240"/><rect x="17" y="3" width="13" height="10" rx="1.5" fill="#2a1240"/>`,
    `<rect x="2" y="3" width="13" height="10" rx="1.5" stroke="${PINK}"/><rect x="17" y="3" width="13" height="10" rx="1.5" stroke="${PINK}"/><path d="M8.5 13v5h15v-5M16 18v4" stroke="${CYAN}"/><circle cx="16" cy="25.5" r="3.4" stroke="${ORANGE}"/>`,
  ),
  globe: neon(
    `<circle cx="16" cy="16" r="13" fill="#0d1a3a"/>`,
    `<circle cx="16" cy="16" r="13" stroke="${CYAN}"/><path d="M3 16h26M16 3c-5 4-5 22 0 26M16 3c5 4 5 22 0 26M5.5 9h21M5.5 23h21" stroke="${PINK}" stroke-opacity=".85"/>`,
  ),
  display: neon(
    `<rect x="3" y="3" width="26" height="19" rx="2.5" fill="#2a1240"/>`,
    `<rect x="3" y="3" width="26" height="19" rx="2.5" stroke="${PINK}"/><path d="M6 16c3-4 5-4 7.5 0s5 1 12.5-5" stroke="${ORANGE}"/><circle cx="21" cy="8.5" r="2" stroke="${ORANGE}"/><path d="M12 22h8l1.5 4h-11zM7 29h18" stroke="${CYAN}"/>`,
  ),
  monitor: neon(
    `<rect x="3" y="3" width="26" height="24" rx="2.5" fill="#0d0618"/>`,
    `<rect x="3" y="3" width="26" height="24" rx="2.5" stroke="${PINK}"/><path d="M5.5 22l5-6 4 3 5-9 3 4 3.5-5" stroke="${CYAN}"/>`,
  ),
  spark: `<path d="M16 2l2.5 9.5L28 9l-7.5 6.5L28 22l-9.5-2.5L16 30l-2.5-10.5L4 22l7.5-6.5L4 9l9.5 2.5z" fill="${ORANGE}" stroke="${PINK}" stroke-width="1"/>`,
}

// A desktop icon with its label; a selected one gets the 1998 dotted focus
// outline, glowing pink.
const iconAt = (name: string, x: number, y: number, label: string, selected = false): string => {
  const w = label.length * 6.2 + 8
  return `<g transform="translate(${x},${y})"><g transform="translate(22,0)">${ICONS[name]}</g>
<rect x="${38 - w / 2}" y="36" width="${w}" height="15" fill="${selected ? '#ff4fa3' : 'none'}" fill-opacity=".35" ${selected ? 'stroke="#ff9ad0" stroke-dasharray="1.5 1.5"' : ''}/>
<text x="38" y="47" text-anchor="middle" fill="#fff" stroke="#2a0a30" stroke-opacity=".7" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round" font-family="Tahoma, sans-serif" font-size="11">${label}</text></g>`
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
const coastArt = (p: string, isAnimated: boolean, bleed = 0, withGrain = true): string => {
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
${withGrain ? `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${foot - top}" filter="url(#${p}grain)"/>` : ''}`
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
      `@media (max-aspect-ratio:${Math.round(ar * 100)}/100) and (min-aspect-ratio:1600/1000){.pin-t{transform:translateY(${crop}px)}.pin-b{transform:translateY(-${crop}px)}.unpin-t{transform:translateY(-${crop}px)}.unpin-b{transform:translateY(${crop}px)}}`,
    )
  }
  // Narrower than 16:10: left and right are cropped by (W - H*ar) / 2.
  for (const ar of [1.5, 1.4, 1.3, 1.2, 1.0, 0.8, 0.6, 0.45]) {
    const crop = Math.ceil((W - H * ar) / 2)
    rules.push(
      `@media (min-aspect-ratio:${Math.round(ar * 100)}/100) and (max-aspect-ratio:1600/1000){.pin-l{transform:translateX(${crop}px)}.pin-r{transform:translateX(-${crop}px)}.unpin-l{transform:translateX(-${crop}px)}.unpin-r{transform:translateX(${crop}px)}}`,
    )
  }
  // Later rules win, so put the tightest band last.
  return rules.reverse().join('')
}

export const sceneSvg = (s: DeskSettings): string => {
  const ground =
    s.wallpaper === 'coast'
      ? `<g id="ground"><g transform="translate(800 500) scale(${zoomOf(s)}) translate(-800 -500)">${coastArt('m', true, 4000, false)}</g></g><g transform="translate(800 500) scale(${zoomOf(s)}) translate(-800 -500)"><rect x="-4000" y="-4000" width="9600" height="9000" filter="url(#mgrain)"/></g>`
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
  // A floating liquid-glass taskbar. Each round button and capsule shows the
  // scene that lies behind it: a copy of the ground, clipped to the shape,
  // frosted (blurred, saturated, brightened) in the middle and only lightly
  // blurred but rippled along a thin rim, the way light bends at the rounded
  // edge of a glass blob. Over that sit a bright rim, a specular streak, a
  // caustic glow at the bottom and a soft drop shadow. The left group pins to
  // the left edge and the tray to the right, at any window shape.
  const rr = (x: number, y: number, w: number, h: number, r: number): string =>
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x + r} ${y}z`
  const ring = (x: number, y: number, w: number, h: number, t: number): string =>
    `${rr(x, y, w, h, h / 2)}${rr(x + t, y + t, w - 2 * t, h - 2 * t, h / 2 - t)}`
  type Piece = [number, number, number, number]
  // Puts a copy of the ground back in scene space from inside a pinned group
  // whose own transform is pin, translate(0,H), pin, translate(tx,ty), scale(k).
  const behind = (tx: number, ty: number, k: number, side: 'l' | 'r') =>
    `<g transform="scale(${(1 / k).toFixed(6)}) translate(${-tx},${-ty})"><g class="unpin-${side}"><g transform="translate(0,${-H})"><g class="unpin-b"><use href="#ground"/></g></g></g></g>`
  const glassGroup = (id: string, pieces: Piece[], tx: number, ty: number, k: number, side: 'l' | 'r'): string => {
    const shapes = pieces.map(([x, y, w, h]) => `<path d="${rr(x, y, w, h, h / 2)}"/>`).join('')
    const rings = pieces.map(([x, y, w, h]) => `<path d="${ring(x, y, w, h, 3.2)}" fill-rule="evenodd" clip-rule="evenodd"/>`).join('')
    const hasGround = s.wallpaper === 'coast'
    return `<clipPath id="${id}In">${shapes}</clipPath><clipPath id="${id}Rim">${rings}</clipPath>
${pieces.map(([x, y, w, h]) => `<path d="${rr(x, y + 5, w, h, h / 2)}" fill="#0a0414" opacity=".4" filter="url(#gShadow)"/>`).join('')}
${hasGround ? `<g clip-path="url(#${id}In)"><g filter="url(#gFrost)">${behind(tx, ty, k, side)}</g></g>
<g clip-path="url(#${id}Rim)"><g filter="url(#gBend)">${behind(tx, ty, k, side)}</g></g>` : ''}
${pieces
  .map(([x, y, w, h]) => {
    const r = h / 2
    return `<path d="${rr(x, y, w, h, r)}" fill="url(#gTint)"/>
<path d="${rr(x, y, w, h, r)}" fill="url(#gCaustic)"/>
<path d="${rr(x + 0.6, y + 0.6, w - 1.2, h - 1.2, r - 0.6)}" fill="none" stroke="url(#gRim)" stroke-width="1.3"/>
<path d="${rr(x + 1.8, y + 1.8, w - 3.6, h - 3.6, r - 1.8)}" fill="none" stroke="#ffffff" stroke-opacity=".12" stroke-width="1"/>
<path d="${rr(x + r * 0.5, y + 2.4, w - r, h * 0.3, h * 0.15)}" fill="url(#gSpec)"/>
<ellipse cx="${x + w * 0.5}" cy="${y + h - 4}" rx="${w * 0.32}" ry="2" fill="#ffe0f0" opacity=".35" filter="url(#gSoft)"/>`
  })
  .join('')}`
  }
  const button = (cx: number, cy: number, r: number, fill: string): string =>
    `<circle cx="${cx}" cy="${cy + 2}" r="${r}" fill="#0a0414" opacity=".3" filter="url(#gSoft)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/><circle cx="${cx}" cy="${cy}" r="${r - 0.5}" fill="none" stroke="url(#gRim)" stroke-width="1"/><ellipse cx="${cx}" cy="${cy - r * 0.5}" rx="${r * 0.6}" ry="${r * 0.28}" fill="url(#gSpec)"/>`
  const LTX = 14
  const LTY = -62
  const K = 1.15
  const RTX = W - 150
  const taskbar = s.taskbar
    ? `<g class="pin-b"><g transform="translate(0,${H})">
<defs>
<linearGradient id="gTint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".18"/><stop offset=".55" stop-color="#ffffff" stop-opacity=".03"/><stop offset="1" stop-color="#ffffff" stop-opacity=".1"/></linearGradient>
<linearGradient id="gCaustic" x1="0" y1="0" x2="0" y2="1"><stop offset=".6" stop-color="#ff9ad0" stop-opacity="0"/><stop offset="1" stop-color="#ffb0d8" stop-opacity=".22"/></linearGradient>
<linearGradient id="gRim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".35" stop-color="#ffffff" stop-opacity=".25"/><stop offset=".7" stop-color="#ffffff" stop-opacity=".08"/><stop offset="1" stop-color="#ffd6ee" stop-opacity=".7"/></linearGradient>
<linearGradient id="gSpec" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".7"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
<radialGradient id="gStart" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#ffd0ea" stop-opacity=".75"/><stop offset=".5" stop-color="#ff4fa3" stop-opacity=".55"/><stop offset="1" stop-color="#ff8a4a" stop-opacity=".55"/></radialGradient>
<radialGradient id="gBtn" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#ffffff" stop-opacity=".28"/><stop offset="1" stop-color="#ffffff" stop-opacity=".04"/></radialGradient>
<filter id="gFrost" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/><feColorMatrix type="saturate" values="1.6"/><feComponentTransfer><feFuncR type="linear" slope="1.12" intercept=".03"/><feFuncG type="linear" slope="1.12" intercept=".03"/><feFuncB type="linear" slope="1.12" intercept=".04"/></feComponentTransfer></filter>
<filter id="gBend" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".035 .09" numOctaves="2" seed="11" result="n"/><feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="b"/><feDisplacementMap in="b" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix type="saturate" values="1.8"/><feComponentTransfer><feFuncR type="linear" slope="1.25"/><feFuncG type="linear" slope="1.25"/><feFuncB type="linear" slope="1.25"/></feComponentTransfer></filter>
<filter id="gShadow" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="gSoft" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="1.6"/></filter>
<filter id="gDot" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<g class="pin-l"><g transform="translate(${LTX},${LTY}) scale(${K})">
${glassGroup('gL', [[1, 1, 42, 42], [52, 4, 108, 36], [170, 4, 150, 36]], LTX, LTY, K, 'l')}
<circle cx="22" cy="22" r="17" fill="url(#gStart)"/>
<g transform="translate(11,11) scale(.7)">${ICONS.spark}</g>
${button(73, 22, 13, 'url(#gBtn)')}<g transform="translate(64,13) scale(.56)">${ICONS.globe}</g>
${button(106, 22, 13, 'url(#gBtn)')}<g transform="translate(97,13) scale(.56)">${ICONS.folder}</g>
${button(139, 22, 13, 'url(#gBtn)')}<g transform="translate(130,13) scale(.56)">${ICONS.terminal}</g>
<g transform="translate(182,13) scale(.56)">${ICONS.terminal}</g>
<text x="205" y="26.5" font-family="Segoe UI, sans-serif" font-weight="600" font-size="12" fill="#fff" stroke="#3a0a30" stroke-opacity=".35" stroke-width="2" paint-order="stroke">Claude Code</text>
<circle cx="245" cy="47" r="2.2" fill="#ffd27a" filter="url(#gDot)"/>
</g></g>
<g class="pin-r"><g transform="translate(${RTX},${LTY}) scale(${K})">
${glassGroup('gR', [[0, 4, 116, 36]], RTX, LTY, K, 'r')}
<path d="M16 18h3l4-4v16l-4-4h-3z" fill="none" stroke="#ffd27a" stroke-width="1.3" stroke-linejoin="round"/>
<g transform="translate(29,13) scale(.5)">${ICONS.network}</g>
<text x="52" y="26.5" font-family="Segoe UI, sans-serif" font-size="12" fill="#ffe6b0" stroke="#3a0a30" stroke-opacity=".35" stroke-width="2" paint-order="stroke">Ready<tspan class="blink">_</tspan></text>
</g></g>
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
    ? '<circle cx="38" cy="111" r="4" fill="#ff4fa3" stroke="#fff" stroke-opacity=".7" stroke-width=".6"/><rect x="45" y="107.5" width="22" height="7" rx="3.5" fill="#fff" fill-opacity=".22" stroke="#fff" stroke-opacity=".6" stroke-width=".5"/><rect x="69" y="107.5" width="30" height="7" rx="3.5" fill="#fff" fill-opacity=".22" stroke="#fff" stroke-opacity=".6" stroke-width=".5"/><rect x="146" y="107.5" width="20" height="7" rx="3.5" fill="#fff" fill-opacity=".22" stroke="#fff" stroke-opacity=".6" stroke-width=".5"/>'
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
