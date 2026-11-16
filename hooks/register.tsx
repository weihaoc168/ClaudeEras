import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { DeskCall, DeskMenu, DeskMonitorView, DeskScheme, DeskSettings, DeskStyle, DeskTab, DeskWallpaper, DeskZoom } from '../types'
import { FACE_COLOR, STYLES, STYLE_OPTIONS } from './looks'
import type { Chrome } from './looks'

const DISPLAY = 'display-properties'
const MONITOR = 'system-monitor'
const STORE_KEY = 'eras-v1'
const NAME = 'ClaudeEras'

const DEFAULTS: DeskSettings = { style: 'xp', scheme: 'standard', wallpaper: 'meadow', zoom: '65', icons: true, taskbar: true, startup: true, band: true }

const settings = atom({ plugin: 'claudeeras', key: 'settings' } as const, DEFAULTS, { shape: 'settings-1' })
const draft = atom({ plugin: 'claudeeras', key: 'draft' } as const, null, { shape: 'draft-1' })
const tab = atom({ plugin: 'claudeeras', key: 'tab' } as const, 'background' as DeskTab)
const calls = atom({ plugin: 'claudeeras', key: 'calls' } as const, [], { shape: 'calls-1' })
const isStartOpen = atom({ plugin: 'claudeeras', key: 'isStartOpen' } as const, false)
const monitorMenu = atom({ plugin: 'claudeeras', key: 'monitorMenu' } as const, null as DeskMenu | null)
const monitorView = atom({ plugin: 'claudeeras', key: 'monitorView' } as const, { bars: true, log: true } as DeskMonitorView, { shape: 'view-1' })

const WHITE = '#ffffff'
const FACE = FACE_COLOR

// Each style's default wallpaper and size, used when the style changes.
const STYLE_DEFAULTS: Record<DeskStyle, { wallpaper: DeskWallpaper; zoom: DeskZoom }> = {
  '98': { wallpaper: 'teal', zoom: '100' },
  xp: { wallpaper: 'meadow', zoom: '65' },
  neon: { wallpaper: 'coast', zoom: '100' },
}

type Ui = ReturnType<EngineInterface['ui']['resolve']>

// A push button drawn by the mod in the style's shape: the app's own text on a
// face that follows the mode, the style's selection color when active.
type WinButtonArgs = { id: string; label: string; isActive?: boolean; onPress: () => unknown }
const winButton = (ui: Ui, c: Chrome, a: WinButtonArgs) => {
  const { Box, Button } = ui
  return (
    <Box key={a.id} backgroundColor={FACE} borderStyle={c.buttonBorder} borderColor={a.isActive ? c.selected : c.buttonEdge} paddingX={1}>
      <Button key={`${a.id}-b`} plain label={a.isActive ? `▸ ${a.label}` : a.label} onPress={a.onPress} />
    </Box>
  )
}

// The small close box of a window's title bar, inset from its edges.
const closeBox = (ui: Ui, c: Chrome, id: string, onPress: () => unknown) => {
  const { Box, Button } = ui
  return (
    <Box key={id} backgroundColor={c.close} borderStyle={c.buttonBorder} borderColor={c.closeEdge} marginY="xs" marginRight="xs" paddingX="xs">
      <Button key={`${id}-b`} plain label="✕" onPress={onPress} />
    </Box>
  )
}

// Which surface last asked for the backdrop, for /eras-check.
let lastBackdrop: string | undefined

const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(v as T) ? (v as T) : fallback)

const sanitize = (raw: unknown): DeskSettings => {
  const v = (raw ?? {}) as Partial<DeskSettings>
  const style = pick<DeskStyle>(v.style, ['98', 'xp', 'neon'], DEFAULTS.style)
  const look = STYLES[style]
  return {
    style,
    scheme: pick<DeskScheme>(v.scheme, ['standard', 'rose', 'slate', 'eggplant'], DEFAULTS.scheme),
    wallpaper: pick<DeskWallpaper>(v.wallpaper, look.WALLPAPERS.map(w => w.value), STYLE_DEFAULTS[style].wallpaper),
    zoom: pick<DeskZoom>(v.zoom, ['100', '80', '65', '50'], STYLE_DEFAULTS[style].zoom),
    icons: typeof v.icons === 'boolean' ? v.icons : DEFAULTS.icons,
    taskbar: typeof v.taskbar === 'boolean' ? v.taskbar : DEFAULTS.taskbar,
    startup: typeof v.startup === 'boolean' ? v.startup : DEFAULTS.startup,
    band: typeof v.band === 'boolean' ? v.band : DEFAULTS.band,
  }
}

const applyLook = async ($: EngineInterface, s: DeskSettings): Promise<void> => {
  const look = STYLES[s.style]
  const unpainted = look.blockingProblem(s.scheme)
  if (unpainted !== undefined) {
    $.ui.toast(`${NAME}: ${unpainted}`)
  }
  const set = await $.theme.set(look.lookFor(s))
  $.ui.status(set.isDrawn ? `${NAME} ${look.label} - Ready (${s.wallpaper})` : `${NAME}: ${set.reason}`)
}

const commit = async ($: EngineInterface, s: DeskSettings): Promise<void> => {
  await update($, settings, () => s)
  await $.store.set(STORE_KEY, s)
  await applyLook($, s)
}

const withStyle = (s: DeskSettings, style: DeskStyle): DeskSettings => ({ ...s, style, ...STYLE_DEFAULTS[style] })

const openDisplay = async ($: EngineInterface, which?: DeskTab): Promise<void> => {
  const current = await read($, settings)
  await update($, draft, () => current)
  if (which !== undefined) {
    await update($, tab, () => which)
  }
  await $.ui.open({ id: DISPLAY, title: 'Display Properties' })
}

const openMonitor = async ($: EngineInterface): Promise<void> => {
  await $.ui.open({ id: MONITOR, title: 'System Monitor' })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const stored = sanitize(await $.store.get(STORE_KEY))
    await update($, settings, () => stored)
    await applyLook($, stored)

    await $.command.register({ name: 'display', description: `${NAME}: open Display Properties (style, wallpaper, color scheme, effects)` })
    await $.command.register({ name: 'style', description: `${NAME}: switch to the next style (Windows 98, XP, Neon Coast)` })
    await $.command.register({ name: 'sysmon', description: `${NAME}: open the System Monitor window` })
    await $.command.register({ name: 'startband', description: `${NAME}: show or hide the Start band above the prompt` })
    await $.command.register({ name: 'startmenu', description: `${NAME}: toggle the Start menu above the prompt` })
    await $.command.register({ name: 'eras-check', description: `${NAME}: show which screens this session draws on and whether the theme reached them` })

    if (stored.startup) {
      void openMonitor($)
    }
    return next(e)
  })

  // ---------------- commands ----------------

  on('command.run', { command: 'display' }, async $ => {
    await openDisplay($)
    return { text: 'Display Properties opened.' }
  })

  on('command.run', { command: 'style' }, async $ => {
    const s = await read($, settings)
    const order: DeskStyle[] = ['98', 'xp', 'neon']
    const nextStyle = order[(order.indexOf(s.style) + 1) % order.length] ?? 'xp'
    await commit($, withStyle(s, nextStyle))
    return { text: `Style: ${STYLES[nextStyle].label}. Run /style again for the next one.` }
  })

  on('command.run', { command: 'sysmon' }, async $ => {
    await openMonitor($)
    return { text: 'System Monitor opened.' }
  })

  on('command.run', { command: 'startband' }, async $ => {
    const s = await read($, settings)
    await commit($, { ...s, band: !s.band })
    return { text: s.band ? 'Start band hidden. Run /startband to show it again.' : 'Start band shown.' }
  })

  on('command.run', { command: 'startmenu' }, async $ => {
    await update($, isStartOpen, v => !v)
    return { text: 'Start menu toggled.' }
  })

  on('command.run', { command: 'eras-check' }, async $ => {
    const surfaces = await $.session.surfaces()
    const s = await read($, settings)
    const look = STYLES[s.style]
    const set = await $.theme.set(look.lookFor(s))
    return {
      text: [
        `Style: ${look.label}`,
        `Screens attached: ${surfaces.length === 0 ? 'none' : surfaces.join(', ')}`,
        `Theme: ${set.isDrawn ? 'accepted by an attached app' : `not drawn (${set.reason})`}`,
        `Backdrop last drawn on: ${lastBackdrop ?? 'nothing yet this load'}`,
        `Color contrast notes: ${look.allProblems().length}`,
      ].join('\n'),
    }
  })

  // ---------------- tool calls feed the System Monitor ----------------

  on('tool.call', async ($, e, next) => {
    const call: DeskCall = { id: e.tool_use_id, tool: e.tool, isDone: false, isError: false }
    await update($, calls, list => [...list, call].slice(-100))
    try {
      const ran = await next(e)
      const isError = typeof ran === 'object' && ran !== null && 'isError' in ran && Boolean((ran as { isError?: unknown }).isError)
      await update($, calls, list => list.map(c => (c.id === call.id ? { ...c, isDone: true, isError } : c)))
      return ran
    } catch (err) {
      await update($, calls, list => list.map(c => (c.id === call.id ? { ...c, isDone: true, isError: true } : c)))
      throw err
    }
  })

  // ---------------- the desktop backdrop ----------------

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const ui = $.ui.resolve(e)
    if (!('Svg' in ui)) {
      return next(e)
    }
    const { Svg } = ui
    const s = await read($, settings)
    const look = STYLES[s.style]
    lastBackdrop = e.surface
    $.ui.status(`${NAME} ${look.label} - Ready (${s.wallpaper}, scene drawn on ${e.surface})`)
    return <Svg source={look.sceneSvg(s)} alt={`A ${look.label} style desktop with icons and a taskbar`} isInteractive />
  })

  // ---------------- Start menu band above the prompt ----------------

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, settings)
    if (e.props.hasSurvey || !s.band) {
      return next(e)
    }
    const ui = $.ui.resolve(e)
    const { Box, Button, Text } = ui
    const Svg = 'Svg' in ui ? ui.Svg : undefined
    const isOpen = await read($, isStartOpen)
    const look = STYLES[s.style]
    const c = look.chrome
    const isGraphic = Svg !== undefined && (e.surface === 'desktop' || e.surface === 'mobile')
    const icon = (name: string) => (isGraphic ? <Svg source={look.iconSvg(name, 16)} alt="" width={16} height={16} /> : null)

    const item = (key: string, name: string, label: string, run: () => Promise<void> | void) => (
      <Box key={`row-${key}`} flexDirection="row" alignItems="center" gap="xs" paddingX={1} hover={{ backgroundColor: c.hover }}>
        {icon(name)}
        <Button
          key={key}
          plain
          label={label}
          onPress={async () => {
            await update($, isStartOpen, () => false)
            await run()
          }}
        />
      </Box>
    )

    return (
      <Box flexDirection="column">
        {isOpen && (
          <Box flexDirection="row" borderStyle={c.border} borderColor={c.frame} backgroundColor={c.body}>
            <Box backgroundColor={look.accentOf(s.scheme)} paddingX={1} justifyContent="flex-end">
              <Text color={WHITE} weight="bold">
                {NAME}
              </Text>
            </Box>
            <Box flexDirection="column" paddingY={1} flexGrow={1} backgroundColor={FACE}>
              {item('sm-monitor', 'monitor', 'System Monitor', () => openMonitor($))}
              {item('sm-display', 'display', 'Display Properties...', () => openDisplay($, 'background'))}
              {item('sm-scheme', 'folder', 'Appearance...', () => openDisplay($, 'appearance'))}
              {item('sm-effects', 'computer', 'Effects...', () => openDisplay($, 'effects'))}
              {item('sm-shutdown', 'bin', 'Shut Down...', async () => {
                await $.ui.close({ id: DISPLAY })
                await $.ui.close({ id: MONITOR })
                $.ui.toast('It is now safe to keep working.')
              })}
            </Box>
          </Box>
        )}
        <Box flexDirection="row" alignItems="center" gap="xs">
          {icon('spark')}
          <Box key="start-box" backgroundColor={c.startFace} borderStyle={c.buttonBorder} borderColor={isOpen ? WHITE : c.startEdge} paddingX={1}>
            <Button key="start" plain label={isOpen ? `${c.startLabel} ▾` : c.startLabel} onPress={() => update($, isStartOpen, v => !v)} />
          </Box>
          <Button key="qs-monitor" label="System Monitor" dimColor onPress={() => openMonitor($)} />
          <Button key="qs-display" label="Display" dimColor onPress={() => openDisplay($)} />
        </Box>
      </Box>
    )
  })

  // ---------------- System Monitor window ----------------

  on('ui.render', { component: 'Pane', requestId: MONITOR }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const Svg = 'Svg' in ui ? ui.Svg : undefined
    const list = await read($, calls)
    const s = await read($, settings)
    const look = STYLES[s.style]
    const c = look.chrome
    const isGraphic = Svg !== undefined && (e.surface === 'desktop' || e.surface === 'mobile')
    const running = list.filter(x => !x.isDone).length
    const failed = list.filter(x => x.isError).length
    const room = Math.max(3, (e.viewport?.rows ?? 24) - 10)
    const counts = new Map<string, number>()
    for (const x of list) counts.set(x.tool, (counts.get(x.tool) ?? 0) + 1)
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    const max = top[0]?.[1] ?? 1
    const menu = await read($, monitorMenu)
    const view = await read($, monitorView)
    const summary = [
      `${NAME} System Monitor: ${list.length} calls, ${running} running, ${failed} errors`,
      ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tool, n]) => `${tool}: ${n}`),
    ].join('\n')
    const menuButton = (key: DeskMenu, label: string) =>
      winButton(ui, c, { id: `menu-${key}`, label, isActive: menu === key, onPress: () => update($, monitorMenu, cur => (cur === key ? null : key)) })
    // A menu item runs its action, then closes the menu (a toggle keeps it open).
    const item = (key: string, label: string, run: (press: { surface: typeof e.surface }) => unknown, keepOpen = false) => (
      <Button
        key={key}
        plain
        label={label}
        onPress={async press => {
          if (!keepOpen) await update($, monitorMenu, () => null)
          await run(press)
        }}
      />
    )

    return (
      <Box flexDirection="column" borderStyle={c.border} borderColor={c.frame} backgroundColor={c.body}>
        <Box flexDirection="row" backgroundColor={look.accentOf(s.scheme)} paddingX={1} alignItems="center" gap="xs">
          {isGraphic && <Svg source={look.iconSvg('monitor', 16)} alt="" width={16} height={16} />}
          <Box flexGrow={1}>
            <Text color={WHITE} weight="bold">
              System Monitor
            </Text>
          </Box>
          {closeBox(ui, c, 'mon-close', () => $.ui.close({ id: MONITOR }))}
        </Box>
        <Box flexDirection="row" paddingX={1} paddingY={1} gap={2} alignItems="center">
          {menuButton('file', 'File')}
          {menuButton('edit', 'Edit')}
          {menuButton('view', 'View')}
          <Box flexGrow={1} />
          {winButton(ui, c, { id: 'mon-clear', label: 'Clear', onPress: () => update($, calls, () => []) })}
        </Box>
        {menu !== null && (
          <Box flexDirection="column" marginX={1} padding={1} backgroundColor={FACE} borderStyle="single" borderColor={c.buttonEdge} gap="xs">
            {menu === 'file' && [
              item('m-clear', 'Clear log', () => update($, calls, () => [])),
              item('m-close', 'Close', () => $.ui.close({ id: MONITOR })),
            ]}
            {menu === 'edit' && [
              item('m-copy', 'Copy summary', async press => {
                const r = await $.ui.copy({ text: summary, surface: press.surface })
                $.ui.toast(r.isCopied ? 'System Monitor summary copied.' : 'Could not copy the summary.')
              }),
            ]}
            {menu === 'view' && [
              item('m-bars', `${view.bars ? '[x]' : '[ ]'} Usage bars`, () => update($, monitorView, v => ({ ...v, bars: !v.bars })), true),
              item('m-log', `${view.log ? '[x]' : '[ ]'} Call log`, () => update($, monitorView, v => ({ ...v, log: !v.log })), true),
              item('m-display', 'Display Properties...', () => openDisplay($)),
            ]}
          </Box>
        )}
        {view.bars && (
          <Box flexDirection="column" margin={1} padding={1} gap={1} backgroundColor={c.panel} borderStyle="single" borderColor={c.shadow}>
            <Text color={c.ink} weight="bold">
              Tool usage
            </Text>
            {top.length === 0 && <Text color={c.shadow}>No tool calls yet.</Text>}
            {top.map(([tool, n]) => (
              <Box key={`bar-${tool}`} flexDirection="row" gap={1} alignItems="center">
                <Box width={14}>
                  <Text color={c.ink} wrap="truncate">
                    {tool}
                  </Text>
                </Box>
                {/* Drawn by hand, not with Progress: its label takes the app's own
                    text color, which can vanish on this panel. */}
                <Box flexGrow={1} flexDirection="row" borderStyle="single" borderColor={c.shadow}>
                  <Box flexGrow={n} backgroundColor={look.accentOf(s.scheme)}>
                    <Text color={look.accentOf(s.scheme)}> </Text>
                  </Box>
                  {n < max && (
                    <Box flexGrow={max - n} backgroundColor={c.panel}>
                      <Text color={c.panel}> </Text>
                    </Box>
                  )}
                </Box>
                <Box width={4}>
                  <Text color={c.number} weight="bold">
                    {`${n}`}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        )}
        {view.log && (
          <Box flexDirection="column" marginX={1} paddingX={1} backgroundColor={c.panel} borderStyle="single" borderColor={c.shadow}>
            {list.slice(-room).map(x => (
              <Text key={`c-${x.id}`} color={x.isError ? c.error : x.isDone ? c.done : c.ink} wrap="truncate">
                {x.isDone ? (x.isError ? '[!!]' : '[ok]') : '[..]'} {x.tool}
              </Text>
            ))}
          </Box>
        )}
        <Box flexDirection="row" paddingX={1} gap={2} borderStyle="single" borderColor={c.shadow}>
          <Text color={c.ink}>{list.length} calls</Text>
          <Text color={c.ink}>{running} running</Text>
          <Text color={failed > 0 ? c.error : c.ink}>{failed} errors</Text>
        </Box>
      </Box>
    )
  })

  // ---------------- Display Properties window (the settings) ----------------

  on('ui.render', { component: 'Pane', requestId: DISPLAY }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text, Select } = ui
    const Svg = 'Svg' in ui ? ui.Svg : undefined
    const saved = await read($, settings)
    const d = (await read($, draft)) ?? saved
    const t = await read($, tab)
    // The window wears the saved style; the preview and lists follow the draft.
    const c = STYLES[saved.style].chrome
    const look = STYLES[d.style]
    const isGraphic = Svg !== undefined && (e.surface === 'desktop' || e.surface === 'mobile')
    const isDirty = JSON.stringify(d) !== JSON.stringify(saved)

    const setDraft = (patch: Partial<DeskSettings>) => update($, draft, cur => ({ ...(cur ?? saved), ...patch }))
    const tabButton = (key: DeskTab, label: string) =>
      winButton(ui, c, { id: `tab-${key}`, label, isActive: t === key, onPress: () => update($, tab, () => key) })
    const check = (key: string, label: string, value: boolean, patch: (v: boolean) => Partial<DeskSettings>) =>
      winButton(ui, c, { id: key, label: `${value ? '[x]' : '[ ]'} ${label}`, onPress: () => setDraft(patch(!value)) })

    const body =
      t === 'background' ? (
        <Box flexDirection="column" gap={1}>
          <Text color={c.ink}>Style</Text>
          <Select
            key="style"
            label="Style:"
            options={STYLE_OPTIONS}
            value={d.style}
            onSelect={v => update($, draft, cur => withStyle(cur ?? saved, v as DeskStyle))}
          />
          <Text color={c.ink}>Wallpaper</Text>
          <Select
            key="wallpaper"
            label="Pattern:"
            options={look.WALLPAPERS.map(w => ({ value: w.value, label: w.label }))}
            value={d.wallpaper}
            onSelect={v => setDraft({ wallpaper: v as DeskWallpaper })}
          />
          {look.ZOOMS.length > 0 && (
            <Select
              key="zoom"
              label="Wallpaper size:"
              options={look.ZOOMS.map(z => ({ value: z.value, label: z.label }))}
              value={d.zoom}
              onSelect={v => setDraft({ zoom: v as DeskZoom })}
            />
          )}
        </Box>
      ) : t === 'appearance' ? (
        <Box flexDirection="column" gap={1}>
          <Text color={c.ink}>Scheme</Text>
          <Select key="scheme" label="Scheme:" options={look.SCHEME_OPTIONS} value={d.scheme} onSelect={v => setDraft({ scheme: v as DeskScheme })} />
          <Box flexDirection="column" borderStyle="single" borderColor={c.shadow}>
            <Box backgroundColor={look.accentOf(d.scheme)} paddingX={1}>
              <Text color={WHITE} weight="bold">
                Active Window
              </Text>
            </Box>
            <Box paddingX={1} backgroundColor={c.panel}>
              <Text color={c.ink}>Window Text</Text>
            </Box>
          </Box>
          <Text color={c.shadow} size="caption">
            Each style has its own dark-mode version of the scheme.
          </Text>
        </Box>
      ) : (
        <Box flexDirection="column" gap={1}>
          <Text color={c.ink}>Visual effects</Text>
          {check('fx-icons', 'Show desktop icons', d.icons, v => ({ icons: v }))}
          {check('fx-taskbar', 'Show taskbar', d.taskbar, v => ({ taskbar: v }))}
          {check('fx-startup', 'Open System Monitor at startup', d.startup, v => ({ startup: v }))}
          {check('fx-band', 'Show Start band above the prompt', d.band, v => ({ band: v }))}
        </Box>
      )

    return (
      <Box flexDirection="column" borderStyle={c.border} borderColor={c.frame} backgroundColor={c.body}>
        <Box flexDirection="row" backgroundColor={STYLES[saved.style].accentOf(saved.scheme)} paddingX={1} alignItems="center" gap="xs">
          {isGraphic && <Svg source={STYLES[saved.style].iconSvg('display', 16)} alt="" width={16} height={16} />}
          <Box flexGrow={1}>
            <Text color={WHITE} weight="bold">
              Display Properties
            </Text>
          </Box>
          {closeBox(ui, c, 'dp-x', () => $.ui.close({ id: DISPLAY }))}
        </Box>
        <Box flexDirection="row" paddingX={1} paddingTop={1} gap={2}>
          {tabButton('background', 'Background')}
          {tabButton('appearance', 'Appearance')}
          {tabButton('effects', 'Effects')}
        </Box>
        <Box flexDirection="column" margin={1} padding={1} borderStyle="single" borderColor={c.shadow} gap={1}>
          {isGraphic && (
            <Box justifyContent="center">
              <Svg source={look.previewSvg(d)} alt="Preview of the desktop with these settings" width={200} height={156} />
            </Box>
          )}
          {body}
        </Box>
        <Box flexDirection="row" justifyContent="flex-end" gap={2} paddingX={1} paddingY={1}>
          {winButton(ui, c, {
            id: 'dp-ok',
            label: 'OK',
            isActive: true,
            onPress: async () => {
              await commit($, d)
              await $.ui.close({ id: DISPLAY })
            },
          })}
          {winButton(ui, c, {
            id: 'dp-cancel',
            label: 'Cancel',
            onPress: async () => {
              await update($, draft, () => null)
              await $.ui.close({ id: DISPLAY })
            },
          })}
          {winButton(ui, c, { id: 'dp-apply', label: isDirty ? 'Apply' : 'Apply (saved)', onPress: () => commit($, d) })}
        </Box>
      </Box>
    )
  })
}
