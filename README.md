<p align="center">
  <img src="assets/banner.jpg" alt="ClaudeEras: the Windows 98, XP and Claude Neon styles side by side" width="900">
</p>

<h1 align="center">🕰️ ClaudeEras</h1>

<p align="center"><strong>THREE DESKTOP ERAS, ONE MOD.</strong></p>

**ClaudeEras** combines [Claude 98](https://github.com/weihaoc168/Claude98), [ClaudeXP](https://github.com/weihaoc168/ClaudeXP) and Claude Neon into one Claude Code mod with a style switch. Each style brings its own wallpaper, icons, taskbar, window chrome and color schemes:

| Style | Desktop | Windows |
| --- | --- | --- |
| **Windows 98** | Classic plain teal (or an original Clouds sky, or a DOS prompt), pixel icons, grey taskbar with a tray clock | Square silver windows, black frames. Its System Monitor is the 1998 **Claude** chat window: File / Edit / View / Tools / Help, a You / tool-call log, a context (C:) pie with **Context Cleanup** (compact) and a low-space warning, and a `Connected at 49,333 bps` status bar |
| **XP** | A rolling green meadow, glossy icons, blue taskbar with a green start button | Cream windows, rounded blue frames, red close box |
| **Claude Neon** | A softly realistic pink, purple and orange sunset over the sea with palms, neon retro icons, a floating liquid-glass taskbar | Night-purple windows, hot-pink frames |

## ⚡ Install

```bash
claude plugin install claudeeras --marketplace weihaoc168/ClaudeEras
```

At the prompt of a terminal session: `/plugin install claudeeras --marketplace weihaoc168/ClaudeEras`. In the desktop app: click **+** next to the prompt box → **Plugins** → **Add marketplace** with `weihaoc168/ClaudeEras` → **Add plugin**.

Use it instead of the single-style mods, not alongside them: uninstall `claude98`, `claudexp` or `claudeneon` first.

## 🎛️ Switching styles

- **Display Properties** (`/display`) → **Background** → **Style**, then **OK** or **Apply**. The preview shows the style before you apply it.
- Or type `/style` to step through Windows 98 → XP → Claude Neon.

Switching a style resets the wallpaper to that style's own default; your scheme and effects carry over.

## ⌨️ Commands

| Command | What it does |
| --- | --- |
| `/display` | Display Properties: style, wallpaper, scheme, effects |
| `/style` | Switches to the next style |
| `/sysmon` | System Monitor |
| `/startmenu` | The Start menu |
| `/startband` | Shows or hides the Start band above the prompt |
| `/eras-check` | The current style, which screens the session draws on, and whether the theme reached them |

---

<p align="center"><sub>An original tribute. Not affiliated with or endorsed by Microsoft or any game publisher; all art is drawn from scratch.</sub></p>
