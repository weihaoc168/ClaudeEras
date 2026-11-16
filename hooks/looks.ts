import type { ThemeSetArgs } from 'claude-code'

import type { DeskScheme, DeskSettings, DeskStyle, DeskWallpaper } from '../types'
import * as l98 from './look98'
import * as lcyber from './lookcyber'
import * as lneon from './lookneon'
import * as lxp from './lookxp'

// How a style dresses the mod's own windows, the Start band and its buttons.
// Button faces and the 98 close box use the app's inverse-text color, which
// follows the mode, so the app's own button text always stands out on them.
export type Chrome = {
  border: 'single' | 'round'
  buttonBorder: 'single' | 'round'
  body: string
  shadow: string
  frame: string
  buttonEdge: string
  selected: string
  close: string
  closeEdge: string
  startFace: string
  startEdge: string
  startLabel: string
  hover: string
  ink: string
  panel: string
  number: string
  error: string
  done: string
}

export type Look = {
  label: string
  chrome: Chrome
  SCHEME_OPTIONS: { value: DeskScheme; label: string }[]
  WALLPAPERS: { value: DeskWallpaper; label: string; color: string }[]
  ZOOMS: readonly { value: string; label: string }[]
  accentOf: (scheme: DeskScheme) => string
  allProblems: () => string[]
  blockingProblem: (scheme: DeskScheme) => string | undefined
  lookFor: (s: DeskSettings) => ThemeSetArgs
  sceneSvg: (s: DeskSettings) => string
  previewSvg: (s: DeskSettings) => string
  iconSvg: (name: string, size?: number) => string
}

const FACE = 'inverseText'

export const STYLES = {} as Record<DeskStyle, Look>
Object.assign(STYLES, {
  '98': {
    ...l98,
    ZOOMS: [],
    label: 'Windows 98',
    chrome: {
      border: 'single',
      buttonBorder: 'single',
      body: '#c0c0c0',
      shadow: '#808080',
      frame: '#000000',
      buttonEdge: '#000000',
      selected: '#000080',
      close: FACE,
      closeEdge: '#000000',
      startFace: FACE,
      startEdge: '#000000',
      startLabel: 'Start',
      hover: '#a8bce8',
      ink: '#000000',
      panel: '#ffffff',
      number: '#000080',
      error: '#b00000',
      done: '#404040',
    },
  },
  xp: {
    ...lxp,
    label: 'XP',
    chrome: {
      border: 'round',
      buttonBorder: 'round',
      body: '#ece9d8',
      shadow: '#7f9db9',
      frame: '#0831d9',
      buttonEdge: '#003c74',
      selected: '#316ac5',
      close: '#e0502a',
      closeEdge: '#ffffff',
      startFace: '#3c9a2f',
      startEdge: '#2b7a22',
      startLabel: 'start',
      hover: '#c1d2ee',
      ink: '#000000',
      panel: '#ffffff',
      number: '#000080',
      error: '#b00000',
      done: '#404040',
    },
  },
  neon: {
    ...lneon,
    label: 'Claude Neon',
    // Square 1998 window frames, rounded early-2000s buttons, start button and
    // close box, all lit in neon colors.
    chrome: {
      border: 'single',
      buttonBorder: 'round',
      body: '#170c2a',
      shadow: '#6a4a9a',
      frame: '#ff4fa3',
      buttonEdge: '#ff4fa3',
      selected: '#ffb347',
      close: '#ff7a3a',
      closeEdge: '#ffffff',
      startFace: '#ff4fa3',
      startEdge: '#b0236e',
      startLabel: 'start',
      hover: '#ff8cc6',
      ink: '#f6e9ff',
      panel: '#24143c',
      number: '#ffb347',
      error: '#ff6b8b',
      done: '#c9b6e4',
    },
  },
})

STYLES.cyber = {
  ...lcyber,
  label: 'Claude Blade',
  // Hard-edged HUD chrome: square frames in cyan, acid-yellow button edges,
  // a magenta selection and a red close box on near-black panels.
  chrome: {
    border: 'single',
    buttonBorder: 'single',
    body: '#0b0f14',
    shadow: '#2a3a4a',
    frame: '#00e5ff',
    buttonEdge: '#f5e642',
    selected: '#ff2bd6',
    close: '#ff3b4f',
    closeEdge: '#f5e642',
    startFace: FACE,
    startEdge: '#f5e642',
    startLabel: 'START',
    hover: '#00b8cc',
    ink: '#d8f6ff',
    panel: '#111821',
    number: '#f5e642',
    error: '#ff3b4f',
    done: '#7fa3b8',
  },
}

export const STYLE_OPTIONS = (Object.keys(STYLES) as DeskStyle[]).map(value => ({ value, label: STYLES[value].label }))

export const FACE_COLOR = FACE
