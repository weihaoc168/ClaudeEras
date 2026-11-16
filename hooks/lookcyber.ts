import type { ThemeSetArgs } from 'claude-code'

import type { DeskScheme, DeskSettings, DeskWallpaper } from '../types'
import { makeColors } from './make-colors.js'

// Claude Cyber color schemes: an original neon-noir look. A cool steel light
// mode and a near-black dark mode, each lit by one hard neon accent.
const SCHEMES: Record<DeskScheme, { label: string; accent: string; dark: string; s0: string; s1: string; s2: string }> = {
  standard: { label: 'Acid', accent: '#7a7000', dark: '#f5e642', s0: '#eceff1', s1: '#f3f5f6', s2: '#fbfcfc' },
  rose: { label: 'Magenta', accent: '#b0106a', dark: '#ff2bd6', s0: '#f1edf0', s1: '#f6f3f5', s2: '#fcfbfc' },
  slate: { label: 'Ice', accent: '#006f7d', dark: '#00e5ff', s0: '#ebf1f2', s1: '#f2f6f7', s2: '#fbfdfd' },
  eggplant: { label: 'Redline', accent: '#a80d26', dark: '#ff3b4f', s0: '#f1eded', s1: '#f6f3f3', s2: '#fcfbfb' },
}

const SCHEME_KEYS = Object.keys(SCHEMES) as DeskScheme[]

export const SCHEME_OPTIONS = SCHEME_KEYS.map(value => ({ value, label: SCHEMES[value].label }))
export const accentOf = (scheme: DeskScheme): string => SCHEMES[scheme].accent
export const chromeOf = (scheme: DeskScheme): string => SCHEMES[scheme].s1

const build = (key: DeskScheme) => {
  const s = SCHEMES[key]
  return makeColors({
    label: `ClaudeEras Claude Cyber - ${s.label}`,
    roles: { accent: s.accent, danger: '#b00020', success: '#00704a', warning: '#8a6a00', pro: '#7a1fd6' },
    light: {
      gray: {
        anchors: {
          'surface-0': s.s0,
          'surface-1': s.s1,
          'surface-2': s.s2,
          'text-primary': '#05080b',
          'text-secondary': '#18222c',
          'text-muted': '#2f4352',
        },
      },
    },
    dark: {
      roles: { accent: s.dark },
      gray: {
        anchors: {
          'surface-0': '#07090c',
          'surface-1': '#0d1117',
          'surface-2': '#131a22',
          'surface-3': '#1a2230',
          'text-primary': '#e8f6ff',
          'text-secondary': '#c4dbe8',
          'text-muted': '#8fb0c2',
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
  // The glass takes the app's own panel color: frosted enough that text reads
  // over the neon, thin enough that the city still glows through.
  backdrop: { scene: 'claudecyber', glass: { blur: 8, opacity: 0.5 } },
})

export const WALLPAPERS: { value: DeskWallpaper; label: string; color: string }[] = [
  { value: 'city', label: 'Rain City', color: '#0a0b16' },
  { value: 'void', label: 'Void', color: '#05070a' },
  { value: 'black', label: 'Black', color: '#000000' },
]

export const wallColor = (w: DeskWallpaper): string => WALLPAPERS.find(x => x.value === w)?.color ?? '#05070a'

// A tiny deterministic random source, so the city is the same every time.
const rand = (seed: number) => {
  let x = seed
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296
    return x / 4294967296
  }
}

const ACID = '#f5e642'
const CYAN = '#00e5ff'
const MAGENTA = '#ff2bd6'
const RED = '#ff3b4f'

// 32x32 HUD icons: a cut-corner frame and a glyph in thin acid, cyan and
// magenta lines, with a faint magenta ghost offset like a glitch. All original.
const HG = `<defs><filter id="hGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation=".8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
const frame = `<path d="M6 2H30V24L24 30H2V6z" fill="#0b1018" fill-opacity=".85" stroke="${CYAN}" stroke-width="1.2"/><path d="M2 6L6 2" stroke="${ACID}" stroke-width="1.6"/><path d="M24 30L30 24" stroke="${ACID}" stroke-width="1.6"/>`
const hud = (glyph: string): string =>
  `${HG}${frame}<g fill="none" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter"><g transform="translate(1,0)" stroke="${MAGENTA}" opacity=".45">${glyph}</g><g stroke="${ACID}" filter="url(#hGlow)">${glyph}</g></g>`

export const ICONS: Record<string, string> = {
  computer: hud(`<path d="M8 8h16v10H8zM13 22h6M16 18v4"/>`),
  bin: hud(`<path d="M9 9h14M13 9V7h6v2M11 9l1 15h8l1-15M14.5 12v9M17.5 12v9"/>`),
  folder: hud(`<path d="M7 10h6l2 2h10v12H7z"/>`),
  terminal: hud(`<path d="M7 8h18v16H7zM10 13l3 2.5-3 2.5M15.5 19h5"/>`),
  network: hud(`<path d="M16 7v5M9 21h14M16 12l-7 9M16 12l7 9"/><path d="M14 5h4v4h-4zM7 19h4v4H7zM21 19h4v4h-4z"/>`),
  globe: hud(`<path d="M16 7l8 4.5v9L16 25l-8-4.5v-9zM8 11.5l8 4.5 8-4.5M16 16v9"/>`),
  display: hud(`<path d="M7 8h18v12H7zM10 17l4-4 3 3 2-2 3 3M12 24h8"/>`),
  monitor: hud(`<path d="M7 22l4-5 3 3 4-8 3 4 4-6M7 25h18"/>`),
  spark: `<path d="M16 2l2.5 9.5L28 9l-7.5 6.5L28 22l-9.5-2.5L16 30l-2.5-10.5L4 22l7.5-6.5L4 9l9.5 2.5z" fill="${ACID}" stroke="${MAGENTA}" stroke-width="1"/>`,
}

const iconAt = (name: string, x: number, y: number, label: string, selected = false): string => {
  const text = label.toUpperCase()
  const w = text.length * 6.6 + 8
  return `<g transform="translate(${x},${y})"><g transform="translate(22,0)">${ICONS[name]}</g>
${selected ? `<path d="M${38 - w / 2} 36H${38 + w / 2}V47L${38 + w / 2 - 4} 51H${38 - w / 2}z" fill="${ACID}"/>` : ''}
<text x="38" y="47" text-anchor="middle" fill="${selected ? '#05080b' : '#e8f6ff'}" ${selected ? '' : 'stroke="#000" stroke-opacity=".7" stroke-width="2.4" paint-order="stroke"'} font-family="Consolas, monospace" font-size="10" letter-spacing=".5">${text}</text></g>`
}

// One row of buildings: rectangles from a seeded random source, with lit
// windows, rooftop antennas and blinking beacons. depth 0 is far, 2 is near.
const skyline = (p: string, seed: number, depth: number, x0: number, x1: number): string => {
  const r = rand(seed)
  const base = [600, 700, 820][depth] ?? 760
  const fill = ['#1b1f3d', '#10142a', '#070912'][depth] ?? '#070912'
  const winColors = [ACID, CYAN, MAGENTA, '#ffb070', '#e8f6ff']
  const winOpacity = [0.35, 0.6, 0.7][depth] ?? 0.6
  let x = x0
  const parts: string[] = []
  const windows: string[] = []
  while (x < x1) {
    const w = 40 + r() * [70, 110, 160][depth]!
    const h = [300, 300, 260][depth]! * (0.45 + r() * 0.9) + (depth === 0 && r() > 0.8 ? 220 : 0)
    const top = base - h
    parts.push(`<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${w.toFixed(0)}" height="${(1000 - top + 4000).toFixed(0)}"/>`)
    if (r() > 0.55) {
      parts.push(`<rect x="${(x + w / 2 - 1).toFixed(0)}" y="${(top - 30 - r() * 40).toFixed(0)}" width="2" height="70"/>`)
      if (r() > 0.4) {
        windows.push(`<circle cx="${(x + w / 2).toFixed(0)}" cy="${(top - 40).toFixed(0)}" r="2.2" fill="${RED}" class="blink"/>`)
      }
    }
    if (depth > 0 && x > -200 && x < 1800) {
      const cols = Math.floor(w / 12)
      const rows = Math.floor(Math.min(h, 400) / 16)
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (r() > (depth === 2 ? 0.86 : 0.76)) {
            const c = winColors[Math.floor(r() * winColors.length)]
            windows.push(`<rect x="${(x + 5 + i * 12).toFixed(0)}" y="${(top + 10 + j * 16).toFixed(0)}" width="6" height="8" fill="${c}" opacity="${(winOpacity * (0.4 + r() * 0.6)).toFixed(2)}"/>`)
          }
        }
      }
    }
    x += w + 2 + r() * 14
  }
  return `<g fill="${fill}">${parts.join('')}</g><g>${windows.join('')}</g>`
}

// A vertical neon sign: a glowing frame with stacked letters.
const vSign = (x: number, y: number, word: string, color: string): string => {
  const h = word.length * 22 + 14
  const letters = word
    .split('')
    .map((ch, i) => `<text x="${x + 13}" y="${y + 24 + i * 22}" text-anchor="middle">${ch}</text>`)
    .join('')
  return `<g filter="url(#cNeon)"><rect x="${x}" y="${y}" width="26" height="${h}" fill="#05060a" fill-opacity=".7" stroke="${color}" stroke-width="2"/><g fill="${color}" font-family="Consolas, monospace" font-weight="bold" font-size="18">${letters}</g></g>`
}

// "Rain City": an original neon-noir megacity at night. A smoggy magenta sky,
// three depths of towers fading into haze, lit windows and blinking beacons,
// made-up neon signs, a glitching hologram billboard, light trails of flying
// traffic, slanting rain and a wet street reflecting it all, under scanlines.
// Drawn in a 1600x1000 box; with a bleed the sky and street carry on past
// every edge so the art can be zoomed out.
const cityArt = (p: string, isAnimated: boolean, bleed = 0): string => {
  const x0 = -bleed
  const x1 = 1600 + bleed
  const top = -bleed
  const foot = 1000 + bleed
  const street = 820
  const r = rand(77)
  const rain = Array.from({ length: 170 }, () => {
    const x = r() * 1900 - 150
    const y = r() * 1000
    const l = 18 + r() * 30
    return `<path d="M${x.toFixed(0)} ${y.toFixed(0)}l${(-l * 0.25).toFixed(1)} ${l.toFixed(0)}"/>`
  }).join('')
  const trails = [
    [120, 300, 640, CYAN],
    [900, 250, 1500, MAGENTA],
    [300, 420, 980, ACID],
    [1050, 380, 1580, CYAN],
  ]
    .map(([a, y, b, c], i) => `<path d="M${a} ${y}Q${((a as number) + (b as number)) / 2} ${(y as number) - 30} ${b} ${(y as number) + 10}" stroke="${c}" stroke-width="2" fill="none" opacity=".75" ${isAnimated ? `class="trail${i % 2}"` : ''}/>`)
    .join('')
  const reflections = [
    [210, MAGENTA, 26],
    [470, ACID, 18],
    [760, CYAN, 40],
    [1010, MAGENTA, 22],
    [1240, ACID, 30],
    [1430, CYAN, 20],
  ]
    .map(([x, c, w]) => `<rect x="${x}" y="${street}" width="${w}" height="${1000 - street}" fill="${c}" opacity=".22"/>`)
    .join('')
  return `<defs>
<linearGradient id="${p}sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${street}"><stop offset="0" stop-color="#04040a"/><stop offset=".45" stop-color="#140a2a"/><stop offset=".78" stop-color="#3a0f3f"/><stop offset="1" stop-color="#5a1640"/></linearGradient>
<linearGradient id="${p}haze" gradientUnits="userSpaceOnUse" x1="0" y1="300" x2="0" y2="${street}"><stop offset="0" stop-color="#ff2bd6" stop-opacity="0"/><stop offset=".6" stop-color="#7a1a6a" stop-opacity=".35"/><stop offset="1" stop-color="#2a0a2a" stop-opacity=".6"/></linearGradient>
<linearGradient id="${p}street" gradientUnits="userSpaceOnUse" x1="0" y1="${street}" x2="0" y2="1000"><stop offset="0" stop-color="#1a0a24"/><stop offset="1" stop-color="#05060a"/></linearGradient>
<linearGradient id="${p}holo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${CYAN}" stop-opacity=".55"/><stop offset="1" stop-color="${MAGENTA}" stop-opacity=".35"/></linearGradient>
<pattern id="${p}scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".22"/></pattern>
<filter id="cNeon" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="${p}soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="${p}wet" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3 14"/></filter>
<radialGradient id="${p}vig" gradientUnits="userSpaceOnUse" cx="800" cy="500" r="1000"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
</defs>
<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${street - top}" fill="url(#${p}sky)"/>
<ellipse cx="800" cy="${street - 120}" rx="1100" ry="260" fill="#ff2bd6" opacity=".18" filter="url(#${p}soft)"/>
${skyline(p, 11, 0, x0 - 50, x1 + 50)}
<rect x="${x0}" y="300" width="${x1 - x0}" height="${street - 300}" fill="url(#${p}haze)"/>
<g ${isAnimated ? 'class="trails"' : ''}>${trails}</g>
${skyline(p, 23, 1, x0 - 50, x1 + 50)}
<g transform="translate(560,260)" ${isAnimated ? 'class="glitch"' : ''}>
<rect width="300" height="130" fill="url(#${p}holo)" stroke="${CYAN}" stroke-width="2"/>
<rect x="6" y="6" width="288" height="118" fill="url(#${p}scan)"/>
<text x="150" y="62" text-anchor="middle" font-family="Consolas, monospace" font-weight="bold" font-size="38" fill="#e8f6ff" letter-spacing="4">CLAUDE</text>
<text x="150" y="98" text-anchor="middle" font-family="Consolas, monospace" font-size="18" fill="${ACID}" letter-spacing="6">CODE // ONLINE</text>
</g>
${skyline(p, 41, 2, x0 - 50, x1 + 50)}
${vSign(210, 470, 'OPEN', MAGENTA)}${vSign(1240, 430, 'NOODLE', ACID)}${vSign(470, 520, '24H', CYAN)}${vSign(1430, 520, 'DATA', MAGENTA)}
<g filter="url(#cNeon)"><rect x="980" y="600" width="150" height="40" fill="#05060a" fill-opacity=".7" stroke="${CYAN}" stroke-width="2"/><text x="1055" y="628" text-anchor="middle" font-family="Consolas, monospace" font-weight="bold" font-size="22" fill="${CYAN}">BAR//</text></g>
<rect x="${x0}" y="${street}" width="${x1 - x0}" height="${foot - street}" fill="url(#${p}street)"/>
<g filter="url(#${p}wet)">${reflections}</g>
<rect x="${x0}" y="${street}" width="${x1 - x0}" height="2" fill="${MAGENTA}" opacity=".5"/>
<g stroke="#9fdcff" stroke-opacity=".28" stroke-width="1" ${isAnimated ? 'class="rain"' : ''}>${rain}</g>
<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${foot - top}" fill="url(#${p}scan)" opacity=".5"/>
<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${foot - top}" fill="url(#${p}vig)"/>`
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
  for (const ar of [1.7, 1.8, 1.9, 2.0, 2.2, 2.4, 2.8, 3.4]) {
    const crop = Math.ceil((H - W / ar) / 2)
    rules.push(
      `@media (max-aspect-ratio:${Math.round(ar * 100)}/100) and (min-aspect-ratio:1600/1000){.pin-t{transform:translateY(${crop}px)}.pin-b{transform:translateY(-${crop}px)}}`,
    )
  }
  for (const ar of [1.5, 1.4, 1.3, 1.2, 1.0, 0.8, 0.6, 0.45]) {
    const crop = Math.ceil((W - H * ar) / 2)
    rules.push(
      `@media (min-aspect-ratio:${Math.round(ar * 100)}/100) and (max-aspect-ratio:1600/1000){.pin-l{transform:translateX(${crop}px)}.pin-r{transform:translateX(-${crop}px)}}`,
    )
  }
  return rules.reverse().join('')
}

export const sceneSvg = (s: DeskSettings): string => {
  const ground =
    s.wallpaper === 'city'
      ? `<g transform="translate(800 500) scale(${zoomOf(s)}) translate(-800 -500)">${cityArt('m', true, 4000)}</g>`
      : `<rect width="${W}" height="${H}" fill="${wallColor(s.wallpaper)}"/><rect width="${W}" height="${H}" fill="url(#vgrid)"/>`
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
  // A HUD taskbar: a dark bar with a doubled glitch edge, an angled acid-yellow
  // START tab, square quick-launch slots, an angled task tab and a status block.
  const taskbar = s.taskbar
    ? `<g class="pin-b"><g transform="translate(0,${H})">
<rect x="-1000" y="-36" width="${W + 2000}" height="36" fill="#05080d" fill-opacity=".9"/>
<rect x="-1000" y="-36" width="${W + 2000}" height="1.5" fill="${CYAN}"/><rect x="-1000" y="-33.5" width="${W + 2000}" height="1" fill="${MAGENTA}" opacity=".6"/>
<g class="pin-l"><g transform="translate(0,-32) scale(1.15)">
<path d="M0 0H86L96 13V25H0z" fill="${ACID}"/>
<path d="M90 25H96V19z" fill="#05080d"/>
<g transform="translate(6,4) scale(.55)">${ICONS.spark}</g>
<text x="27" y="17.5" font-family="Consolas, monospace" font-weight="bold" font-size="14" letter-spacing="2" fill="#05080d">START</text>
<g transform="translate(104,2) scale(.66)">${ICONS.globe}</g><g transform="translate(128,2) scale(.66)">${ICONS.folder}</g><g transform="translate(152,2) scale(.66)">${ICONS.terminal}</g>
<g transform="translate(180,0)"><path d="M8 0H170V17L162 25H0V8z" fill="#0b1018" stroke="${CYAN}" stroke-width="1.2"/><path d="M0 8L8 0" stroke="${ACID}" stroke-width="1.6"/><g transform="translate(6,3) scale(.58)">${ICONS.terminal}</g><text x="30" y="16.5" font-family="Consolas, monospace" font-size="11" letter-spacing="1" fill="#e8f6ff">CLAUDE_CODE</text><rect x="150" y="5" width="12" height="3" fill="${MAGENTA}" class="blink"/></g>
</g></g>
<g class="pin-r"><g transform="translate(${W - 172},-32) scale(1.15)">
<path d="M10 0H126V25H0V10z" fill="#0b1018" stroke="${MAGENTA}" stroke-width="1.2"/>
<path d="M8 18l3-6 3 3 3-8 3 5" stroke="${CYAN}" stroke-width="1.2" fill="none"/>
<text x="28" y="16.5" font-family="Consolas, monospace" font-size="11" letter-spacing="1" fill="${ACID}">SYS.READY<tspan class="blink">_</tspan></text></g></g>
</g></g>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs><pattern id="vgrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${CYAN}" stroke-opacity=".08"/></pattern></defs>
<style>.blink{animation:b 1.1s steps(1) infinite}@keyframes b{50%{opacity:0}}.rain{animation:rn .5s linear infinite}@keyframes rn{from{transform:translate(0,-60px)}to{transform:translate(-15px,0)}}.trail0{animation:t0 7s ease-in-out infinite alternate}@keyframes t0{to{transform:translateX(60px)}}.trail1{animation:t1 9s ease-in-out infinite alternate}@keyframes t1{to{transform:translateX(-70px)}}.glitch{animation:g 5s steps(1) infinite}@keyframes g{0%,92%,100%{transform:translate(560px,260px)}93%{transform:translate(566px,258px)}95%{transform:translate(554px,262px)}97%{transform:translate(561px,259px)}}${edgeRules()}</style>
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
    ? `<rect x="32" y="108" width="136" height="8" fill="#05080d"/><rect x="32" y="108" width="136" height=".8" fill="${CYAN}"/><path d="M32 109h14l3 3v4H32z" fill="${ACID}"/>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 156" width="200" height="156">
<path d="M28 6H180V122L172 130H20V14z" fill="#0b1018" stroke="${CYAN}"/>
${
    s.wallpaper === 'city'
      ? `<svg x="32" y="16" width="136" height="100" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">${cityArt('p', false)}</svg>`
      : `<rect x="32" y="16" width="136" height="100" fill="${wallColor(s.wallpaper)}"/>`
  }
${icons}
<path d="M74 34H140V76L134 80H70V38z" fill="#0b1018" stroke="${CYAN}"/><rect x="74" y="35" width="60" height="7" fill="${accentOf(s.scheme)}"/><rect x="133" y="35.5" width="6" height="5" fill="${RED}"/>
<rect x="76" y="48" width="58" height="26" fill="#111821" stroke="#2a3a4a"/>
${bar}
<path d="M86 130h28l4 12H82z" fill="#1a2230"/><rect x="66" y="142" width="68" height="8" fill="#1a2230"/></svg>`
}

export const iconSvg = (name: string, size = 20): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">${ICONS[name] ?? ''}</svg>`
