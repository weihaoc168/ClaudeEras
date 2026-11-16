// "Overlook": an original pixel-art night scene for Claude Blade, drawn on an
// 8-unit pixel grid with crisp edges. A hillside overlook above a neon city:
// a glowing moon, a rocket climbing on a smoke trail, searchlights, a big lit
// billboard screen, a power pylon with sagging wires, hover drones of its own
// design, and in front a dirt slope with grass, concrete blocks, cans and a
// parked neon bike. Drawn in a 1600x1000 box; with a bleed the sky and
// ground carry on past every edge so the art can be zoomed out.

const rand = (seed: number) => {
  let x = seed
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296
    return x / 4294967296
  }
}

const P = 8 // one art pixel
const px = (n: number): number => Math.round(n / P) * P

// A block of art pixels.
const b = (x: number, y: number, w: number, h: number, c: string, o = 1): string =>
  `<rect x="${px(x)}" y="${px(y)}" width="${Math.max(P, px(w))}" height="${Math.max(P, px(h))}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`

// A stepped pixel disc.
const disc = (cx: number, cy: number, r: number, c: string, o = 1): string => {
  const rows: string[] = []
  for (let dy = -r; dy <= r; dy += P) {
    const half = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)) / P) * P
    if (half > 0) rows.push(b(cx - half, cy + dy, half * 2, P, c, o))
  }
  return rows.join('')
}

// One tower: a body, a lit edge strip and a window texture (a tiled pattern,
// so the scene stays small), maybe with a rooftop light.
const tower = (r: () => number, x: number, top: number, w: number, base: number, body: string, edge: string, windows: string): string => {
  const parts = [b(x, top, w, base - top + 400, body), b(x + w - P, top, P, base - top, edge, 0.35), `<rect x="${px(x + 8)}" y="${px(top + 16)}" width="${Math.max(P, px(w - 24))}" height="${Math.max(P, px(base - top - 24))}" fill="url(#${windows})"/>`]
  if (r() > 0.5) parts.push(b(x + w / 2, top - 24, P, 24, body), b(x + w / 2, top - 32, P, P, '#ff3b4f'))
  return parts.join('')
}

// A 64x64 tile of window pixels in the given colors.
const windowTile = (id: string, seed: number, colors: string[], rate: number): string => {
  const r = rand(seed)
  const cells: string[] = []
  for (let yy = 0; yy < 64; yy += 16) {
    for (let xx = 0; xx < 64; xx += 16) {
      if (r() < rate) cells.push(`<rect x="${xx}" y="${yy}" width="8" height="8" fill="${colors[Math.floor(r() * colors.length)] ?? '#5ff0ff'}" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`)
    }
  }
  return `<pattern id="${id}" width="64" height="64" patternUnits="userSpaceOnUse">${cells.join('')}</pattern>`
}

// A hover drone of its own design: a dark lozenge hull, a cyan underglow and
// a red-blue beacon.
const drone = (x: number, y: number, k: number, isAnimated: boolean): string =>
  `<g transform="translate(${x},${y}) scale(${k})" ${isAnimated ? 'class="hover"' : ''}>${b(-40, 0, 80, 16, '#1b2236')}${b(-56, 8, 112, 16, '#2a3352')}${b(-48, 24, 96, 8, '#141a2c')}${b(-32, 8, 64, 8, '#3d4a74')}${b(-24, 32, 48, 8, '#00e5ff', 0.55)}${b(-16, -8, 16, 8, '#ff3b4f')}${b(0, -8, 16, 8, '#3b6bff')}${b(-72, 16, 16, 8, '#ffd27a')}${b(56, 16, 16, 8, '#ffd27a')}</g>`

// A neon bike of its own design: a long low dark frame traced in glowing cyan
// and magenta tubes, wheels with glowing rims and amber hubs, a swept-back
// smoked windscreen and a headlight throwing a soft beam ahead.
const ring = (cx: number, cy: number, r: number, c: string, o = 1): string => `${disc(cx, cy, r, c, o)}${disc(cx, cy, r - P, '#0b0d16')}`
const neonBike = (x: number, y: number, isAnimated: boolean): string =>
  `<g transform="translate(${x},${y})">
<polygon points="400,72 600,40 600,104 400,96" fill="#fff3c0" opacity=".12"/>
${ring(56, 112, 56, '#5ff0ff', 0.9)}${disc(56, 112, 24, '#ffb347')}${disc(56, 112, 8, '#0b0d16')}
${ring(352, 112, 56, '#ff5fae', 0.9)}${disc(352, 112, 24, '#ffb347')}${disc(352, 112, 8, '#0b0d16')}
${b(48, 56, 312, 32, '#10131f')}${b(96, 32, 144, 24, '#151a2a')}${b(232, 24, 96, 32, '#151a2a')}
${b(48, 48, 312, 8, '#5ff0ff', 0.95)}${b(48, 88, 312, 8, '#ff5fae', 0.9)}${b(96, 24, 136, 8, '#5ff0ff', 0.8)}
${b(320, -40, 16, 72, '#1a2033')}${b(304, -64, 64, 32, '#2a1a4a', 0.75)}${b(312, -64, 48, 8, '#ff5fae', 0.85)}
${b(368, 40, 32, 24, '#fff3c0')}${b(16, 48, 24, 16, '#ff3b4f')}
${b(144, 88, 112, 24, '#0b0d16')}${b(160, 96, 80, 8, '#ffb347', 0.8)}
<g ${isAnimated ? 'class="blink"' : ''}>${b(120, 32, 8, 8, '#e8f6ff')}${b(264, 32, 8, 8, '#e8f6ff')}</g>
${b(0, 168, 408, 8, '#5ff0ff', 0.25)}${b(16, 176, 376, 8, '#ff5fae', 0.15)}
</g>`

export const overlookArt = (p: string, isAnimated: boolean, bleed = 0): string => {
  const r = rand(2077 + 1)
  const x0 = -bleed
  const x1 = 1600 + bleed
  const top = -bleed
  const foot = 1000 + bleed
  // Sky in flat pixel bands, dark at the top to violet at the horizon.
  const bands = ['#070818', '#0a0c22', '#0e102c', '#131536', '#1a1842', '#22194e', '#2c1b5a', '#3a1d66']
  const sky = bands.map((c, i) => b(x0, i === 0 ? top : i * 80, x1 - x0, i === 0 ? 80 - top : 80, c)).join('') + b(x0, 640, x1 - x0, 80, '#4a2075')
  const stars = Array.from({ length: 70 }, () => b(r() * 1600, r() * 520, P, P, r() > 0.8 ? '#5ff0ff' : '#e8f0ff', 0.4 + r() * 0.6)).join('')
  // Moon with a stepped halo.
  const moon = `${disc(1152, 120, 104, '#5ff0ff', 0.08)}${disc(1152, 120, 80, '#5ff0ff', 0.14)}${disc(1152, 120, 56, '#c8f4ff')}${b(1128, 96, 16, 16, '#9ad8ea')}${b(1168, 128, 24, 16, '#9ad8ea')}${b(1136, 144, 8, 8, '#9ad8ea')}`
  // Rocket and its smoke trail.
  const smoke = Array.from({ length: 22 }, (_, i) => b(976 + Math.sin(i * 0.7) * 10 - i * 0.6, 344 + i * 16, 24 + i, 16, '#6b6680', 0.28 - i * 0.008)).join('')
  const rocket = `${smoke}<g ${isAnimated ? 'class="climb"' : ''}>${b(984, 168, 16, 128, '#d8dde8')}${b(976, 216, 32, 80, '#c0c6d4')}${b(984, 152, 16, 16, '#e8f0ff')}${b(968, 264, 16, 40, '#9aa2b4')}${b(1000, 264, 16, 40, '#9aa2b4')}${b(984, 304, 16, 24, '#ffb347')}${b(984, 328, 16, 16, '#ff6a2a')}${b(988, 344, 8, 8, '#ff3b4f')}</g>`
  // Searchlight beams from the left tower.
  const beams = `<polygon points="520,160 600,0 680,0 560,170" fill="#a6e8ff" opacity=".18"/><polygon points="530,170 260,0 330,0 560,175" fill="#ff8ad6" opacity=".1"/>`
  // City: far, mid and near towers with a violet haze between.
  // Towers only over the visible box and a small margin; past that the haze
  // and the hill carry the edges.
  const far: string[] = []
  for (let x = -160; x < 1760; x += 48 + Math.floor(r() * 4) * 16) far.push(tower(r, x, 360 + r() * 200, 48 + Math.floor(r() * 4) * 16, 760, '#16204a', '#5ff0ff', `${p}wf`))
  const mid: string[] = []
  for (let x = -160; x < 1760; x += 64 + Math.floor(r() * 5) * 16) mid.push(tower(r, x, 480 + r() * 160, 56 + Math.floor(r() * 5) * 16, 800, '#1c1440', '#ff5fae', `${p}wm`))
  const tiles = `<defs>${windowTile(`${p}wf`, 5, ['#5ff0ff', '#a98bff'], 0.3)}${windowTile(`${p}wm`, 9, ['#ff5fae', '#5ff0ff', '#ffb347', '#a98bff'], 0.38)}</defs>`
  const skyEdge = `${b(x0, 760, x1 - x0, 80, '#1c1440')}`
  const haze = `${b(x0, 560, x1 - x0, 64, '#7a2aa0', 0.18)}${b(x0, 624, x1 - x0, 96, '#a03ac0', 0.22)}${b(x0, 720, x1 - x0, 64, '#c060e0', 0.18)}${b(560, 600, 520, 160, '#ffffff', 0.06)}`
  // Big left tower with the billboard screen, and a neon column.
  const leftTower = `${b(80, 136, 448, 1000, '#141836')}${b(96, 120, 416, 32, '#1f2550')}${b(120, 168, 168, 64, '#0d2a3a')}${b(136, 184, 136, 8, '#5ff0ff', 0.8)}${b(136, 200, 96, 8, '#5ff0ff', 0.5)}${b(448, 168, 48, 520, '#ffe9a8', 0.85)}${b(456, 176, 32, 504, '#fff7d6', 0.7)}${b(376, 216, 24, 320, '#ff5fae', 0.6)}${b(560, 216, 200, 760, '#2a1450')}${b(576, 232, 16, 400, '#ff5fae', 0.7)}${b(664, 240, 72, 72, '#a98bff', 0.35)}${b(680, 256, 40, 40, '#5ff0ff', 0.6)}${b(624, 560, 120, 16, '#ff5fae', 0.85)}${b(608, 448, 96, 24, '#ff8ad6', 0.6)}`
  const screen = `${b(40, 344, 368, 312, '#0b1b2a')}${b(56, 360, 336, 280, '#5ff0ff', 0.92)}${b(72, 376, 56, 248, '#d8f8ff', 0.6)}${Array.from({ length: 9 }, (_, i) => b(144, 392 + i * 24, 120 + ((i * 37) % 90), 8, '#0b4a5a', 0.55)).join('')}${b(280, 392, 96, 16, '#ff8ad6', 0.7)}${b(184, 576, 192, 32, '#ff8ad6', 0.45)}${b(208, 616, 16, 400, '#11162a')}`
  // Right: pylon lattice and wires, and a neon sign.
  const pylon = `<g stroke="#2a2f45" stroke-width="8" fill="none" shape-rendering="crispEdges"><path d="M1488 1000L1520 120L1552 1000"/><path d="M1496 300H1544M1472 440H1568M1456 600H1584"/><path d="M1496 300L1544 440M1544 300L1496 440M1472 440L1568 600M1568 440L1472 600"/></g>${b(1512, 96, 16, 24, '#ff3b4f')}<path d="M1480 300Q1240 420 1400 460M1464 440Q1260 520 1420 560M1480 300Q1340 500 1560 600" stroke="#1a1f30" stroke-width="3" fill="none"/>`
  const rightSign = `${b(1280, 440, 160, 160, '#141a3a')}${disc(1360, 496, 32, '#ff5fae', 0.85)}${disc(1360, 496, 16, '#141a3a')}${b(1288, 552, 144, 16, '#ff8ad6', 0.8)}${b(1232, 456, 56, 112, '#ff5fae', 0.55)}${b(1240, 472, 40, 24, '#ffe9f5', 0.6)}`
  // Foreground hill: dirt, grass tufts, concrete blocks, cans, wrappers.
  const hill = `<path d="M${x0} 1000V760H0L160 720L320 760L560 800L800 808L1040 800L1200 776L1440 720L1600 640L${x1} 640V${foot}H${x0}z" fill="#2a1d1a" shape-rendering="crispEdges"/>${b(x0, 880, x1 - x0, foot - 880, '#3a2a22')}${b(560, 840, 680, 48, '#4a3528')}`
  const tufts = Array.from({ length: 34 }, () => {
    const x = r() * 1600
    const y = 760 + r() * 220
    return `${b(x, y, 8, 24, '#3f5a3a')}${b(x + 8, y - 8, 8, 32, '#5a7a4a')}${b(x - 8, y + 8, 8, 16, '#2f4a2f')}`
  }).join('')
  const blocks = `${b(648, 872, 152, 80, '#5a5f6e')}${b(664, 888, 48, 48, '#2a2d38')}${b(728, 888, 48, 48, '#2a2d38')}${b(648, 864, 152, 8, '#7a8090')}${b(840, 896, 168, 72, '#5a5f6e')}${b(856, 912, 56, 40, '#2a2d38')}${b(928, 912, 56, 40, '#2a2d38')}${b(840, 888, 168, 8, '#7a8090')}${b(1056, 872, 112, 56, '#4f5462')}${b(1056, 864, 112, 8, '#6f7484')}`
  const litter = `${b(960, 848, 16, 32, '#c0303a')}${b(960, 848, 16, 8, '#e8e8f0')}${b(1048, 976, 24, 40, '#c0303a')}${b(1144, 984, 32, 24, '#8aa0c0')}${b(640, 1000, 32, 24, '#c0303a')}${b(1200, 1016, 48, 32, '#e04a3a')}${b(1352, 1024, 64, 40, '#3a6ac0')}${b(864, 880, 56, 24, '#3a6ac0')}${b(744, 912, 32, 16, '#c0303a')}`
  // A low concrete wall behind the bike.
  const wall = `${b(1200, 688, 640, 160, '#3a3436')}${b(1200, 680, 640, 16, '#504a4c')}${b(1232, 720, 80, 48, '#2a2526')}`
  return `${tiles}<g shape-rendering="crispEdges">
${sky}${stars}${moon}${beams}${rocket}
${skyEdge}${far.join('')}${haze}${mid.join('')}
${drone(800, 344, 0.9, isAnimated)}${drone(1072, 392, 0.8, isAnimated)}${drone(1488, 248, 1.6, isAnimated)}${drone(1712, 368, 0.7, isAnimated)}
<g transform="translate(24,96) scale(.78)">${leftTower}${screen}</g>${pylon}${rightSign}
${hill}${wall}${tufts}${blocks}${litter}
<g transform="translate(1072,752) scale(.82)">${neonBike(0, 0, isAnimated)}</g>
</g>`
}
